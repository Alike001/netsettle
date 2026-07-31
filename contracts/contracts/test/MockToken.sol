// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("NetSettle Test USD", "ntUSD") {}

    function mint(address recipient, uint256 amount) external {
        _mint(recipient, amount);
    }
}
