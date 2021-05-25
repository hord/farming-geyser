# Farming-geyser

Implementation of farming-geyser

### Developer instructions

#### Instal dependencies
`yarn install`

#### Create .env file and make sure it's having following information:
```
PK=YOUR_PRIVATE_KEY 
USERNAME=2key
```

#### Compile code
- `npx hardhat clean` (Clears the cache and deletes all artifacts)
- `npx hardhat compile` (Compiles the entire project, building all artifacts)

#### Test code
- `npx hardhat node` (Starts a JSON-RPC server on top of Hardhat Network)
- `npx hardhat test` (Starts the test)
- `npx hardhat test test/{desired_testing_script}` (Starts a specified test)

#### Deploy code
- `npx hardhat node` (Starts a JSON-RPC server on top of Hardhat Network)
- `npx hardhat run --network {network} scripts/{desired_deployment_script}`
- `rm -r .openzeppelin`
- `rm -r cache`
- `rm -r artifacts`
- `npx hardhat run --network ropsten scripts/testnet_deploy.js`
- `npx hardhat run --network ropsten scripts/staging_deploy.js`

#### Tenderly push
- Generate tenderly access key on the https://dashboard.tenderly.co
- Add access key to .env file as: 
  ```
  ACCESS_KEY=<YOUR_ACCESS_KEY>
  ```
- `npx hardhat run --network {network} tenderly/tenderly_push.js`


#### Flatten contracts
- `npx hardhat flatten` (Flattens and prints contracts and their dependencies)


#### Deployed addresses and bytecodes
All deployed addresses and bytecodes can be found inside `deployments/` folder.

