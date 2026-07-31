import { getAddress, http, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const netSettleSepoliaDeployment = {
  address: getAddress('0x9f10b266F90638fC058e0891901082Fe9eccD8EA'),
  block: 11_388_543n,
  transactionHash: '0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee',
} as const;

const defaultSepoliaRpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';

function readAddress(value: string | undefined) {
  return value && isAddress(value) ? getAddress(value) : undefined;
}

function readBlock(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  return BigInt(value);
}

export const appConfig = {
  chain: sepolia,
  contractAddress:
    readAddress(import.meta.env.VITE_NETSETTLE_ADDRESS) ?? netSettleSepoliaDeployment.address,
  deploymentBlock:
    readBlock(import.meta.env.VITE_DEPLOYMENT_BLOCK) ?? netSettleSepoliaDeployment.block,
  explorerUrl: sepolia.blockExplorers.default.url,
} as const;

export const wagmiConfig = createConfig({
  batch: {
    multicall: false,
  },
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || defaultSepoliaRpcUrl),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
