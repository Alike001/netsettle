import { fallback, getAddress, http, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const netSettleSepoliaDeployment = {
  address: getAddress('0x9f10b266F90638fC058e0891901082Fe9eccD8EA'),
  block: 11_388_543n,
  successfulRoundId: 1n,
  transactionHash: '0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee',
} as const;

const defaultSepoliaRpcUrls = [
  'https://sepolia.drpc.org',
  'https://sepolia.gateway.tenderly.co',
] as const;

function readAddress(value: string | undefined) {
  return value && isAddress(value) ? getAddress(value) : undefined;
}

function readBlock(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  return BigInt(value);
}

const contractAddress =
  readAddress(import.meta.env.VITE_NETSETTLE_ADDRESS) ?? netSettleSepoliaDeployment.address;

export const appConfig = {
  chain: sepolia,
  contractAddress,
  deploymentBlock:
    readBlock(import.meta.env.VITE_DEPLOYMENT_BLOCK) ?? netSettleSepoliaDeployment.block,
  explorerUrl: sepolia.blockExplorers.default.url,
  successfulRoundId:
    contractAddress === netSettleSepoliaDeployment.address
      ? netSettleSepoliaDeployment.successfulRoundId
      : undefined,
} as const;

export const wagmiConfig = createConfig({
  batch: {
    multicall: false,
  },
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback(
      import.meta.env.VITE_SEPOLIA_RPC_URL
        ? [
            http(import.meta.env.VITE_SEPOLIA_RPC_URL),
            ...defaultSepoliaRpcUrls.map((url) => http(url)),
          ]
        : defaultSepoliaRpcUrls.map((url) => http(url)),
    ),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
