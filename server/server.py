from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from aptos_sdk.client import RestClient
import aiohttp
import json

app = FastAPI()
APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1"
client = RestClient(APTOS_NODE_URL)
CONTRACT_ADDRESS = "0xInvestmentFlow"  # 替换为实际合约地址

# 请求模型
class InvestmentRequest(BaseModel):
    action: str
    sender: str
    recipient: str  # DeFi 协议地址
    amount: int
    rate_per_second: int = 0
    duration: int = 0
    condition: str = ""

# 创建投资流
@app.post("/invest")
async def invest(request: InvestmentRequest):
    if request.action not in ["create_stream", "create_event_stream", "trigger_event", "get_status"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    try:
        if request.action == "create_stream":
            payload = {
                "function": f"{CONTRACT_ADDRESS}::stream::create_stream",
                "type_arguments": [],
                "arguments": [
                    request.recipient,
                    request.amount,
                    request.rate_per_second,
                    request.duration
                ]
            }
            tx_hash = client.submit_transaction(request.sender, payload)
            return {"status": "success", "tx_hash": tx_hash}

        elif request.action == "create_event_stream":
            payload = {
                "function": f"{CONTRACT_ADDRESS}::stream::create_event_stream",
                "type_arguments": [],
                "arguments": [
                    request.recipient,
                    request.amount,
                    request.condition.encode()
                ]
            }
            tx_hash = client.submit_transaction(request.sender, payload)
            return {"status": "success", "tx_hash": tx_hash}

        elif request.action == "trigger_event":
            # 查询外部数据（示例：DeFi APY）
            async with aiohttp.ClientSession() as session:
                resp = await session.get("https://api.coingecko.com/api/v3/coins/aptos")  # 假设获取 APY
                data = await resp.json()
                apy = data.get("market_data", {}).get("apy", 0)  # 假设字段
                condition = "apy_above_5" if apy > 5 else "apy_below_5"

            payload = {
                "function": f"{CONTRACT_ADDRESS}::stream::trigger_event",
                "arguments": [request.stream_id, condition.encode()]
            }
            tx_hash = client.submit_transaction(request.sender, payload)
            return {"status": "success", "tx_hash": tx_hash}

        elif request.action == "get_status":
            stream_data = client.account_resource(
                CONTRACT_ADDRESS,
                f"{CONTRACT_ADDRESS}::stream::Stream",
                request.stream_id
            )
            return {
                "is_active": stream_data["is_active"],
                "total_amount": stream_data["total_amount"],
                "released_amount": stream_data["released_amount"],
                "recipient": stream_data["recipient"]
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket 实时状态
@app.websocket("/stream_status")
async def stream_status(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        request = json.loads(data)
        stream_id = request.get("stream_id")
        stream_data = client.account_resource(
            CONTRACT_ADDRESS,
            f"{CONTRACT_ADDRESS}::stream::Stream",
            stream_id
        )
        await websocket.send_json({
            "stream_id": stream_id,
            "is_active": stream_data["is_active"],
            "released_amount": stream_data["released_amount"]
        })