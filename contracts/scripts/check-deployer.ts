import { network } from 'hardhat';
import { formatEther } from 'viem';

import { ETHEREUM_SEPOLIA_CHAIN_ID } from '../src/sepolia.js';

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

if (!walletClient) {
  throw new Error('No Sepolia deployment account is configured');
}

const chainId = await publicClient.getChainId();
if (chainId !== ETHEREUM_SEPOLIA_CHAIN_ID) {
  throw new Error(`RPC chain mismatch: expected ${ETHEREUM_SEPOLIA_CHAIN_ID}, received ${chainId}`);
}

const address = walletClient.account.address;
const balance = await publicClient.getBalance({ address });

console.log('Sepolia deployer check passed');
console.log(`Public address: ${address}`);
console.log(`Sepolia ETH balance: ${formatEther(balance)} ETH`);
console.log('No transaction was signed or sent.');
