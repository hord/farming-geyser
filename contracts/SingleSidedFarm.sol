//"SPDX-License-Identifier: UNLICENSED"
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract SingleSidedFarm is Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    enum EarlyWithdrawPenalty { BURN_REWARDS, REDISTRIBUTE_REWARDS }

    // Info of each user.
    struct UserInfo {
        uint256 amount;             // How many tokens the user has provided.
        uint256 rewardDebt;         // Reward debt. See explanation below.
        uint256 depositTime;        // Time when user deposited.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 tokenStaked;             // Address of LP token contract.
        uint256 lastRewardBlock;    // Last block number that ERC20s distribution occurs.
        uint256 accERC20PerShare;   // Accumulated ERC20s per share, times 1e36.
        uint256 totalDeposits;      // Total tokens deposited in the farm.
    }

    // If contractor allows early withdraw on stakes
    bool public isEarlyWithdrawAllowed;
    // Minimal period of time to stake
    uint256 public minTimeToStake;
    // Address of the ERC20 Token contract.
    IERC20 public erc20;
    // The total amount of ERC20 that's paid out as reward.
    uint256 public paidOut;
    // ERC20 tokens rewarded per block.
    uint256 public rewardPerBlock;
    // Total rewards added to farm
    uint256 public totalRewards;
    // Mapping to determine if LP token is added
    mapping (address => bool) public isTokenAdded;
    // Info of each pool.
    PoolInfo public pool;
    // Info of each user that stakes LP tokens.
    mapping (address => UserInfo) public userInfo;
    // The block number when farming starts.
    uint256 public startBlock;
    // The block number when farming ends.
    uint256 public endBlock;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);


    constructor(
        IERC20 _erc20, uint256 _rewardPerBlock, uint256 _startBlock, uint256 _minTimeToStake, bool _isEarlyWithdrawAllowed
    ) public {
        require(address(_erc20) != address(0x0), "Wrong token address.");
        require(_rewardPerBlock > 0, "Rewards per block must be > 0.");
        require(startBlock >= block.timestamp, "Start block can not be in the past.");

        erc20 = _erc20;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
        endBlock = _startBlock;
        minTimeToStake = _minTimeToStake;
        isEarlyWithdrawAllowed = _isEarlyWithdrawAllowed;
    }


    // Fund the farm, increase the end block
    function fund(uint256 _amount) external {
        require(block.number < endBlock, "fund: too late, the farm is closed");
        require(_amount > 0, "Amount must be greater than 0.");

        erc20.safeTransferFrom(address(msg.sender), address(this), _amount);
        endBlock += _amount.div(rewardPerBlock);
        // Increase farm total rewards
        totalRewards = totalRewards.add(_amount);
    }

    // Add a new lp to the pool. Can only be called by the owner.
    function addPool(IERC20 _tokenStaked, bool _withUpdate) external onlyOwner {
        require(address(_tokenStaked) != address(0x0), "Must input valid address.");
        require(address(pool.tokenStaked) == address(0x0), "Pool can be set only once.");

        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;

        pool = PoolInfo({
            tokenStaked: _tokenStaked,
            lastRewardBlock: lastRewardBlock,
            accERC20PerShare: 0,
            totalDeposits: 0
        });
    }

    // View function to see deposited LP for a user.
    function deposited(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        return user.amount;
    }


    // View function to see pending ERC20s for a user.
    function pending(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];

        uint256 accERC20PerShare = pool.accERC20PerShare;
        uint256 tokenSupply = pool.totalDeposits;

        if (block.number > pool.lastRewardBlock && tokenSupply != 0) {
            uint256 lastBlock = block.number < endBlock ? block.number : endBlock;
            uint256 blockToCompare = pool.lastRewardBlock < endBlock ? pool.lastRewardBlock : endBlock;
            uint256 nrOfBlocks = lastBlock.sub(blockToCompare);
            uint256 erc20Reward = nrOfBlocks.mul(rewardPerBlock);
            accERC20PerShare = accERC20PerShare.add(erc20Reward.mul(1e36).div(tokenSupply));
        }

        return user.amount.mul(accERC20PerShare).div(1e36).sub(user.rewardDebt);
    }

    // View function for total reward the farm has yet to pay out.
    function totalPending() external view returns (uint256) {
        if (block.number <= startBlock) {
            return 0;
        }

        uint256 lastBlock = block.number < endBlock ? block.number : endBlock;
        return rewardPerBlock.mul(lastBlock - startBlock).sub(paidOut);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        updatePool();
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool() public {
        uint256 lastBlock = block.number < endBlock ? block.number : endBlock;

        if (lastBlock <= pool.lastRewardBlock) {
            return;
        }

        uint256 tokenSupply = pool.totalDeposits;

        if (tokenSupply == 0) {
            pool.lastRewardBlock = lastBlock;
            return;
        }

        uint256 nrOfBlocks = lastBlock.sub(pool.lastRewardBlock);
        uint256 erc20Reward = nrOfBlocks.mul(rewardPerBlock);

        pool.accERC20PerShare = pool.accERC20PerShare.add(erc20Reward.mul(1e36).div(tokenSupply));
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens to Farm for ERC20 allocation.
    function deposit(uint256 _amount) external {
        UserInfo storage user = userInfo[msg.sender];

        // Update pool
        updatePool();

        if (user.amount > 0) {
            uint256 pendingAmount = user.amount.mul(pool.accERC20PerShare).div(1e36).sub(user.rewardDebt);
            erc20Transfer(msg.sender, pendingAmount);
        }

        // Take token and transfer to contract
        pool.tokenStaked.safeTransferFrom(address(msg.sender), address(this), _amount);
        // Add amount to the pool total deposits
        pool.totalDeposits = pool.totalDeposits.add(_amount);

        // Update user accounting
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accERC20PerShare).div(1e36);
        user.depositTime = block.timestamp;

        // Emit deposit event
        emit Deposit(msg.sender, _amount);
    }

    // Withdraw LP tokens from Farm.
    function withdraw(uint256 _amount) external {
        UserInfo storage user = userInfo[msg.sender];

        require(user.amount >= _amount, "withdraw: can't withdraw more than deposit");
        updatePool();

        uint256 pendingAmount = user.amount.mul(pool.accERC20PerShare).div(1e36).sub(user.rewardDebt);
        erc20Transfer(msg.sender, pendingAmount);

        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accERC20PerShare).div(1e36);

        pool.tokenStaked.safeTransfer(address(msg.sender), _amount);
        pool.totalDeposits = pool.totalDeposits.sub(_amount);

        // Emit Withdraw event
        emit Withdraw(msg.sender, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw() external {
        UserInfo storage user = userInfo[msg.sender];

        pool.tokenStaked.safeTransfer(address(msg.sender), user.amount);
        pool.totalDeposits = pool.totalDeposits.sub(user.amount);

        emit EmergencyWithdraw(msg.sender, user.amount);

        user.amount = 0;
        user.rewardDebt = 0;
    }

    // Transfer ERC20 and update the required ERC20 to payout all rewards
    function erc20Transfer(address _to, uint256 _amount) internal {
        erc20.transfer(_to, _amount);
        paidOut += _amount;
    }
}
