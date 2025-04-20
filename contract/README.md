
### 生成本地配置 地址 领取测试币
```sh
aptos init --network testnet --profile account_a
aptos init --network testnet --profile account_b
aptos init --network testnet --profile account_c
```
### 查询余额
>领取测试币 https://aptos.dev/en/network/faucet
```sh
aptos account balance --account 81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d
aptos account balance --account 2bd2644b9d0a3baa63e4ea40ee645dd22082f199e471f9276162bea50d3114dc
```

### compile result
```sh
aptos move compile --package-dir . --named-addresses InvestmentFlow=81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d
```
```json
{
  "Result": [
    "81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d::Stream::Stream"
  ]
}
```
### 发布合约
```sh
aptos move publish --package-dir . --named-addresses InvestmentFlow=81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d --profile default
```
Transaction submitted: https://explorer.aptoslabs.com/txn/0x53728f14ac76da9f6528f007e196e54bf864bf6947804ff52832ac0fa11a2c87?network=testnet
```json
{
  "Result": {
    "transaction_hash": "0x53728f14ac76da9f6528f007e196e54bf864bf6947804ff52832ac0fa11a2c87",
    "gas_used": 85,
    "gas_unit_price": 100,
    "sender": "aa9f614147e95ce6f4b5c39f23da7046e7fe327e4a2c6f1624eb56dfcc88953c",
    "sequence_number": 6,
    "success": true,
    "timestamp_us": 1744508433447523,
    "version": 6684216664,
    "vm_status": "Executed successfully"
  }
}
```

### 初始化合约
```sh
aptos move run --function-id 81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d::Stream::initialize --profile default
```
Transaction submitted: https://explorer.aptoslabs.com/txn/0xbeda259536091f5ff6a6ddf0dc0c0a7168b4f83c5f0ae3139f3d6ca597746a93?network=testnet
```json
{
  "Result": {
    "transaction_hash": "0xbeda259536091f5ff6a6ddf0dc0c0a7168b4f83c5f0ae3139f3d6ca597746a93",
    "gas_used": 875,
    "gas_unit_price": 100,
    "sender": "aa9f614147e95ce6f4b5c39f23da7046e7fe327e4a2c6f1624eb56dfcc88953c",
    "sequence_number": 1,
    "success": true,
    "timestamp_us": 1744467217950928,
    "version": 6683493776,
    "vm_status": "Executed successfully"
  }
}
```

### 创建定投流
```sh
aptos move run \
  --function-id 81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d::Stream::create_stream \
  --args address:0x2bd2644b9d0a3baa63e4ea40ee645dd22082f199e471f9276162bea50d3114dc u64:10000000 u64:165 u64:604800 \
  --profile default
```
Transaction submitted: https://explorer.aptoslabs.com/txn/0x3e110af5dcf3fc4a2e22292f01aa0dfdb39c9566225e3b19d330cf30be9142f7?network=testnet
{
  "Result": {
    "transaction_hash": "0x3e110af5dcf3fc4a2e22292f01aa0dfdb39c9566225e3b19d330cf30be9142f7",
    "gas_used": 53,
    "gas_unit_price": 100,
    "sender": "aa9f614147e95ce6f4b5c39f23da7046e7fe327e4a2c6f1624eb56dfcc88953c",
    "sequence_number": 2,
    "success": true,
    "timestamp_us": 1744467292215174,
    "version": 6683495059,
    "vm_status": "Executed successfully"
  }
}
> 此时费用已经转移到 CoinStore
### 检查流状态 
```
aptos move view \
  --function-id 81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d::Stream::get_stream_status \
  --args u64:0 address:81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d \
  --url https://fullnode.testnet.aptoslabs.com
```
```json
{
  "Result": [
    true,
    "10000000",
    "0",
    "0x2bd2644b9d0a3baa63e4ea40ee645dd22082f199e471f9276162bea50d3114dc"
  ]
}
```

### claim
```sh
aptos move run \
  --function-id 81a64d20817d4e0aa490fbd843ff868c47c1f0022612afdf963197ea2a74351d::Stream::claim \
  --args u64:0 \
  --profile recipient
```
```json
Transaction submitted: https://explorer.aptoslabs.com/txn/0xc1fe2724e5900466618fe3862556e3f42515b5309743b2dc62e3ee441829accf?network=testnet
{
  "Result": {
    "transaction_hash": "0xc1fe2724e5900466618fe3862556e3f42515b5309743b2dc62e3ee441829accf",
    "gas_used": 8,
    "gas_unit_price": 100,
    "sender": "2bd2644b9d0a3baa63e4ea40ee645dd22082f199e471f9276162bea50d3114dc",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1744512076757274,
    "version": 6684457921,
    "vm_status": "Executed successfully"
  }
}
```