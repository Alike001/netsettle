import { render, screen } from '@testing-library/react';
import { getAddress, zeroHash } from 'viem';
import { describe, expect, it } from 'vitest';
import { RoundStatus, type RoundSnapshot } from '../lib/round';
import { ClearingWorkspace } from './ClearingWorkspace';

const participants = [
  getAddress('0x0000000000000000000000000000000000000001'),
  getAddress('0x0000000000000000000000000000000000000002'),
  getAddress('0x0000000000000000000000000000000000000003'),
] as const;

const finalizedClaimedRound: RoundSnapshot = {
  participants,
  collateralCap: 10_000_000n,
  submissionDeadline: 1_000n,
  computeDeadline: 0n,
  status: RoundStatus.Finalized,
  fundedMask: 7,
  submittedMask: 7,
  claimedMask: 7,
  sumValidHandles: [zeroHash, zeroHash, zeroHash],
  withinCapHandles: [zeroHash, zeroHash, zeroHash],
  netPayHandles: [zeroHash, zeroHash, zeroHash],
  netReceiveHandles: [zeroHash, zeroHash, zeroHash],
  finalPay: [1_000_000n, 0n, 1_000_000n],
  finalReceive: [0n, 2_000_000n, 0n],
};

describe('ClearingWorkspace', () => {
  it('retains each public net position after the withdrawal is claimed', () => {
    render(<ClearingWorkspace decimals={6} round={finalizedClaimedRound} symbol="USDC" />);

    expect(screen.getAllByText('Pays 1 USDC · claimed')).toHaveLength(4);
    expect(screen.getAllByText('Receives 2 USDC · claimed')).toHaveLength(2);
    expect(screen.getByText('2 USDC paid = 2 USDC received')).toBeInTheDocument();
  });
});
