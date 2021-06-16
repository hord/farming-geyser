const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
    const contracts = getSavedContractAddresses()[hre.network.name];

    const startBlock = 12645600; // 2 pm UTC 7th June 2021
    const rewardPerBlock = ethers.utils.parseEther("0.2344"); // 0.2344 token per block

    const Farm = await hre.ethers.getContractFactory('Farm');
    const farm = await Farm.deploy(contracts["RewardsToken"], rewardPerBlock, startBlock);
    await farm.deployed();

    console.log('Farm deployed with address: ', farm.address);
    saveContractAddress(hre.network.name, 'Farm', farm.address);

    await farm.addPool(100, contracts["LpToken"], true);

    let totalRewards = ethers.utils.parseEther("90000");
    const rewardsToken = await hre.ethers.getContractAt("ERC20Mock", contracts["RewardsToken"]);
    await rewardsToken.approve(contracts['Farm'], "90000000000");
    console.log('Approved rewards token');

    console.log('Create new farming pool for hord lp token');
    await farm.fund("90000000000");
    console.log('Farm funded properly.');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
