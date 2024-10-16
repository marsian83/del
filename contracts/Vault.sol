// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./JustInsureInterface.sol";

contract Vault is Context {
  JustInsureInterface private _interface;

  struct LockedToken {
    address tokenAddress;
    uint256 amount;
    uint256 unlockTime;
  }

  mapping(address => LockedToken[]) private _userLocks;

  uint256 public constant LOCK_DURATION = 30 days;

  event TokensLocked(
    address indexed insurance,
    address indexed recipient,
    address indexed token,
    uint256 amount,
    uint256 unlockTime
  );

  constructor() {
    _interface = JustInsureInterface(_msgSender());
  }

  function lockTokens(
    address recipient_,
    address tokenAddress_,
    uint256 amount_
  ) external {
    require(
      _interface.isValidController(_msgSender()),
      "Only InsuranceController can perform this action"
    );

    require(amount_ > 0, "Cannot lock zero tokens");
    require(recipient_ != address(0), "Invalid recipient address");

    IERC20(tokenAddress_).transferFrom(_msgSender(), address(this), amount_);

    _userLocks[recipient_].push(
      LockedToken({
        tokenAddress: tokenAddress_,
        amount: amount_,
        unlockTime: block.timestamp + LOCK_DURATION
      })
    );

    emit TokensLocked(
      _msgSender(),
      recipient_,
      tokenAddress_,
      amount_,
      block.timestamp + LOCK_DURATION
    );
  }

  function getLockedTokens(
    address user
  ) external view returns (LockedToken[] memory) {
    return _userLocks[user];
  }

  function unlockTokens(uint256 lockIndex) external {
    require(lockIndex < _userLocks[_msgSender()].length, "Invalid lock index");

    LockedToken storage lockInfo = _userLocks[_msgSender()][lockIndex];
    require(block.timestamp >= lockInfo.unlockTime, "Tokens are still locked");

    uint256 amount = lockInfo.amount;
    address tokenAddress = lockInfo.tokenAddress;

    require(
      IERC20(tokenAddress).transfer(_msgSender(), amount),
      "Token transfer failed"
    );

    _userLocks[_msgSender()][lockIndex] = _userLocks[_msgSender()][
      _userLocks[_msgSender()].length - 1
    ];
    _userLocks[_msgSender()].pop();
  }
}
