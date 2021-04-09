const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')

async function main() {
  const totalSupply = "5000000000000000000000000" //5M


  const StakingToken = await hre.ethers.getContractFactory("MockERC20");
  const stakingToken = await StakingToken.deploy(totalSupply);
  await stakingToken.deployed();
  console.log("Staking token contract deployed to:", stakingToken.address);
  saveContractAddress(hre.network.name, 'stakingToken', stakingToken.address, (await hre.artifacts.readArtifact("MockERC20")).abi);


  const DistributionToken = await hre.ethers.getContractFactory("MockERC20");
  const distributionToken = await DistributionToken.deploy(totalSupply);
  await distributionToken.deployed();
  console.log("Distribution token contract deployed to:", distributionToken.address);
  saveContractAddress(hre.network.name, 'distributionToken', distributionToken.address,  (await hre.artifacts.readArtifact("MockERC20")).abi);

  const tokenGeyserParams = {
      'stakingToken' : stakingToken.address,
      'distributionToken' : distributionToken.address,
      'maxUnlockSchedules' : 10000, // Avoid hitting gas limit
      'startBonus' : 33, // Start bonus 33%
      'bonusPeriodSecs' : 432000, //5 days
      'inititalSharesPerToken': 1000000
  }

  const TokenGeyser = await hre.ethers.getContractFactory("TokenGeyser");
  const tokenGeyser = await TokenGeyser.deploy(
      tokenGeyserParams.stakingToken,
      tokenGeyserParams.distributionToken,
      tokenGeyserParams.maxUnlockSchedules,
      tokenGeyserParams.startBonus,
      tokenGeyserParams.bonusPeriodSecs,
      tokenGeyserParams.inititalSharesPerToken
  );
  await tokenGeyser.deployed();
  console.log("TokenGeyser contract deployed to:", tokenGeyser.address);
  saveContractAddress(hre.network.name, 'tokenGeyser', tokenGeyser.address,  (await hre.artifacts.readArtifact("TokenGeyser")).abi);

  let lockedPool = await tokenGeyser.getLockedPool();

  await distributionToken.transfer(lockedPool, "1000000000000000000000000");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
