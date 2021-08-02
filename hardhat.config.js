require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-ethers')
require("@nomiclabs/hardhat-web3")
require('@openzeppelin/hardhat-upgrades')
require("@tenderly/hardhat-tenderly");
require('dotenv').config();
const branch = require('git-branch');


// *** PK STATED BELOW IS DUMMY PK EXCLUSIVELY FOR TESTING PURPOSES ***
const PK = `0x${"32c069bf3d38a060eacdc072eecd4ef63f0fc48895afbacbe185c97037789875"}`

task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()
  for (const account of accounts) {
    console.log(await account.getAddress())
  }
})

const branchToSlug = {
  "develop" : "hord-farm-test",
  "staging" : "hord-farm-staging",
  "master" : "hord-farm-prod",
}

const generateTenderlySlug = () => {
  let gitBranch = branch.sync();
  console.log(branchToSlug[gitBranch]);
  return branchToSlug[gitBranch];
}

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  defaultNetwork: 'local',
  networks: {
    ropsten: {
      // Infura public nodes
      url: 'https://ropsten.infura.io/v3/34ee2e319e7945caa976d4d1e24db07f',
      accounts: [process.env.PK || PK],
      chainId: 3,
      gasPrice: 40000000000,
      timeout: 50000
    },
    ropstenStaging: {
      // Infura public nodes
      url: 'https://ropsten.infura.io/v3/34ee2e319e7945caa976d4d1e24db07f',
      accounts: [process.env.PK || PK],
      chainId: 3,
      gasPrice: 40000000000,
      timeout: 50000
    },
    mainnet: {
      // Infura public nodes
      url: 'https://mainnet.infura.io/v3/1692a3b8ad92406189c2c7d2b01660bc',
      accounts: [process.env.PK || PK],
      chainId: 1,
      gasPrice: 115000000000, // 44 GWEI gas price for deployment.
      timeout: 10000000
    },
    local: {
      url: 'http://localhost:8545',
    },
  },
  solidity: {
    version: '0.6.12',
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  tenderly: {
    username: process.env.USERNAME,
    project: generateTenderlySlug()
  },
}
