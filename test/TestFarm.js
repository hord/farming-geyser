const { expect } = require("chai");
const { blockNumber, advanceBlocks, freezeTime, increaseTime } = require("./ethereum");

describe("Tokens Farm Test", function () {

    let farm, farmInstance, token, tokenInstance, blockTimeInSeconds,
        user1, user2, user3, owner, users,
        amountForTest = 50, decimals = 18, tokenAmount = 250000, tokenName = "Token",
        tokenSymbol = "TOK", rewardPerBlock = 50, startingBlock = 0, bonusTime = 500000;

    beforeEach(async function () {
        token = await ethers.getContractFactory("ERC20Mock");
        tokenInstance = await token.deploy(tokenName, tokenSymbol, decimals, tokenAmount);

        [user1, user2, user3, owner, ...users] = await ethers.getSigners();

        let currentDateTime = new Date();
        blockTimeInSeconds = Math.floor(currentDateTime.getTime() / 1000);
        //console.log("Current block time: " + blockTimeInSeconds);
        farm = await ethers.getContractFactory("Farm");
        farmInstance = await farm.connect(owner).deploy(tokenInstance.address, rewardPerBlock, blockTimeInSeconds);

        tokenInstance.transfer(owner.address, 11000);

        tokenInstance.connect(owner).approve(farmInstance.address, 10000);
    });

    describe("Check if constructor values are set properly", function () {
        it("Token address", async function () {
            expect(await farmInstance.erc20()).to.equal(tokenInstance.address);
        });
        it("Reward per block", async function () {
            expect(await farmInstance.rewardPerBlock()).to.equal(rewardPerBlock);
        });
        it("Start block", async function () {
            expect(await farmInstance.startBlock()).to.equal(blockTimeInSeconds);
        });
        it("End block", async function () {
            expect(await farmInstance.endBlock()).to.equal(blockTimeInSeconds);
        });
    });

    it("Should check pool length is equal to zero", async function () {
        expect(await farmInstance.poolLength()).to.equal(0);
    });

    describe("Fund function", function () {
        it("Fund function should complete", async function () {
            let oldTotalRewards = farmInstance.totalRewards();
            advanceBlocks(bonusTime);
            await farmInstance.connect(owner).fund(amountForTest);
            expect(await farmInstance.totalRewards()).to.equal(oldTotalRewards + amountForTest);
        });
    });

    describe("Add pool function", function () {
        it("Should execute function without the update", async function () {
            await farmInstance.connect(owner).addPool(50, tokenInstance.address, false);
        });
        it("Should execute function with the update", async function () {
            await farmInstance.connect(owner).addPool(50, tokenInstance.address, true);
        });
        it("Should not execute function when same token is added second time", async function () {
            await farmInstance.connect(owner).addPool(50, tokenInstance.address, false);
            await expect(farmInstance.connect(owner).addPool(50, tokenInstance.address, false))
                .to.be.revertedWith("Add: LP Token is already added");
        });
    });

    describe("Set function", function () {
        it("Set function should be executed properly without update", async function () {
            await farmInstance.connect(owner).set(50, 25, false);
        });
        it("Set function should be executed properly with update", async function () {
            await farmInstance.connect(owner).set(50, 25, true);
        });
    });

    describe("Deposited function", function () {
        it("Deposited function should be executed properly", async function () {
            await farmInstance.deposited(1, owner.address);
        });
    });

    it("Pending function", async function () {
        await farmInstance.pending(1, user1.address);
    });

    it("Should return total pending rewards", async function () {
        expect(await farmInstance.totalPending()).to.equal(0);
    });

    it("Deposit function", async function () {
        await farmInstance.connect(owner).deposit(1, 50);
    });

    it("Withdraw function", async function () {

    });

    it("EmergencyWithdraw function", async function () {

    });
});
