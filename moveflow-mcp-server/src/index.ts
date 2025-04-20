import express from "express";
import { AptosClient, FaucetClient, AptosAccount, Types } from "aptos";
import bodyParser from "body-parser";

// 配置测试网
const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";
const MOVEFLOW_CONTRACT_ADDRESS = "0xYOUR_MOVEFLOW_CONTRACT_ADDRESS";

// 初始化 Aptos 客户端
const aptosClient = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// 初始化 Express
const app = express();
app.use(bodyParser.json());

// 接口定义
interface StreamParams {
  recipientAddr: string;
  depositAmount: number;
  startTime: number;
  stopTime: number;
  interval: number;
}

interface StreamResult {
  incoming: any[];
  outgoing: any[];
}

// 工具实现
async function create_stream(params: StreamParams): Promise<string> {
  try {
    const sender = new AptosAccount();
    await faucetClient.fundAccount(sender.address(), 100_000_000);

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${MOVEFLOW_CONTRACT_ADDRESS}::stream::create_stream`,
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [
        params.recipientAddr,
        params.depositAmount,
        params.startTime,
        params.stopTime,
        params.interval,
        "Test Payment",
        "Debug balance",
        true,
        true,
        true
      ]
    };

    const txnRequest = await aptosClient.generateTransaction(sender.address(), payload);
    const signedTxn = await aptosClient.signTransaction(sender, txnRequest);
    const tx = await aptosClient.submitTransaction(signedTxn);
    await aptosClient.waitForTransaction(tx.hash);
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to create stream: ${error.message}`);
  }
}

async function get_streams(address: string): Promise<StreamResult> {
  try {
    const resourceType = `${MOVEFLOW_CONTRACT_ADDRESS}::stream::StreamStore`;
    const resources = await aptosClient.getAccountResources(address);
    const streamStore = resources.find((r) => r.type === resourceType);

    if (!streamStore) {
      return { incoming: [], outgoing: [] };
    }

    const data = streamStore.data as any;
    return {
      incoming: data.incoming_streams || [],
      outgoing: data.outgoing_streams || []
    };
  } catch (error: any) {
    throw new Error(`Failed to get streams: ${error.message}`);
  }
}

// MCP 端点
app.get("/tools", (req, res) => {
  res.json([
    {
      name: "create_stream",
      description: "Create a stream payment on Aptos",
      parameters: {
        recipientAddr: { type: "string" },
        depositAmount: { type: "number" },
        startTime: { type: "number" },
        stopTime: { type: "number" },
        interval: { type: "number" }
      },
      returns: { type: "string" }
    },
    {
      name: "get_streams",
      description: "Get incoming and outgoing streams for an address",
      parameters: { address: { type: "string" } },
      returns: {
        type: "object",
        properties: {
          incoming: { type: "array" },
          outgoing: { type: "array" }
        }
      }
    }
  ]);
});

app.post("/call", async (req, res) => {
  const { tool, parameters } = req.body;
  try {
    if (tool === "create_stream") {
      const result = await create_stream(parameters);
      res.json({ result });
    } else if (tool === "get_streams") {
      const result = await get_streams(parameters.address);
      res.json({ result });
    } else {
      res.status(400).json({ error: "Unknown tool" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`MoveFlow MCP Server running at http://localhost:${PORT}`);
});