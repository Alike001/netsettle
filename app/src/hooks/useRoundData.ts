import { useMemo } from 'react';
import type { Address } from 'viem';
import { useConnection, useContractEvents, useReadContract } from 'wagmi';
import { appConfig } from '../config';
import { erc20Abi, netSettleAbi } from '../contracts/abis';
import type { RoundSnapshot } from '../lib/round';

function requestedRoundId() {
  const raw = new URLSearchParams(window.location.search).get('round');
  if (!raw || !/^[1-9]\d*$/.test(raw)) return undefined;
  return BigInt(raw);
}

export function useRoundData() {
  const contractAddress = appConfig.contractAddress;
  const { address } = useConnection();
  const enabled = Boolean(contractAddress);
  const requested = useMemo(() => requestedRoundId(), []);

  const roundCountQuery = useReadContract({
    address: contractAddress,
    abi: netSettleAbi,
    functionName: 'roundCount',
    chainId: appConfig.chain.id,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });
  const roundCount = roundCountQuery.data;
  const roundId = requested ?? (roundCount && roundCount > 0n ? roundCount : undefined);

  const tokenQuery = useReadContract({
    address: contractAddress,
    abi: netSettleAbi,
    functionName: 'token',
    chainId: appConfig.chain.id,
    query: { enabled },
  });
  const tokenAddress = tokenQuery.data;

  const roundQuery = useReadContract({
    address: contractAddress,
    abi: netSettleAbi,
    functionName: 'getRound',
    args: roundId ? [roundId] : undefined,
    chainId: appConfig.chain.id,
    query: {
      enabled: enabled && Boolean(roundId),
      refetchInterval: 6_000,
    },
  });

  const symbolQuery = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId: appConfig.chain.id,
    query: { enabled: Boolean(tokenAddress) },
  });
  const decimalsQuery = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: appConfig.chain.id,
    query: { enabled: Boolean(tokenAddress) },
  });
  const allowanceQuery = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: tokenAddress && address && contractAddress ? [address, contractAddress] : undefined,
    chainId: appConfig.chain.id,
    query: {
      enabled: Boolean(tokenAddress && address && contractAddress),
      refetchInterval: 10_000,
    },
  });

  const activityQuery = useContractEvents({
    address: contractAddress,
    abi: netSettleAbi,
    fromBlock: appConfig.deploymentBlock,
    toBlock: 'latest',
    chainId: appConfig.chain.id,
    strict: true,
    query: {
      enabled: enabled && Boolean(roundId && appConfig.deploymentBlock),
      refetchInterval: 12_000,
    },
  });

  const activity = useMemo(() => {
    if (!roundId) return [];
    return (activityQuery.data ?? [])
      .filter((event) => {
        const args = event.args as { roundId?: bigint };
        return args.roundId === roundId;
      })
      .sort((left, right) => Number((right.blockNumber ?? 0n) - (left.blockNumber ?? 0n)));
  }, [activityQuery.data, roundId]);

  async function refetch() {
    await Promise.all([
      roundCountQuery.refetch(),
      tokenQuery.refetch(),
      roundQuery.refetch(),
      allowanceQuery.refetch(),
      activityQuery.refetch(),
    ]);
  }

  return {
    activity,
    activityConfigured: appConfig.deploymentBlock !== undefined,
    allowance: allowanceQuery.data ?? 0n,
    contractAddress,
    decimals: decimalsQuery.data ?? 18,
    error:
      roundCountQuery.error ??
      tokenQuery.error ??
      roundQuery.error ??
      symbolQuery.error ??
      decimalsQuery.error,
    isLoading:
      enabled &&
      (roundCountQuery.isLoading ||
        tokenQuery.isLoading ||
        (Boolean(roundId) && roundQuery.isLoading)),
    refetch,
    round: roundQuery.data as RoundSnapshot | undefined,
    roundCount: roundCount ?? 0n,
    roundId,
    symbol: symbolQuery.data ?? 'TOKEN',
    tokenAddress: tokenAddress as Address | undefined,
  };
}
