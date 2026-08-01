import { getAddress, zeroHash } from 'viem';
import { describe, expect, it } from 'vitest';
import {
  RoundStatus,
  actionFor,
  canOfferNewRound,
  hasMaskBit,
  lifecycleFor,
  parseObligations,
  participantIndex,
  total,
  withdrawalEntitlement,
} from './round';
import type { RoundSnapshot } from './round';

const participants = [
  getAddress('0x0000000000000000000000000000000000000001'),
  getAddress('0x0000000000000000000000000000000000000002'),
  getAddress('0x0000000000000000000000000000000000000003'),
] as const;

function snapshot(overrides: Partial<RoundSnapshot> = {}): RoundSnapshot {
  return {
    participants,
    collateralCap: 100n,
    submissionDeadline: 1_000n,
    computeDeadline: 2_000n,
    status: RoundStatus.Funding,
    fundedMask: 0,
    submittedMask: 0,
    claimedMask: 0,
    sumValidHandles: [zeroHash, zeroHash, zeroHash],
    withinCapHandles: [zeroHash, zeroHash, zeroHash],
    netPayHandles: [zeroHash, zeroHash, zeroHash],
    netReceiveHandles: [zeroHash, zeroHash, zeroHash],
    finalPay: [0n, 0n, 0n],
    finalReceive: [0n, 0n, 0n],
    ...overrides,
  };
}

describe('round view model', () => {
  it('matches connected participants without case sensitivity', () => {
    expect(participantIndex(participants, participants[1])).toBe(1);
    expect(
      participantIndex(participants, participants[1].toLowerCase() as (typeof participants)[1]),
    ).toBe(1);
    expect(
      participantIndex(participants, getAddress('0x0000000000000000000000000000000000000004')),
    ).toBe(-1);
  });

  it('decodes each participant bit independently', () => {
    expect(hasMaskBit(5, 0)).toBe(true);
    expect(hasMaskBit(5, 1)).toBe(false);
    expect(hasMaskBit(5, 2)).toBe(true);
  });

  it('derives the active lifecycle stage and completed predecessors', () => {
    const lifecycle = lifecycleFor(
      snapshot({
        status: RoundStatus.Computing,
        fundedMask: 7,
        submittedMask: 7,
      }),
    );
    expect(lifecycle.map((item) => item.state)).toEqual([
      'complete',
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ]);
    expect(lifecycle[2]?.detail).toBe('Safety proofs pending');
  });

  it('marks a failed computation without pretending settlement completed', () => {
    const lifecycle = lifecycleFor(
      snapshot({
        status: RoundStatus.Failed,
        fundedMask: 7,
        submittedMask: 7,
      }),
    );
    expect(lifecycle[2]?.state).toBe('failed');
    expect(lifecycle[3]?.state).toBe('upcoming');
    expect(lifecycle[3]?.detail).toBe('Public proof pending');
  });

  it('computes exact entitlements and conservation from public results', () => {
    const finalized = snapshot({
      status: RoundStatus.Finalized,
      finalPay: [40n, 0n, 0n],
      finalReceive: [0n, 30n, 10n],
    });
    expect(withdrawalEntitlement(finalized, 0)).toBe(60n);
    expect(withdrawalEntitlement(finalized, 1)).toBe(130n);
    expect(withdrawalEntitlement(finalized, 2)).toBe(110n);
    expect(total(finalized.finalPay)).toBe(total(finalized.finalReceive));
  });

  it('requires approval before funding and never offers a duplicate deposit', () => {
    const funding = snapshot();
    expect(actionFor(funding, 0, 99n, 500n)).toBe('approve');
    expect(actionFor(funding, 0, 100n, 500n)).toBe('fund');
    expect(actionFor(snapshot({ fundedMask: 1 }), 0, 100n, 500n)).toBe('wait');
  });

  it('turns elapsed live stages into an explicit expiry action', () => {
    expect(actionFor(snapshot(), 0, 0n, 1_000n)).toBe('expire');
    expect(
      actionFor(
        snapshot({
          status: RoundStatus.Computing,
          computeDeadline: 2_000n,
          fundedMask: 7,
          submittedMask: 7,
        }),
        0,
        0n,
        2_000n,
      ),
    ).toBe('expire');
  });

  it('offers refunds only to funded participants who have not claimed', () => {
    const failed = snapshot({
      status: RoundStatus.Failed,
      fundedMask: 5,
      claimedMask: 1,
    });
    expect(actionFor(failed, 0, 0n, 500n)).toBe('wait');
    expect(actionFor(failed, 1, 0n, 500n)).toBe('wait');
    expect(actionFor(failed, 2, 0n, 500n)).toBe('refund');
  });

  it('keeps active participants focused but never traps observers or closed rounds', () => {
    const active = snapshot({ status: RoundStatus.Funding });
    expect(canOfferNewRound(active, 0)).toBe(false);
    expect(canOfferNewRound(active, -1)).toBe(true);

    expect(canOfferNewRound(snapshot({ status: RoundStatus.Finalized, claimedMask: 7 }), 0)).toBe(
      true,
    );
    expect(canOfferNewRound(snapshot({ status: RoundStatus.Failed, claimedMask: 7 }), 0)).toBe(
      true,
    );
    expect(canOfferNewRound(snapshot({ status: RoundStatus.Expired, claimedMask: 7 }), 0)).toBe(
      true,
    );
  });

  it('accepts zero obligations but rejects malformed, negative, or over-cap input', () => {
    expect(parseObligations(['', '0'], 18, 100n)).toEqual([0n, 0n]);
    expect(() => parseObligations(['not-a-number', '0'], 18, 100n)).toThrow(
      'Enter two valid token amounts.',
    );
    expect(() => parseObligations(['-1', '0'], 0, 100n)).toThrow('Amounts cannot be negative.');
    expect(() => parseObligations(['70', '31'], 0, 100n)).toThrow(
      'cannot exceed your collateral cap',
    );
  });
});
