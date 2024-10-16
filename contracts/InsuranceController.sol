// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./JustInsureInterface.sol";
import "./StakeToken.sol";

contract InsuranceController is Context, Ownable, Pausable, ReentrancyGuard {
  string private _uri;
  JustInsureInterface public _interface; //make private
  bool private _initialStakeDone;

  uint256 public constant PROFIT_FRACTION_SHARED_AMONG_STAKERS = 50;
  uint256 public constant FEE_FRACTION_ON_CREATOR_PROFITS = 25;

  mapping(address => PolicyInstance) private _issuedPolicies;

  address public immutable creator;
  string public name;
  StakeToken public immutable stakeToken;
  uint256 public immutable minimumClaimAmount;
  uint256 public immutable maximumClaimAmount;
  uint256 public immutable minimumDuration;
  uint256 public immutable maximumDuration;

  struct PolicyInstance {
    uint256 claimAmount;
    uint256 expiresAt;
  }

  event Bought(
    address indexed account,
    uint256 duration,
    uint256 premium,
    uint256 claim
  );
  event Claimed(address indexed account, uint256 claim);
  event CreatorProfitWithdrawn(uint256 amount);
  event TotalStakeChanged(uint256 timestamp, uint256 amount);

  modifier onlyPolicyOwner(address account_) {
    require(
      _issuedPolicies[account_].expiresAt > block.timestamp,
      "You need buy the policy to perform this action"
    );
    _;
  }

  modifier notPolicyOwner(address account_) {
    require(
      _issuedPolicies[account_].expiresAt < block.timestamp,
      "Already owning a policy"
    );
    _;
  }

  modifier onlyCreator() {
    require(_msgSender() == creator, "Only creator perform this action");
    _;
  }

  constructor(
    address creator_,
    string memory name_,
    string memory uri_,
    uint256 minimumDuration_,
    uint256 maximumDuration_,
    uint256 minimumClaimAmount_,
    uint256 maximumClaimAmount_,
    string memory tokenSymbol_
  ) Ownable(_msgSender()) {
    // expect deployer (owner) to be JustInsureInterface
    _uri = uri_;
    _interface = JustInsureInterface(_msgSender());
    creator = creator_;
    name = name_;
    minimumClaimAmount = minimumClaimAmount_;
    maximumClaimAmount = maximumClaimAmount_;
    minimumDuration = minimumDuration_;
    maximumDuration = maximumDuration_;

    _interface.usdToken().approve(address(_interface), type(uint256).max);

    stakeToken = new StakeToken(
      string.concat("Surity Stake ", name_),
      tokenSymbol_
    );

    _pause();
  }

  function pause() external onlyCreator nonReentrant {
    _pause();
  }

  function unpause() external onlyCreator nonReentrant {
    require(_initialStakeDone, "The policy has not been initialized yet");
    _unpause();
  }

  function uri() external view returns (string memory) {
    return _uri;
  }

  function liquidity() public view returns (uint256) {
    return _interface.usdToken().balanceOf(address(this));
  }

  function totalStake() public view returns (uint256) {
    return stakeToken.totalSupply();
  }

  function isPolicyOwner(address account_) public view returns (bool) {
    return _issuedPolicies[account_].expiresAt > block.timestamp;
  }

  function stakedAmountOfAddress(
    address account_
  ) public view returns (uint256) {
    return IERC20(stakeToken).balanceOf(account_);
  }

  function profitShare(address account_) public view returns (uint256) {
    if (liquidity() <= totalStake()) {
      return 0;
    }

    uint256 profit = liquidity() - totalStake();
    return
      (profit * stakeToken.balanceOf(account_)) /
      (PROFIT_FRACTION_SHARED_AMONG_STAKERS * totalStake());
  }

  function issuePolicy(
    address issueTo_,
    uint256 premium_,
    uint256 claim_,
    uint256 duration_
  ) external onlyOwner notPolicyOwner(issueTo_) nonReentrant whenNotPaused {
    require(
      liquidity() > claim_,
      "Insufficient Liquidity to issue this policy"
    );

    _interface.receivePayment(issueTo_, premium_);

    _issuedPolicies[issueTo_] = PolicyInstance(
      claim_,
      block.timestamp + duration_
    );

    emit Bought(issueTo_, duration_, premium_, claim_);
  }

  function issueClaim(
    address issueClaimTo_
  ) external onlyOwner nonReentrant onlyPolicyOwner(issueClaimTo_) {
    PolicyInstance storage instance = _issuedPolicies[issueClaimTo_];
    require(
      instance.claimAmount < liquidity(),
      "Insufficient Liquidity to pay out claim"
    );
    _interface.usdToken().transfer(issueClaimTo_, instance.claimAmount);

    instance.expiresAt = 0;

    emit Claimed(issueClaimTo_, instance.claimAmount);
  }

  function stakeToPolicy(uint256 stakeAmount_) external nonReentrant {
    if (_initialStakeDone && _msgSender() == creator) {
      uint256 fee = stakeAmount_ / _interface.FEE_FRACTION_ON_CREATOR_STAKE();
      _interface.collectFee(_msgSender(), fee);
    }
    if (!_initialStakeDone) {
      require(_msgSender() == creator, "Only creator can add initial stake");
      require(
        stakeAmount_ >= _interface.minimumInitialStake(),
        "Amount must be greater than minimumInitalStake"
      );
      _initialStakeDone = true;
      _unpause();
    } else {
      _requireNotPaused();
    }

    _interface.receivePayment(_msgSender(), stakeAmount_);
    _interface.registerStake(_msgSender(), stakeAmount_);

    if (_interface.mintStakeTokensInsteadOfLockingToVault()) {
      stakeToken.mint(_msgSender(), stakeAmount_);
    } else {
      _interface.vault().lockTokens(
        _msgSender(),
        address(stakeToken),
        stakeAmount_
      );
    }

    emit TotalStakeChanged(block.timestamp, totalStake());
  }

  function revokeStakeFromPolicy(uint256 amount_) external nonReentrant {
    require(
      stakeToken.balanceOf(_msgSender()) > amount_,
      "You do not have enough stake in policy"
    );

    uint256 totalAmountOut = amount_ + profitShare(_msgSender());
    require(
      liquidity() > totalAmountOut,
      "Insufficient Liquidity to withdraw stake"
    );

    _interface.usdToken().transfer(_msgSender(), totalAmountOut);
    _interface.unregisterStake(_msgSender(), amount_);

    stakeToken.burn(_msgSender(), amount_);

    emit TotalStakeChanged(block.timestamp, totalStake());
  }

  function withdrawProfits(uint256 amount_) external nonReentrant onlyCreator {
    uint256 keepLiquidity = (totalStake() * 115) / 100; // keep 15% margin

    require(liquidity() > keepLiquidity, "Insufficient Liquidity");
    uint256 withdrawableProfits = liquidity() - keepLiquidity;

    require(withdrawableProfits > amount_, "Insufficient Profits to withdraw");

    uint256 fee = amount_ / FEE_FRACTION_ON_CREATOR_PROFITS;
    _interface.collectFee(address(this), fee);
    _interface.usdToken().transfer(creator, amount_ - fee);

    emit CreatorProfitWithdrawn(amount_);
  }
}
