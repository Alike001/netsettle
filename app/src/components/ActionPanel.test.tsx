import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { getAddress, zeroHash } from 'viem';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoundStatus, type RoundSnapshot } from '../lib/round';
import { ActionPanel } from './ActionPanel';

const walletState = vi.hoisted(() => ({
  connection: {
    address: '0x0000000000000000000000000000000000000004',
    chainId: 11155111,
    status: 'connected',
  },
}));

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();

  return {
    ...actual,
    useConnect: () => ({ connectors: [], isPending: false }),
    useConnection: () => walletState.connection,
    useSwitchChain: () => ({ isPending: false, switchChain: vi.fn() }),
  };
});

const participants = [
  getAddress('0x0000000000000000000000000000000000000001'),
  getAddress('0x0000000000000000000000000000000000000002'),
  getAddress('0x0000000000000000000000000000000000000003'),
] as const;

function round(overrides: Partial<RoundSnapshot> = {}): RoundSnapshot {
  return {
    participants,
    collateralCap: 10_000_000n,
    submissionDeadline: 1_000n,
    computeDeadline: 0n,
    status: RoundStatus.Expired,
    fundedMask: 7,
    submittedMask: 0,
    claimedMask: 7,
    sumValidHandles: [zeroHash, zeroHash, zeroHash],
    withinCapHandles: [zeroHash, zeroHash, zeroHash],
    netPayHandles: [zeroHash, zeroHash, zeroHash],
    netReceiveHandles: [zeroHash, zeroHash, zeroHash],
    finalPay: [0n, 0n, 0n],
    finalReceive: [0n, 0n, 0n],
    ...overrides,
  };
}

const actions = {
  approve: vi.fn(),
  createRound: vi.fn(),
  expire: vi.fn(),
  finalize: vi.fn(),
  fund: vi.fn(),
  refund: vi.fn(),
  submit: vi.fn(),
  validate: vi.fn(),
  withdraw: vi.fn(),
};

afterEach(() => {
  cleanup();
});

function renderPanel(options: {
  connectedParticipantIndex: number;
  onStartNewRound?: () => void;
  round?: RoundSnapshot;
}) {
  return render(
    <ActionPanel
      actions={actions}
      allowance={0n}
      connectedParticipantIndex={options.connectedParticipantIndex}
      decimals={6}
      error={undefined}
      onStartNewRound={options.onStartNewRound}
      pending={undefined}
      round={options.round ?? round()}
      symbol="USDC"
    />,
  );
}

describe('ActionPanel new-round access', () => {
  it('lets an observer start a separate group from a fully refunded expired round', () => {
    const onStartNewRound = vi.fn();
    renderPanel({ connectedParticipantIndex: -1, onStartNewRound });

    expect(screen.getByRole('heading', { name: 'Round is closed' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start separate round' }));
    expect(onStartNewRound).toHaveBeenCalledOnce();
  });

  it('lets a completed participant start a new group after claiming', () => {
    const onStartNewRound = vi.fn();
    renderPanel({ connectedParticipantIndex: 0, onStartNewRound });

    fireEvent.click(screen.getByRole('button', { name: 'Start new round' }));
    expect(onStartNewRound).toHaveBeenCalledOnce();
  });

  it('lets an observer start a separate group without interrupting an active round', () => {
    renderPanel({
      connectedParticipantIndex: -1,
      onStartNewRound: vi.fn(),
      round: round({ status: RoundStatus.Funding, fundedMask: 1, claimedMask: 0 }),
    });

    expect(screen.getByRole('heading', { name: 'Start a separate round' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start separate round' })).toBeInTheDocument();
  });

  it('keeps an active participant focused on the active round', () => {
    renderPanel({
      connectedParticipantIndex: 0,
      onStartNewRound: vi.fn(),
      round: round({ status: RoundStatus.Funding, fundedMask: 1, claimedMask: 0 }),
    });

    expect(screen.getByRole('heading', { name: 'Collateral funded' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start .*round/i })).not.toBeInTheDocument();
  });
});
