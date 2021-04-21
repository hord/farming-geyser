const hre = require('hardhat')

const { getSavedContractAddresses } = require('../scripts/utils')
const branch = require('git-branch');
const assert = require('assert');

const toCamel = (s) => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};

const checksumNetworkAndBranch = (network, branch) => {
    if(network === 'ropsten') {
        assert.strictEqual(branch ,'develop','Wrong branch');
    } else if(network === 'mainnet') {
        assert.strictEqual(branch ,'master','Wrong branch');
    }
}

async function main() {
    const gitBranch = branch.sync();

    checksumNetworkAndBranch(hre.network.name, gitBranch);
    const contracts = getSavedContractAddresses()[hre.network.name]

    let contractsToPush = []
    Object.keys(contracts).forEach(name => {
        contractsToPush.push({
            name: toCamel(name),
            address: contracts[name]
        })
    })
    console.log(contractsToPush);
    await hre.tenderly.push(...contractsToPush)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
