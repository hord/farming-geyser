const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre
const BigNumber = ethers.BigNumber

const decimals = "1000000000000000000"
function toWeiDenomination (x) {
  return BigNumber.from(x).mul(decimals).toString()
}

async function main() {

  console.log('Here');
  const LP = await hre.ethers.getContractFactory('ERC20Mock');
  const hord_lp_token = await LP.deploy("HORD-ETH-LP","ETH-LP", 18, toWeiDenomination(5000))
  await hord_lp_token.deployed();
  console.log('LP token deployed with address: ', hord_lp_token.address);
  saveContractAddress(hre.network.name, 'lp_token', hord_lp_token.address, (await hre.artifacts.readArtifact(('ERC20Mock')).abi));

  const HordToken = await hre.ethers.getContractFactory('ERC20Mock');
  const hord_token = await HordToken.deploy("HORDToken","Hord", 18, toWeiDenomination(320000000));
  await hord_token.deployed();
  console.log('Hord token deployed with address: ', hord_token.address);
  saveContractAddress(hre.network.name, 'hord_token', hord_token.address, (await hre.artifacts.readArtifact(('ERC20Mock')).abi));

  let currentBlock = await web3.eth.getBlockNumber();
  currentBlock += 100;
  console.log('startBlock: ' + currentBlock);
  const rewardPerBlock = toWeiDenomination(1); //1 token per block

  const Farm = await hre.ethers.getContractFactory('Farm');
  const farm = await Farm.deploy(hord_token.address, rewardPerBlock, currentBlock);
  await farm.deployed();
  console.log('Farm deployed with address: ', farm.address);
  saveContractAddress(hre.network.name, 'farm', farm.address, (await hre.artifacts.readArtifact("Farm")).abi);


  let totalRewards = toWeiDenomination(100800)// 10 days approximately

  await hord_token.approve(farm.address, totalRewards);
  console.log('Approved rewards token');

  await hord_token.approve(farm.address, totalRewards);
  console.log('Approved rewards token');

  let owner = '0xf3B39c28bF4c5c13346eEFa8F90e88B78A610381';

  let hordBalance = await hord_token.balanceOf(owner);
  console.log('Hord balance of owner: ', hordBalance);

  let allowance = await hord_token.allowance(owner, farm.address);
  console.log('Allowance ', allowance);

  await farm.add(100, hord_lp_token.address, true);
  console.log('Create new farming pool for hord lp token');

  // await farm.fund(totalRewards);
  // console.log('Funded the farm with rewards token');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
