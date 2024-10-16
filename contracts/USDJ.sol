// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDJ is ERC20, Ownable {
  constructor() ERC20("fake USDJ", "USDJ") Ownable(_msgSender()) {
    _mint(_msgSender(), 100_000_000 * (10 ** decimals()));
  }

  function decimals() public pure override returns (uint8) {
    return 6;
  }

  function mint() public payable {
    require(msg.value > 0, "Invalid message Value");

    _mint(_msgSender(), amountOut(msg.value));
  }

  function amountOut(uint256 value_) public pure returns (uint256) {
    return ((value_ / (10 ** 18)) / 100) * (10 ** decimals());
  }

  function mint(uint256 amount_) external onlyOwner {
    _mint(owner(), amount_);
  }
}
