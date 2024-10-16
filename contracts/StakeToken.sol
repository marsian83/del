// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeToken is ERC20, ReentrancyGuard, Ownable {
  uint8 private immutable _decimals = 6;

  constructor(
    string memory name_,
    string memory symbol_
  ) ERC20(name_, symbol_) Ownable(_msgSender()) {}

  function decimals() public pure override returns (uint8) {
    return _decimals;
  }

  function mint(
    address account_,
    uint256 value_
  ) external onlyOwner nonReentrant {
    _mint(account_, value_);
  }

  function burn(
    address account_,
    uint256 value_
  ) external onlyOwner nonReentrant {
    _burn(account_, value_);
  }
}
