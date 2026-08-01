import { act, renderHook, waitFor } from '@testing-library/react';
import { getAddress, zeroHash } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoundStatus, type RoundSnapshot } from '../lib/round';
import { useRoundActions } from './useRoundActions';

const state = vi.hoisted(() => ({
  connection: {
    address: '0x0000000000000000000000000000000000000001',
    chainId: 11155111,
    status: 'connected',
  },
  handleClient: {
    encryptInput: vi.fn(),
    publicDecrypt: vi.fn(),
  },
  publicClient: {
    waitForTransactionReceipt: vi.fn(),
  },
  writeContractAsync: vi.fn(),
}));

vi.mock('@iexec-nox/handle', () => ({
  createViemHandleClient: vi.fn(() => state.handleClient),
}));

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();

  return {
    ...actual,
    useConnection: () => state.connection,
    usePublicClient: () => state.publicClient,
    useWriteContract: () => ({ writeContractAsync: state.writeContractAsync }),
  };
});

const participants = [
  getAddress('0x0000000000000000000000000000000000000001'),
  getAddress('0x0000000000000000000000000000000000000002'),
  getAddress('0x0000000000000000000000000000000000000003'),
] as const;

const round: RoundSnapshot = {
  participants,
  collateralCap: 10_000_000n,
  submissionDeadline: 10_000n,
  computeDeadline: 20_000n,
  status: RoundStatus.Computing,
  fundedMask: 7,
  submittedMask: 7,
  claimedMask: 0,
  sumValidHandles: [zeroHash, zeroHash, zeroHash],
  withinCapHandles: [zeroHash, zeroHash, zeroHash],
  netPayHandles: [zeroHash, zeroHash, zeroHash],
  netReceiveHandles: [zeroHash, zeroHash, zeroHash],
  finalPay: [0n, 0n, 0n],
  finalReceive: [0n, 0n, 0n],
};

function renderActions() {
  return renderHook(() =>
    useRoundActions({
      contractAddress: getAddress('0x0000000000000000000000000000000000000009'),
      onConfirmed: vi.fn().mockResolvedValue(undefined),
      round,
      roundId: 1n,
      tokenAddress: getAddress('0x0000000000000000000000000000000000000008'),
    }),
  );
}

function installInjectedWallet() {
  Object.defineProperty(window, 'ethereum', {
    configurable: true,
    value: { request: vi.fn() },
    writable: true,
  });
}

beforeEach(() => {
  state.handleClient.encryptInput.mockReset();
  state.handleClient.publicDecrypt.mockReset();
  state.publicClient.waitForTransactionReceipt.mockReset();
  state.writeContractAsync.mockReset();
  installInjectedWallet();
});

afterEach(() => {
  Object.defineProperty(window, 'ethereum', {
    configurable: true,
    value: undefined,
    writable: true,
  });
});

describe('useRoundActions failures', () => {
  it('reports a rejected wallet transaction and clears its pending state', async () => {
    state.writeContractAsync.mockRejectedValueOnce(new Error('User rejected request'));
    const { result } = renderActions();

    await act(async () => {
      await expect(result.current.actions.fund()).rejects.toThrow('User rejected request');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('The wallet request was rejected.');
    });
    expect(result.current.pending).toBeUndefined();
  });

  it('does not attempt Nox encryption when there is no injected wallet', async () => {
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const { result } = renderActions();

    await act(async () => {
      await expect(result.current.actions.submit([1n, 0n])).rejects.toThrow(
        'An injected wallet is required to use Nox.',
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe('An injected wallet is required to use Nox.');
    });
    expect(state.handleClient.encryptInput).not.toHaveBeenCalled();
  });

  it('surfaces a Nox public-proof failure without requesting a settlement transaction', async () => {
    state.handleClient.publicDecrypt.mockRejectedValueOnce(
      new Error('Nox gateway is unavailable.'),
    );
    const { result } = renderActions();

    await act(async () => {
      await expect(result.current.actions.validate()).rejects.toThrow(
        'Nox gateway is unavailable.',
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Nox gateway is unavailable.');
    });
    expect(result.current.pending).toBeUndefined();
    expect(state.writeContractAsync).not.toHaveBeenCalled();
  });
});
