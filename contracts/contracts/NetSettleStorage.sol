// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {ebool, euint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {INetSettle} from "./interfaces/INetSettle.sol";

struct SettlementRound {
    address[3] participants;
    uint256 collateralCap;
    uint64 submissionDeadline;
    uint64 computeDeadline;
    INetSettle.Status status;
    uint8 fundedMask;
    uint8 submittedMask;
    uint8 claimedMask;
    euint256[6] obligations;
    ebool[3] sumValid;
    ebool[3] withinCap;
    euint256[3] netPay;
    euint256[3] netReceive;
    uint256[3] finalPay;
    uint256[3] finalReceive;
}
