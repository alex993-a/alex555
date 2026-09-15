// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply HBR token for local EVM testing only.
contract HBRToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 ether;

    /// @param initialHolder Address receiving the entire fixed supply.
    constructor(address initialHolder) ERC20("HBR Token (Local Prototype)", "HBR") {
        require(initialHolder != address(0), "HBR: zero initial holder");
        _mint(initialHolder, INITIAL_SUPPLY);
    }
}
