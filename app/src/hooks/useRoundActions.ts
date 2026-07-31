import { createViemHandleClient } from '@iexec-nox/handle';
import type { Handle, HexString } from '@iexec-nox/handle';
import { useState } from 'react';
import { createWalletClient, custom, type Address, type Hash } from 'viem';
import { useConnection, usePublicClient, useWriteContract } from 'wagmi';
import { appConfig } from '../config';
import { erc20Abi, netSettleAbi } from '../contracts/abis';
import { errorMessage } from '../lib/format';
import type { RoundSnapshot } from '../lib/round';

type PendingState = {
  label: string;
  hash?: Hash;
};

type ActionContext = {
  contractAddress: Address | undefined;
  onConfirmed: () => Promise<void>;
  round: RoundSnapshot | undefined;
  roundId: bigint | undefined;
  tokenAddress: Address | undefined;
};

export function useRoundActions(context: ActionContext) {
  const [pending, setPending] = useState<PendingState>();
  const [error, setError] = useState<string>();
  const connection = useConnection();
  const publicClient = usePublicClient({ chainId: appConfig.chain.id });
  const write = useWriteContract();

  async function run(label: string, operation: () => Promise<void>) {
    setError(undefined);
    setPending({ label });
    try {
      await operation();
      await context.onConfirmed();
    } catch (caught) {
      setError(errorMessage(caught));
      throw caught;
    } finally {
      setPending(undefined);
    }
  }

  async function send(label: string, request: Parameters<typeof write.writeContractAsync>[0]) {
    if (!publicClient) throw new Error('Ethereum Sepolia RPC is unavailable.');
    setPending({ label });
    const hash = await write.writeContractAsync(request);
    setPending({ label: 'Waiting for confirmation', hash });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('The transaction reverted.');
  }

  async function handleClient() {
    if (!connection.address) throw new Error('Connect a wallet before using Nox.');
    if (!window.ethereum) throw new Error('An injected wallet is required to use Nox.');

    // The Handle SDK validates the runtime shape of a Viem WalletClient. Wagmi's
    // connector client is a generic client, so build the documented wallet client
    // directly from the injected provider and pin it to the connected account.
    const walletClient = createWalletClient({
      account: connection.address,
      chain: appConfig.chain,
      transport: custom(window.ethereum),
    });
    return createViemHandleClient(walletClient);
  }

  function requireRound() {
    if (!context.contractAddress || !context.roundId || !context.round) {
      throw new Error('The round is not available.');
    }
    return {
      address: context.contractAddress,
      round: context.round,
      roundId: context.roundId,
    };
  }

  const actions = {
    approve: async () =>
      run('Approving collateral', async () => {
        const { address, round } = requireRound();
        if (!context.tokenAddress) throw new Error('The settlement token is unavailable.');
        await send('Confirm approval in your wallet', {
          address: context.tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [address, round.collateralCap],
          chainId: appConfig.chain.id,
        });
      }),

    createRound: async (
      participants: readonly [Address, Address, Address],
      collateralCap: bigint,
      deadline: bigint,
    ) =>
      run('Creating round', async () => {
        if (!context.contractAddress) throw new Error('The contract is not configured.');
        await send('Confirm round creation in your wallet', {
          address: context.contractAddress,
          abi: netSettleAbi,
          functionName: 'createRound',
          args: [participants, collateralCap, deadline],
          chainId: appConfig.chain.id,
        });
      }),

    expire: async () =>
      run('Expiring round', async () => {
        const { address, roundId } = requireRound();
        await send('Confirm expiry in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'expireRound',
          args: [roundId],
          chainId: appConfig.chain.id,
        });
      }),

    finalize: async () =>
      run('Opening verified net positions', async () => {
        const { address, round, roundId } = requireRound();
        const client = await handleClient();
        const pay = await publicDecryptThree(
          (handle) => client.publicDecrypt(handle),
          round.netPayHandles,
        );
        const receive = await publicDecryptThree(
          (handle) => client.publicDecrypt(handle),
          round.netReceiveHandles,
        );
        await send('Confirm final settlement in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'finalizeRound',
          args: [roundId, pay, receive],
          chainId: appConfig.chain.id,
        });
      }),

    fund: async () =>
      run('Funding round', async () => {
        const { address, roundId } = requireRound();
        await send('Confirm collateral deposit in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'fundRound',
          args: [roundId],
          chainId: appConfig.chain.id,
        });
      }),

    refund: async () =>
      run('Claiming refund', async () => {
        const { address, roundId } = requireRound();
        await send('Confirm refund in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'claimRefund',
          args: [roundId],
          chainId: appConfig.chain.id,
        });
      }),

    submit: async (values: readonly [bigint, bigint]) =>
      run('Requesting Nox encryption', async () => {
        const { address, roundId } = requireRound();
        const client = await handleClient();
        const encrypted = await Promise.all(
          values.map((value) => client.encryptInput(value, 'uint256', address)),
        );
        await send('Confirm encrypted submission in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'submitObligations',
          args: [
            roundId,
            [encrypted[0]!.handle, encrypted[1]!.handle],
            [encrypted[0]!.handleProof, encrypted[1]!.handleProof],
          ],
          chainId: appConfig.chain.id,
        });
      }),

    validate: async () =>
      run('Fetching Nox safety proofs', async () => {
        const { address, round, roundId } = requireRound();
        const client = await handleClient();
        const sums = await publicDecryptThree(
          (handle) => client.publicDecrypt(handle),
          round.sumValidHandles,
        );
        const caps = await publicDecryptThree(
          (handle) => client.publicDecrypt(handle),
          round.withinCapHandles,
        );
        await send('Confirm safety validation in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'validateRound',
          args: [roundId, sums, caps],
          chainId: appConfig.chain.id,
        });
      }),

    withdraw: async () =>
      run('Withdrawing entitlement', async () => {
        const { address, roundId } = requireRound();
        await send('Confirm withdrawal in your wallet', {
          address,
          abi: netSettleAbi,
          functionName: 'withdraw',
          args: [roundId],
          chainId: appConfig.chain.id,
        });
      }),
  };

  return {
    actions,
    clearError: () => setError(undefined),
    error,
    pending,
  };
}

async function publicDecryptThree(
  publicDecrypt: (
    handle: Handle<'bool'> | Handle<'uint256'>,
  ) => Promise<{ decryptionProof: HexString }>,
  handles: RoundSnapshot['sumValidHandles'],
) {
  const decrypted = await Promise.all(
    handles.map((handle) => publicDecrypt(handle as Handle<'bool'> | Handle<'uint256'>)),
  );
  return [
    decrypted[0]!.decryptionProof,
    decrypted[1]!.decryptionProof,
    decrypted[2]!.decryptionProof,
  ] as const;
}
