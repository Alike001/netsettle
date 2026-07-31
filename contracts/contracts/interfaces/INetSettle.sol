// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

interface INetSettle {
    enum Status {
        None,
        Funding,
        Submitting,
        Computing,
        ReadyToFinalize,
        Finalized,
        Failed,
        Expired
    }

    struct RoundSnapshot {
        address[3] participants;
        uint256 collateralCap;
        uint64 submissionDeadline;
        uint64 computeDeadline;
        Status status;
        uint8 fundedMask;
        uint8 submittedMask;
        uint8 claimedMask;
        bytes32[3] sumValidHandles;
        bytes32[3] withinCapHandles;
        bytes32[3] netPayHandles;
        bytes32[3] netReceiveHandles;
        uint256[3] finalPay;
        uint256[3] finalReceive;
    }

    error AlreadyClaimed();
    error AlreadyFunded();
    error AlreadySubmitted();
    error DeadlineNotReached();
    error DeadlinePassed();
    error DuplicateParticipant();
    error InvalidCollateral();
    error InvalidConservation();
    error InvalidDeadline();
    error InvalidParticipant();
    error InvalidResult();
    error InvalidTimeout();
    error NotFunded();
    error NotParticipant();
    error RoundTimedOut();
    error UnsupportedTokenBehavior();
    error UnknownRound();
    error WrongStatus(Status expected, Status actual);
    error ZeroAddress();

    event ObligationsSubmitted(uint256 indexed roundId, address indexed participant);
    event RefundClaimed(uint256 indexed roundId, address indexed participant, uint256 amount);
    event RoundCreated(uint256 indexed roundId, address[3] participants, uint256 collateralCap);
    event RoundFinalized(uint256 indexed roundId, uint256 totalPaid);
    event RoundFunded(uint256 indexed roundId, address indexed participant);
    event RoundStatusChanged(uint256 indexed roundId, Status previousStatus, Status newStatus);
    event WithdrawalClaimed(uint256 indexed roundId, address indexed participant, uint256 amount);

    function createRound(
        address[3] calldata participants,
        uint256 collateralCap,
        uint64 submissionDeadline
    ) external returns (uint256 roundId);

    function fundRound(uint256 roundId) external;

    function submitObligations(
        uint256 roundId,
        externalEuint256[2] calldata handles,
        bytes[2] calldata proofs
    ) external;

    function validateRound(
        uint256 roundId,
        bytes[3] calldata sumProofs,
        bytes[3] calldata capProofs
    ) external;

    function finalizeRound(
        uint256 roundId,
        bytes[3] calldata payProofs,
        bytes[3] calldata receiveProofs
    ) external;

    function withdraw(uint256 roundId) external;
    function expireRound(uint256 roundId) external;
    function claimRefund(uint256 roundId) external;
    function getRound(uint256 roundId) external view returns (RoundSnapshot memory snapshot);
}
