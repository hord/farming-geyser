const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')

async function main() {
  const totalSupply = "5000000000000000000000000" //5M


  const StakingToken = await hre.ethers.getContractFactory("MockERC20");
  const stakingToken = await StakingToken.deploy(totalSupply);
  await stakingToken.deployed();
  saveContractAddress(hre.network.name, 'stakingToken', stakingToken.address);


  const DistributionToken = await hre.ethers.getContractFactory("MockERC20");
  const distributionToken = await DistributionToken.deploy(totalSupply);
  await distributionToken.deployed();
  saveContractAddress(hre.network.name, 'distributionToken', distributionToken.address);

  const tokenGeyserParams = {
      'stakingToken' : stakingToken.address,
      'distributionToken' : distributionToken.address,
      'maxUnlockSchedules' : 10000, // Avoid hitting gas limit
      'startBonus' : 33, // Start bonus 33%
      'bonusPeriodSecs' : 432000, //5 days
      'inititalSharesPerToken': 1000000
  }

  const TokenGeyser = await hre.ethers.getContractFactory('TokenGeyser');
  const tokenGeyser = await TokenGeyser.deploy(
      tokenGeyserParams.stakingToken,
      tokenGeyserParams.distributionToken,
      tokenGeyserParams.maxUnlockSchedules,
      tokenGeyserParams.startBonus,
      tokenGeyserParams.bonusPeriodSecs,
      tokenGeyserParams.inititalSharesPerToken
  );
  await tokenGeyser.deployed();
  saveContractAddress(hre.network.name, 'tokenGeyser', tokenGeyser.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
