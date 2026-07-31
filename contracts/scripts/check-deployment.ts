import { network } from 'hardhat';

import {
  COMPUTE_TIMEOUT_SECONDS,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  NETSETTLE_SEPOLIA_ADDRESS,
  NETSETTLE_SEPOLIA_DEPLOYMENT_BLOCK,
  SEPOLIA_USDC_ADDRESS,
} from '../src/sepolia.js';

const netSettleDeploymentAbi = [
  {
    type: 'function',
    name: 'computeTimeout',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'roundCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'token',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const chainId = await publicClient.getChainId();

if (chainId !== ETHEREUM_SEPOLIA_CHAIN_ID) {
  throw new Error(
    'RPC chain mismatch: expected ' + ETHEREUM_SEPOLIA_CHAIN_ID + ', received ' + chainId,
  );
}

const [code, token, computeTimeout, roundCount] = await Promise.all([
  publicClient.getCode({ address: NETSETTLE_SEPOLIA_ADDRESS }),
  publicClient.readContract({
    address: NETSETTLE_SEPOLIA_ADDRESS,
    abi: netSettleDeploymentAbi,
    functionName: 'token',
  }),
  publicClient.readContract({
    address: NETSETTLE_SEPOLIA_ADDRESS,
    abi: netSettleDeploymentAbi,
    functionName: 'computeTimeout',
  }),
  publicClient.readContract({
    address: NETSETTLE_SEPOLIA_ADDRESS,
    abi: netSettleDeploymentAbi,
    functionName: 'roundCount',
  }),
]);

if (!code || code === '0x') {
  throw new Error('No NetSettle bytecode at ' + NETSETTLE_SEPOLIA_ADDRESS);
}
if (token.toLowerCase() !== SEPOLIA_USDC_ADDRESS.toLowerCase()) {
  throw new Error('Unexpected settlement token: ' + token);
}
if (computeTimeout !== COMPUTE_TIMEOUT_SECONDS) {
  throw new Error('Unexpected compute timeout: ' + computeTimeout);
}

console.log('NetSettle Sepolia deployment check passed');
console.log('Contract: ' + NETSETTLE_SEPOLIA_ADDRESS);
console.log('Deployment block: ' + NETSETTLE_SEPOLIA_DEPLOYMENT_BLOCK);
console.log('Settlement token: ' + token);
console.log('Compute timeout: ' + computeTimeout + ' seconds');
console.log('Round count: ' + roundCount);
