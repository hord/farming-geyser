const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
    const contracts = getSavedContractAddresses()[hre.network.name];

    // Load rewards token
    const rewardsToken = await hre.ethers.getContractAt("ERC20Mock", contracts["RewardsToken"]);


    // Compute contract parameters
    const startBlock = 12658390;
    const tokenDecimals = await rewardsToken.decimals();
    const rewardPerBlock = ethers.utils.parseUnits("0.2344", tokenDecimals.toString()); // 0.2344 token per block
    const totalRewards = ethers.utils.parseUnits("90000", tokenDecimals.toString());


    // Deploy Farm contract
    const Farm = await hre.ethers.getContractFactory('Farm');
    const farm = await Farm.deploy(contracts["RewardsToken"], rewardPerBlock, startBlock);
    await farm.deployed();
    console.log('Farm deployed with address: ', farm.address);
    saveContractAddress(hre.network.name, 'Farm', farm.address);


    // Add pool with 100 allocation points, enforce update
    await farm.addPool(100, contracts["LpToken"], true);


    // Approve rewards token so FARM can enforce transferFrom call from user
    await rewardsToken.approve(contracts['Farm'], totalRewards);
    console.log('Approved rewards token');


    // Fund the farm, send the tokens to the farm
    await farm.fund(totalRewards);
    const endBlock = await farm.endBlock();
    console.log('Farm is funded properly. Farm starts at block: ', startBlock, ' and ends at: ', endBlock);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
