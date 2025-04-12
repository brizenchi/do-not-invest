import aiohttp
import json
from langchain import LLMChain, PromptTemplate
from pydantic import BaseModel

# AI 提示模板
PROMPT = """
将以下投资策略转换为 MoveFlow 投资请求 JSON：
"{strategy}"

输出格式：
{
  "action": "create_stream|create_event_stream|trigger_event",
  "sender": "0xUserAddress",
  "recipient": "0xProtocolAddress",
  "amount": <integer>,
  "rate_per_second": <integer>,
  "duration": <integer>,
  "condition": "<string>"
}
"""

class InvestmentRequest(BaseModel):
    action: str
    sender: str
    recipient: str
    amount: int
    rate_per_second: int = 0
    duration: int = 0
    condition: str = ""

class InvestmentAgent:
    def __init__(self, server_url="http://localhost:8000/invest"):
        self.server_url = server_url
        # 假设 LLM（实际替换为 Claude 或 Llama）
        self.llm = LLMChain(
            prompt=PromptTemplate(input_variables=["strategy"], template=PROMPT)
        )

    async def process_strategy(self, strategy: str, user_address: str):
        # AI 解析策略
        request_json = self.llm.run(strategy=strategy)
        request_data = json.loads(request_json)
        request_data["sender"] = user_address  # 注入用户地址

        # 验证请求
        request = InvestmentRequest(**request_data)

        # 发送请求到 MCP Server
        async with aiohttp.ClientSession() as session:
            async with session.post(self.server_url, json=request.dict()) as resp:
                response = await resp.json()
                if response.get("status") == "success":
                    return f"投资流已创建，交易哈希：{response.get('tx_hash')}"
                return f"错误：{response.get('message')}"

# 使用示例
async def main():
    agent = InvestmentAgent()
    strategy = "每周投资 100 USDT 到 Amnis Finance"
    user_address = "0xUserAddress"
    result = await agent.process_strategy(strategy, user_address)
    print(result)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())