const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')

async function main() {

  const testingWallets = [
      '0xc965904312910Daf496D0F01D845A35D2C30d734', // Jovan
      '0x36d48Aed46354889ca6d4B84e92Eb382652262b5', // Jovan
      '0x45002669Ad051fd899331328E5F38f97feD075Bc', // Alexa
      '0xc20E5650859d23A0A184c02BA1faeA4dD74E4946', // Jovan
      '0xbB00149c2ab251EdeBC91c16189071C089DF2623', // Nikola
      '0xF1616E983c42BB1E490EA7F0cEEF40A710554C85', // Nikola
  ];

  const StakingToken = await hre.ethers.getContractFactory("MockERC20");
  const stakingToken = await StakingToken.deploy('Uniswap LP token', 'UNI_LP');
  await stakingToken.deployed();
  console.log("Staking token contract deployed to:", stakingToken.address);
  saveContractAddress(hre.network.name, 'stakingToken', stakingToken.address, (await hre.artifacts.readArtifact("MockERC20")).abi);


  const DistributionToken = await hre.ethers.getContractFactory("MockERC20");
  const distributionToken = await DistributionToken.deploy('HordToken', 'HORD');
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

  // Transfer tokens to distribution pool
  let lockedPool = await tokenGeyser.getLockedPool();
  await distributionToken.transfer(lockedPool, "5000000000000000000000");
  console.log('Sent 5000 distribution tokens to locked pool');

  for (const wallet of testingWallets) {
      let receipt = await stakingToken.transfer(wallet,'300000000000000000000')
      console.log('Sent 300 tokens to: ', wallet)
      console.log('TxId: ', receipt.hash);
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
