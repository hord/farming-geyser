const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre
const BigNumber = ethers.BigNumber

const decimals = "1000000000000000000"
function toWeiDenomination (x) {
  return BigNumber.from(x).mul(decimals).toString()
}

async function main() {

  const contracts = getSavedContractAddresses()[hre.network.name];

  let currentBlock = await web3.eth.getBlockNumber();
  currentBlock += 50;
  console.log('startBlock: ' + currentBlock);
  const rewardPerBlock = toWeiDenomination(0.7); //1 token per block

  const Farm = await hre.ethers.getContractFactory('Farm');
  const farm = await Farm.deploy(hord_token.address, rewardPerBlock, currentBlock);
  await farm.deployed();
  console.log('Farm deployed with address: ', farm.address);
  saveContractAddress(hre.network.name, 'farm', farm.address, (await hre.artifacts.readArtifact("Farm")).abi);

  await farm.add(100, contracts["lp_token"].address, true);

  // let totalRewards = toWeiDenomination(100800)// 10 days approximately
  // await hord_token.approve(farm.address, totalRewards);
  // console.log('Approved rewards token');

  // console.log('Create new farming pool for hord lp token');
  // await farm.fund(totalRewards);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
