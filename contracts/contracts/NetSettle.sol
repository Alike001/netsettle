// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {Nox, ebool, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {INetSettle} from "./interfaces/INetSettle.sol";
import {SettlementRound} from "./NetSettleStorage.sol";

contract NetSettle is INetSettle, ReentrancyGuard {
    using SafeERC20 for IERC20;


    IERC20 public immutable token;
    uint64 public immutable computeTimeout;
    uint256 public roundCount;

    mapping(uint256 roundId => SettlementRound round) private _rounds;
    mapping(uint256 roundId => mapping(address participant => uint8 indexPlusOne))
        private _participantIndex;

    constructor(IERC20 settlementToken, uint64 timeoutSeconds) {
        if (address(settlementToken) == address(0)) revert ZeroAddress();
        if (timeoutSeconds == 0) revert InvalidTimeout();
        token = settlementToken;
        computeTimeout = timeoutSeconds;
    }

    function createRound(
        address[3] calldata participants,
        uint256 collateralCap,
        uint64 submissionDeadline
    ) external override returns (uint256 roundId) {
        if (collateralCap == 0 || collateralCap > type(uint256).max / 3) {
            revert InvalidCollateral();
        }
        if (submissionDeadline <= block.timestamp) revert InvalidDeadline();

        for (uint8 i; i < 3; ++i) {
            if (participants[i] == address(0)) revert InvalidParticipant();
            for (uint8 j; j < i; ++j) {
                if (participants[i] == participants[j]) revert DuplicateParticipant();
            }
        }

        roundId = ++roundCount;
        SettlementRound storage round = _rounds[roundId];
        round.participants = participants;
        round.collateralCap = collateralCap;
        round.submissionDeadline = submissionDeadline;
        round.status = Status.Funding;
        for (uint8 i; i < 3; ++i) {
            _participantIndex[roundId][participants[i]] = i + 1;
        }

        emit RoundCreated(roundId, participants, collateralCap);
        emit RoundStatusChanged(roundId, Status.None, Status.Funding);
    }

    function fundRound(uint256 roundId) external override nonReentrant {
        SettlementRound storage round = _loadRound(roundId);
        _requireStatus(round, Status.Funding);
        _requireBefore(round.submissionDeadline);
        uint8 index = _indexOf(roundId, msg.sender);
        uint8 bit = uint8(1 << index);
        if (round.fundedMask & bit != 0) revert AlreadyFunded();

        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), round.collateralCap);
        if (token.balanceOf(address(this)) - balanceBefore != round.collateralCap) {
            revert UnsupportedTokenBehavior();
        }

        round.fundedMask |= bit;
        emit RoundFunded(roundId, msg.sender);
        if (round.fundedMask == 7) _setStatus(roundId, round, Status.Submitting);
    }

    function submitObligations(
        uint256 roundId,
        externalEuint256[2] calldata handles,
        bytes[2] calldata proofs
    ) external override {
        SettlementRound storage round = _loadRound(roundId);
        _requireStatus(round, Status.Submitting);
        _requireBefore(round.submissionDeadline);
        uint8 index = _indexOf(roundId, msg.sender);
        uint8 bit = uint8(1 << index);
        if (round.submittedMask & bit != 0) revert AlreadySubmitted();

        for (uint8 i; i < 2; ++i) {
            euint256 obligation = Nox.fromExternal(handles[i], proofs[i]);
            round.obligations[index * 2 + i] = obligation;
            Nox.allowThis(obligation);
        }
        round.submittedMask |= bit;
        emit ObligationsSubmitted(roundId, msg.sender);
        if (round.submittedMask == 7) _startComputation(roundId, round);
    }

    function validateRound(
        uint256 roundId,
        bytes[3] calldata sumProofs,
        bytes[3] calldata capProofs
    ) external override {
        SettlementRound storage round = _loadRound(roundId);
        _requireStatus(round, Status.Computing);
        _requireComputeLive(round);

        bool valid = true;
        for (uint8 i; i < 3; ++i) {
            if (!Nox.publicDecrypt(round.sumValid[i], sumProofs[i])) valid = false;
            if (!Nox.publicDecrypt(round.withinCap[i], capProofs[i])) valid = false;
        }
        if (!valid) {
            _setStatus(roundId, round, Status.Failed);
            return;
        }

        for (uint8 i; i < 3; ++i) {
            Nox.allowPublicDecryption(round.netPay[i]);
            Nox.allowPublicDecryption(round.netReceive[i]);
        }
        round.computeDeadline = uint64(block.timestamp) + computeTimeout;
        _setStatus(roundId, round, Status.ReadyToFinalize);
    }

    function finalizeRound(
        uint256 roundId,
        bytes[3] calldata payProofs,
        bytes[3] calldata receiveProofs
    ) external override {
        SettlementRound storage round = _loadRound(roundId);
        _requireStatus(round, Status.ReadyToFinalize);
        _requireComputeLive(round);

        uint256 totalPay;
        uint256 totalReceive;
        for (uint8 i; i < 3; ++i) {
            uint256 pay = Nox.publicDecrypt(round.netPay[i], payProofs[i]);
            uint256 receiveAmount = Nox.publicDecrypt(
                round.netReceive[i],
                receiveProofs[i]
            );
            if ((pay != 0 && receiveAmount != 0) || pay > round.collateralCap) {
                revert InvalidResult();
            }
            round.finalPay[i] = pay;
            round.finalReceive[i] = receiveAmount;
            totalPay += pay;
            totalReceive += receiveAmount;
        }
        if (totalPay != totalReceive) revert InvalidConservation();

        round.computeDeadline = 0;
        _setStatus(roundId, round, Status.Finalized);
        emit RoundFinalized(roundId, totalPay);
    }

    function withdraw(uint256 roundId) external override nonReentrant {
        SettlementRound storage round = _loadRound(roundId);
        _requireStatus(round, Status.Finalized);
        uint8 index = _indexOf(roundId, msg.sender);
        uint8 bit = uint8(1 << index);
        if (round.claimedMask & bit != 0) revert AlreadyClaimed();

        round.claimedMask |= bit;
        uint256 amount =
            round.collateralCap - round.finalPay[index] + round.finalReceive[index];
        token.safeTransfer(msg.sender, amount);
        emit WithdrawalClaimed(roundId, msg.sender, amount);
    }

    function expireRound(uint256 roundId) external override {
        SettlementRound storage round = _loadRound(roundId);
        bool submissionExpired = (round.status == Status.Funding ||
            round.status == Status.Submitting) &&
            block.timestamp >= round.submissionDeadline;
        bool computationExpired = (round.status == Status.Computing ||
            round.status == Status.ReadyToFinalize) &&
            block.timestamp >= round.computeDeadline;
        if (!submissionExpired && !computationExpired) revert DeadlineNotReached();
        _setStatus(roundId, round, Status.Expired);
    }

    function claimRefund(uint256 roundId) external override nonReentrant {
        SettlementRound storage round = _loadRound(roundId);
        if (round.status != Status.Failed && round.status != Status.Expired) {
            revert WrongStatus(Status.Expired, round.status);
        }
        uint8 index = _indexOf(roundId, msg.sender);
        uint8 bit = uint8(1 << index);
        if (round.fundedMask & bit == 0) revert NotFunded();
        if (round.claimedMask & bit != 0) revert AlreadyClaimed();

        round.claimedMask |= bit;
        token.safeTransfer(msg.sender, round.collateralCap);
        emit RefundClaimed(roundId, msg.sender, round.collateralCap);
    }

    function getRound(
        uint256 roundId
    ) external view override returns (RoundSnapshot memory snapshot) {
        SettlementRound storage round = _loadRound(roundId);
        snapshot.participants = round.participants;
        snapshot.collateralCap = round.collateralCap;
        snapshot.submissionDeadline = round.submissionDeadline;
        snapshot.computeDeadline = round.computeDeadline;
        snapshot.status = round.status;
        snapshot.fundedMask = round.fundedMask;
        snapshot.submittedMask = round.submittedMask;
        snapshot.claimedMask = round.claimedMask;
        snapshot.finalPay = round.finalPay;
        snapshot.finalReceive = round.finalReceive;
        for (uint8 i; i < 3; ++i) {
            snapshot.sumValidHandles[i] = ebool.unwrap(round.sumValid[i]);
            snapshot.withinCapHandles[i] = ebool.unwrap(round.withinCap[i]);
            snapshot.netPayHandles[i] = euint256.unwrap(round.netPay[i]);
            snapshot.netReceiveHandles[i] = euint256.unwrap(round.netReceive[i]);
        }
    }

    function _startComputation(uint256 roundId, SettlementRound storage round) private {
        euint256 cap = Nox.toEuint256(round.collateralCap);
        euint256 zero = Nox.toEuint256(0);
        for (uint8 i; i < 3; ++i) {
            euint256 outgoing;
            (round.sumValid[i], outgoing) = Nox.safeAdd(
                round.obligations[i * 2],
                round.obligations[i * 2 + 1]
            );
            round.withinCap[i] = Nox.le(outgoing, cap);
            (, euint256 incoming) = _incoming(round, i);
            (, euint256 payDelta) = Nox.safeSub(outgoing, incoming);
            (, euint256 receiveDelta) = Nox.safeSub(incoming, outgoing);
            ebool isPayer = Nox.gt(outgoing, incoming);
            round.netPay[i] = Nox.select(isPayer, payDelta, zero);
            round.netReceive[i] = Nox.select(isPayer, zero, receiveDelta);

            Nox.allowThis(round.sumValid[i]);
            Nox.allowThis(round.withinCap[i]);
            Nox.allowThis(round.netPay[i]);
            Nox.allowThis(round.netReceive[i]);
            Nox.allowPublicDecryption(round.sumValid[i]);
            Nox.allowPublicDecryption(round.withinCap[i]);
        }
        round.computeDeadline = uint64(block.timestamp) + computeTimeout;
        _setStatus(roundId, round, Status.Computing);
    }

    function _incoming(
        SettlementRound storage round,
        uint8 index
    ) private returns (ebool valid, euint256 amount) {
        if (index == 0) return Nox.safeAdd(round.obligations[2], round.obligations[4]);
        if (index == 1) return Nox.safeAdd(round.obligations[0], round.obligations[5]);
        return Nox.safeAdd(round.obligations[1], round.obligations[3]);
    }

    function _indexOf(uint256 roundId, address participant) private view returns (uint8 index) {
        uint8 indexPlusOne = _participantIndex[roundId][participant];
        if (indexPlusOne == 0) revert NotParticipant();
        return indexPlusOne - 1;
    }

    function _loadRound(
        uint256 roundId
    ) private view returns (SettlementRound storage round) {
        round = _rounds[roundId];
        if (round.status == Status.None) revert UnknownRound();
    }

    function _requireBefore(uint64 deadline) private view {
        if (block.timestamp >= deadline) revert DeadlinePassed();
    }

    function _requireComputeLive(SettlementRound storage round) private view {
        if (block.timestamp >= round.computeDeadline) revert RoundTimedOut();
    }

    function _requireStatus(SettlementRound storage round, Status expected) private view {
        if (round.status != expected) revert WrongStatus(expected, round.status);
    }

    function _setStatus(
        uint256 roundId,
        SettlementRound storage round,
        Status next
    ) private {
        Status previous = round.status;
        round.status = next;
        emit RoundStatusChanged(roundId, previous, next);
    }
}
