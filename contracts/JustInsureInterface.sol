// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InsuranceController.sol";
import "./SureCoin.sol";
import "./Vault.sol";

import "hardhat/console.sol";

contract JustInsureInterface is Context, ReentrancyGuard, Ownable {
  mapping(address => bool) private _validControllers;

  uint256 public constant FEE_FRACTION_ON_PREMIUM_PAID = 1000; // fraction of premium amount taken as fee
  uint256 public constant FEE_FRACTION_ON_CREATOR_STAKE = 100; // fraction of creator's stake taken as fee
  uint256 public constant REVENUE_FRACTION_SHARED_WITH_SURECOIN = 2; // fraction of all revenue used to add liquidity to surecoin

  IERC20 public immutable usdToken;
  SureCoin public immutable surecoin;
  Vault public immutable vault;

  bool public mintStakeTokensInsteadOfLockingToVault = true;
  uint256 public minimumInitialStake = 0;

  event policyCreated(address indexed creator, address controller);
  event policyBought(address indexed account, address controller);
  event minimumInitialStakeUpdated(uint256 amount);

  modifier onlyController(address address_) {
    require(_validControllers[address_], "not a valid InsuranceController");
    _;
  }

  constructor(address usdToken_) Ownable(_msgSender()) {
    usdToken = IERC20(usdToken_);
    surecoin = new SureCoin();
    vault = new Vault();
  }

  function createInsurancePolicy(
    address creator_,
    string calldata metadataUri_,
    string calldata name_,
    string calldata tokenSymbol_,
    uint256 minimumDuration_,
    uint256 maximumDuration_,
    uint256 minimumClaimAmount_,
    uint256 maximumClaimAmount_
  ) public onlyOwner nonReentrant {
    InsuranceController newInsurancePolicy = new InsuranceController(
      creator_,
      name_,
      metadataUri_,
      minimumDuration_,
      maximumDuration_,
      minimumClaimAmount_,
      maximumClaimAmount_,
      tokenSymbol_
    );
    _validControllers[address(newInsurancePolicy)] = true;

    emit policyCreated(creator_, address(newInsurancePolicy));
  }

  function issuePolicyInstance(
    address controllerAddress_,
    address issueTo_,
    uint256 premium_,
    uint256 claim_,
    uint256 duration_
  ) external onlyOwner onlyController(controllerAddress_) {
    uint256 fee = premium_ / FEE_FRACTION_ON_PREMIUM_PAID;
    _collectFee(issueTo_, fee);

    InsuranceController(controllerAddress_).issuePolicy(
      issueTo_,
      premium_,
      claim_,
      duration_
    );

    emit policyBought(issueTo_, controllerAddress_);
  }

  function isValidController(address address_) public view returns (bool) {
    return _validControllers[address_];
  }

  function issueClaimForPolicyInstance(
    address controllerAddress_,
    address issueTo_
  ) external onlyOwner onlyController(controllerAddress_) {
    InsuranceController(controllerAddress_).issueClaim(issueTo_);
  }

  function receivePayment(
    address payer_,
    uint256 usdAmount_
  ) public onlyController(_msgSender()) nonReentrant {
    usdToken.transferFrom(payer_, _msgSender(), usdAmount_);
  }

  function _collectFee(address payer_, uint256 usdAmount_) private {
    usdToken.transferFrom(payer_, address(this), usdAmount_);

    usdToken.transfer(
      address(surecoin),
      usdAmount_ / REVENUE_FRACTION_SHARED_WITH_SURECOIN
    );
    surecoin.emitPriceChange();
  }

  function collectFee(
    address payer_,
    uint256 usdAmount_
  ) public onlyController(_msgSender()) nonReentrant {
    _collectFee(payer_, usdAmount_);
  }

  function registerStake(
    address staker_,
    uint256 usdAmount_
  ) public onlyController(_msgSender()) nonReentrant {
    surecoin.acknowledgeStake(staker_, usdAmount_, _msgSender());
    surecoin.emitPriceChange();
  }

  function unregisterStake(
    address staker_,
    uint256 usdAmount_
  ) public onlyController(_msgSender()) nonReentrant {
    surecoin.acknowledgeRevoke(staker_, usdAmount_, _msgSender());
    surecoin.emitPriceChange();
  }

  // function updateStakingRewardRate(
  //   uint256 stakingRewardRate_
  // ) external onlyOwner nonReentrant {
  //   surecoin.setRewardRate(stakingRewardRate_);
  // }

  function setMinimumInitialStake(
    uint256 minimumInitialStake_
  ) external onlyOwner nonReentrant {
    minimumInitialStake = minimumInitialStake_;

    emit minimumInitialStakeUpdated(minimumInitialStake_);
  }

  function enableLockingStakeTokensToVault() external onlyOwner nonReentrant {
    mintStakeTokensInsteadOfLockingToVault = false;
  }

  function enableMintingStakeTokens() external onlyOwner nonReentrant {
    mintStakeTokensInsteadOfLockingToVault = true;
  }

  function withdraw(
    address tokenAddress_,
    address withdrawTo_,
    uint256 value_
  ) external onlyOwner nonReentrant {
    if (tokenAddress_ != address(0)) {
      IERC20(tokenAddress_).transfer(withdrawTo_, value_);
    } else {
      payable(withdrawTo_).transfer(value_);
    }
  }
}
