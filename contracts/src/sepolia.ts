import type { Address } from 'viem';

export const ETHEREUM_SEPOLIA_CHAIN_ID = 11_155_111;

// Official Circle test USDC. It has no financial value.
export const SEPOLIA_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' satisfies Address;

// Address selected by @iexec-nox/nox-protocol-contracts 0.2.4 on Ethereum Sepolia.
export const SEPOLIA_NOX_COMPUTE_ADDRESS =
  '0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF' satisfies Address;

// Gives public proof retrieval time to recover from a transient gateway delay.
export const COMPUTE_TIMEOUT_SECONDS = 3_600n;

// Immutable public evidence from the first NetSettle Ethereum Sepolia deployment.
export const NETSETTLE_SEPOLIA_ADDRESS =
  '0x9f10b266F90638fC058e0891901082Fe9eccD8EA' satisfies Address;
export const NETSETTLE_SEPOLIA_DEPLOYMENT_BLOCK = 11_388_543n;
export const NETSETTLE_SEPOLIA_DEPLOYMENT_TRANSACTION =
  '0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee' as const;
