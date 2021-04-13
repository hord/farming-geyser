const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')

async function main() {

  const hord_lp_token = '0xb894fcc9e152e1a6d4272bcbd958429b9d5f1737';
  const hord_token = '0xD90F43c95f213FF09D3a3070bfd78B46Dfe5E9de';

  const IERC20 = await hre.ethers.getContractFactory('IERC20');
  const Farm = await hre.ethers.getContractFactory('Farm');

  let currentBlock = await web3.eth.getBlockNumber();
  currentBlock += 100;
  console.log('startBlock: ' + currentBlock);
  const rewardPerBlock = 1000000000000000000; //1 token per block
  const farm = await Farm.deploy(hord_lp_token, rewardPerBlock, currentBlock);
  await farm.deployed();
  saveContractAddress(hre.network.name, 'farm', farm.address, (await hre.artifacts.readArtifact("Farm")).abi);

  let totalRewards = "100800000000000000000000" // 10 days approximately
  console.log('Approving the farm to take rewards token');
  await IERC20(hord_token).approve(farm.address, totalRewards);
  console.log('Funding the farm with rewards token');
  await farm.fund(totalRewards);
  console.log('Create new farming pool for hord lp token');
  await farm.add(100, hord_lp_token, true);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
