import { getAddress, http, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

function readAddress(value: string | undefined) {
  return value && isAddress(value) ? getAddress(value) : undefined;
}

function readBlock(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return BigInt(value);
}

export const appConfig = {
  chain: sepolia,
  contractAddress: readAddress(import.meta.env.VITE_NETSETTLE_ADDRESS),
  deploymentBlock: readBlock(import.meta.env.VITE_DEPLOYMENT_BLOCK),
  explorerUrl: sepolia.blockExplorers.default.url,
} as const;

export const wagmiConfig = createConfig({
  batch: {
    multicall: false,
  },
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || undefined),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
