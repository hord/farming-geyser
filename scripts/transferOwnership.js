const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
    const contracts = getSavedContractAddresses()[hre.network.name];
    const farm = await hre.ethers.getContractAt('Farm', contracts['Farm']);

    // Hardcode chainport congress address
    const chainportCongress = "0xB6b4C7aC240b1f176c5589d064733066a83884a1";
    // Get current farm owner
    const currentOwner = await farm.owner();
    // Transfer ownership to chainportCongress
    await farm.transferOwnership(chainportCongress);
    // Checksum
    const newOwner = await farm.owner();
    // Log
    console.log(`Ownership transferred from: ${currentOwner} to ${newOwner}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
