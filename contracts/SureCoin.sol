// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./JustInsureInterface.sol";

contract SureCoin is ERC20, Ownable, ReentrancyGuard {
  uint256 public immutable MAX_SUPPLY = 1_000_000_000_1000 * (10 ** decimals());
  uint256 public constant REWARD_RATE_FRACTION_OF_AVAILABLE_SUPPLY = 10;

  uint256 private _totalStaked = 0;
  uint256 private _rewardPerTokenStored;
  uint256 private _lastUpdateTime;
  JustInsureInterface _interface;

  mapping(address => uint256) private _stakedBalance;
  mapping(address => uint256) private _rewards;
  mapping(address => uint256) private _userRewardPerTokenPaid;

  event Staked(
    address indexed account,
    address indexed insurance,
    uint256 amount
  );
  event Revoked(
    address indexed account,
    address indexed insurance,
    uint256 amount
  );
  event RewardsClaimed(address indexed account, uint256 amount);

  event Buy(address indexed buyer, uint256 amount, uint256 cost);
  event Sell(address indexed seller, uint256 amount, uint256 refund);
  event PriceChange(uint256 time, uint256 value, uint256 marketCap);

  constructor() ERC20("SureCoin", "SURE") Ownable(_msgSender()) {
    // expect deployer (owner) to be JustInsureInterface
    _interface = JustInsureInterface(_msgSender());
    _lastUpdateTime = block.timestamp;

    _mint(address(this), MAX_SUPPLY);
  }

  function decimals() public view virtual override returns (uint8) {
    return 6;
  }

  function _rewardRate() private view returns (uint256) {
    return ((reserve() / 10 ** 4) / REWARD_RATE_FRACTION_OF_AVAILABLE_SUPPLY) / (30 days);
  }

  function updateReward(address account) internal {
    _rewardPerTokenStored = rewardPerStake();
    _lastUpdateTime = block.timestamp;

    if (account != address(0)) {
      _rewards[account] = earned(account);
      _userRewardPerTokenPaid[account] = _rewardPerTokenStored;
    }
  }

  function rewardPerStake() public view returns (uint256) {
    if (_totalStaked == 0) {
      return _rewardPerTokenStored;
    }

    return
      _rewardPerTokenStored +
      ((_rewardRate() * (block.timestamp - _lastUpdateTime)) / _totalStaked);
  }

  function earned(address account_) public view returns (uint256) {
    return
      (_stakedBalance[account_] *
        (rewardPerStake() - _userRewardPerTokenPaid[account_])) +
      _rewards[account_];
  }

  function claimRewards() external nonReentrant {
    address account_ = _msgSender();

    uint256 reward = _rewards[account_];
    require(reward > 0, "No rewards to claim");
    updateReward(account_);

    _rewards[account_] = 0;

    _transfer(address(this), account_, reward);
    updateReward(account_);

    emit RewardsClaimed(account_, reward);
  }

  function totalStake() public view returns (uint256) {
    return _totalStaked;
  }

  function liquidity() public view returns (uint256) {
    return _interface.usdToken().balanceOf(address(this));
  }

  function reserve() public view returns (uint256) {
    return balanceOf(address(this));
  }

  function emitPriceChange() public {
    emit PriceChange(block.timestamp, tokenPrice(), marketCap());
  }

  function acknowledgeStake(
    address account_,
    uint256 amount_,
    address controllerAddress_
  ) external onlyOwner nonReentrant {
    require(amount_ > 0, "Invalid stake amount");

    _totalStaked += amount_;
    _stakedBalance[account_] += amount_;

    updateReward(account_);

    emit Staked(account_, controllerAddress_, amount_);
  }

  function acknowledgeRevoke(
    address account_,
    uint256 amount_,
    address controllerAddress_
  ) external onlyOwner nonReentrant {
    require(amount_ > 0, "Invalid revoke Amount");

    updateReward(account_);

    _totalStaked -= amount_;
    _stakedBalance[account_] -= amount_;

    emit Revoked(account_, controllerAddress_, amount_);
  }

  function tokenPrice() public view returns (uint256) {
    return calculateBuyCost(1 * (10 ** decimals()));
  }

  function marketCap() public view returns (uint256) {
    return ((tokenPrice() * totalSupply()) / (10 * decimals()));
  }

  function calculateTokensReceived(
    uint256 amount_
  ) public view returns (uint256) {
    return (reserve() * amount_) / (liquidity() + amount_);
  }

  function calculateSellRefund(uint256 amount_) public view returns (uint256) {
    return (liquidity() * amount_) / (reserve() + amount_);
  }

  function calculateBuyCost(uint256 amount_) public view returns (uint256) {
    require(totalSupply() >= amount_, "Insufficient Supply");
    return (liquidity() * amount_) / (reserve() - amount_);
  }

  function buy(uint256 amountIn_, uint256 amountOutMin_) external nonReentrant {
    uint256 amountOutCalculated = calculateTokensReceived(amountIn_);

    require(amountOutCalculated > amountOutMin_, "Slippage Tolerance Exceeded");

    _interface.usdToken().transferFrom(_msgSender(), address(this), amountIn_);
    _mint(_msgSender(), amountOutCalculated);

    emit Buy(_msgSender(), amountOutCalculated, amountIn_);
  }

  function sell(
    uint256 amountIn_,
    uint256 amountOutMin_
  ) external nonReentrant {
    uint256 refundCalculated = calculateSellRefund(amountIn_);

    require(refundCalculated > amountOutMin_, "Slippage Tolerance Exceeded");

    _burn(_msgSender(), amountIn_);
    _interface.usdToken().transfer(msg.sender, refundCalculated);

    emit Sell(_msgSender(), amountIn_, refundCalculated);
  }
}
