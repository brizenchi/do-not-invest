import { AptosClient, FaucetClient, AptosAccount, Types } from "aptos";

// 配置测试网
const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";
const MOVEFLOW_CONTRACT_ADDRESS = "0xYOUR_MOVEFLOW_CONTRACT_ADDRESS"; // 替换为测试网地址

// 初始化客户端
const aptosClient = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// 创建并资助账户
async function createAccount(): Promise<AptosAccount> {
  const account = new AptosAccount();
  await faucetClient.fundAccount(account.address(), 100_000_000); // 1 APT
  console.log(`账户 ${account.address().toString()} 已资助 1 APT`);
  return account;
}

// 查询余额
async function getBalance(address: string): Promise<number> {
  try {
    const resource = await aptosClient.getAccountResource(
      address,
      "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    return parseInt((resource.data as any).coin.value);
  } catch (error) {
    console.warn(`查询余额失败，假设为 0: ${error}`);
    return 0;
  }
}

// 创建流支付
interface StreamParams {
  recipientAddr: string;
  depositAmount: number;
  startTime: number;
  stopTime: number;
  interval: number;
}

async function createStream(sender: AptosAccount, params: StreamParams): Promise<string> {
  try {
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
    throw new Error(`创建流支付失败: ${error.message}`);
  }
}

// 查询流支付
async function getStreams(address: string): Promise<{ incoming: any[]; outgoing: any[] }> {
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
    throw new Error(`查询流支付失败: ${error.message}`);
  }
}

// 等待函数
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 主函数
async function main() {
  try {
    // 创建测试账号
    console.log("创建测试账号...");
    const sender = await createAccount();
    const recipient = await createAccount();

    console.log("发送者地址:", sender.address().toString());
    console.log("接收者地址:", recipient.address().toString());

    // 检查初始余额
    let recipientBalance = await getBalance(recipient.address().toString());
    console.log("接收者初始余额:", recipientBalance / 1_000_000, "APT");

    // 创建流支付
    const now = Math.floor(Date.now() / 1000);
    const streamParams: StreamParams = {
      recipientAddr: recipient.address().toString(),
      depositAmount: 1_000_000, // 0.01 APT
      startTime: now,
      stopTime: now + 3600, // 1小时
      interval: 60 // 每60秒
    };

    const streamTx = await createStream(sender, streamParams);
    console.log("流支付创建成功，交易哈希:", streamTx);

    // 立即检查余额
    recipientBalance = await getBalance(recipient.address().toString());
    console.log("创建后立即接收者余额:", recipientBalance / 1_000_000, "APT");

    // 查询流支付
    const senderStreams = await getStreams(sender.address().toString());
    const recipientStreams = await getStreams(recipient.address().toString());
    console.log("发送者流出支付:", senderStreams.outgoing);
    console.log("接收者流入支付:", recipientStreams.incoming);

    // 等待 2 分钟，检查余额
    console.log("等待 2 分钟以累积流支付...");
    await sleep(120_000);
    recipientBalance = await getBalance(recipient.address().toString());
    console.log("2 分钟后接收者余额:", recipientBalance / 1_000_000, "APT");

  } catch (error: any) {
    console.error("错误:", error.message);
  }
}

main().catch(console.error);