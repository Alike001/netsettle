import { network } from 'hardhat';
import { erc20Abi } from 'viem';

import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  SEPOLIA_NOX_COMPUTE_ADDRESS,
  SEPOLIA_USDC_ADDRESS,
} from '../src/sepolia.js';

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const chainId = await publicClient.getChainId();

if (chainId !== ETHEREUM_SEPOLIA_CHAIN_ID) {
  throw new Error(`RPC chain mismatch: expected ${ETHEREUM_SEPOLIA_CHAIN_ID}, received ${chainId}`);
}

const [usdcCode, noxCode, symbol, decimals] = await Promise.all([
  publicClient.getCode({ address: SEPOLIA_USDC_ADDRESS }),
  publicClient.getCode({ address: SEPOLIA_NOX_COMPUTE_ADDRESS }),
  publicClient.readContract({
    address: SEPOLIA_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'symbol',
  }),
  publicClient.readContract({
    address: SEPOLIA_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'decimals',
  }),
]);

if (!usdcCode || usdcCode === '0x') {
  throw new Error(`No token bytecode at ${SEPOLIA_USDC_ADDRESS}`);
}
if (!noxCode || noxCode === '0x') {
  throw new Error(`No NoxCompute bytecode at ${SEPOLIA_NOX_COMPUTE_ADDRESS}`);
}
if (symbol !== 'USDC' || decimals !== 6) {
  throw new Error(`Unexpected settlement token metadata: ${symbol}/${decimals}`);
}

console.log('Sepolia preflight passed');
console.log(`Chain ID: ${chainId}`);
console.log(`Settlement token: ${symbol} (${decimals} decimals) at ${SEPOLIA_USDC_ADDRESS}`);
console.log(`NoxCompute: ${SEPOLIA_NOX_COMPUTE_ADDRESS}`);
