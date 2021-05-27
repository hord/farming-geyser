const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
    const contracts = getSavedContractAddresses()[hre.network.name];

    let currentBlock = await web3.eth.getBlockNumber();
    currentBlock += 100;
    console.log('startBlock: ' + currentBlock);
    const rewardPerBlock = ethers.utils.parseEther("1.25"); // 1 token per block

    const Farm = await hre.ethers.getContractFactory('Farm');
    const farm = await Farm.deploy(contracts["RewardsToken"], rewardPerBlock, currentBlock);
    await farm.deployed();
    console.log('Farm deployed with address: ', farm.address);
    saveContractAddress(hre.network.name, 'Farm', farm.address);

    await farm.addPool(100, contracts["LpToken"], true);

    let totalRewards = ethers.utils.parseEther("100800")// 10 days approximately
    const rewardsToken = await hre.ethers.getContractAt("ERC20Mock", contracts["RewardsToken"]);
    await rewardsToken.approve(farm.address, totalRewards);
    console.log('Approved rewards token');

    console.log('Create new farming pool for hord lp token');
    await farm.fund(totalRewards);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
