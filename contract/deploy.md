```sh
aptos init --network testnet
aptos move compile --package-dir .
aptos move publish --package-dir . --profile testnet
```