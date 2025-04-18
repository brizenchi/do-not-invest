#!/bin/bash

CONTRACT="0x2455f6eb3e9d4b02f5d54c7447d7b268b989b5fa26e745c0d91f2b1bf2aa3e48"
SENDER_PROFILE="default"
RECIPIENT_PROFILE="recipient"
RECIPIENT_ADDR="0xRecipient" # 替换为实际地址
STREAM_ID=0

# 1. 初始化
echo "Initializing contract..."
aptos move run --function-id ${CONTRACT}::stream::initialize --network testnet --profile ${SENDER_PROFILE}

# 2. 创建流
echo "Creating stream..."
aptos move run --function-id ${CONTRACT}::stream::create_stream --args address:${RECIPIENT_ADDR} u64:10000000000 u64:165 u64:604800 --network testnet --profile ${SENDER_PROFILE}

# 3. 查询状态
echo "Checking stream status..."
aptos move view --function-id ${CONTRACT}::stream::get_stream_status --args u64:${STREAM_ID} address:${CONTRACT} --network testnet

# 4. Recipient 提取
echo "Recipient claiming..."
aptos move run --function-id ${CONTRACT}::stream::claim --args u64:${STREAM_ID} --network testnet --profile ${RECIPIENT_PROFILE}

# 5. 再次查询状态
echo "Checking stream status after claim..."
aptos move view --function-id ${CONTRACT}::stream::get_stream_status --args u64:${STREAM_ID} address:${CONTRACT} --network testnet

# 6. 终止流
echo "Canceling stream..."
aptos move run --function-id ${CONTRACT}::stream::cancel_stream --args u64:${STREAM_ID} --network testnet --profile ${SENDER_PROFILE}

# 7. 查询状态
echo "Checking stream status after cancel..."
aptos move view --function-id ${CONTRACT}::stream::get_stream_status --args u64:${STREAM_ID} address:${CONTRACT} --network testnet

# 8. 提取剩余资金
echo "Withdrawing remaining funds..."
aptos move run --function-id ${CONTRACT}::stream::withdraw_remaining --args u64:${STREAM_ID} --network testnet --profile ${SENDER_PROFILE}

# 9. 最终查询状态
echo "Final stream status..."
aptos move view --function-id ${CONTRACT}::stream::get_stream_status --args u64:${STREAM_ID} address:${CONTRACT} --network testnet