import type { Address } from 'viem';

export const ETHEREUM_SEPOLIA_CHAIN_ID = 11_155_111;

// Official Circle test USDC. It has no financial value.
export const SEPOLIA_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' satisfies Address;

// Address selected by @iexec-nox/nox-protocol-contracts 0.2.4 on Ethereum Sepolia.
export const SEPOLIA_NOX_COMPUTE_ADDRESS =
  '0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF' satisfies Address;

// Gives public proof retrieval time to recover from a transient gateway delay.
export const COMPUTE_TIMEOUT_SECONDS = 3_600n;
