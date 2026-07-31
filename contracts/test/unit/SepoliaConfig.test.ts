import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getAddress, isAddress } from 'viem';

import {
  COMPUTE_TIMEOUT_SECONDS,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  SEPOLIA_NOX_COMPUTE_ADDRESS,
  SEPOLIA_USDC_ADDRESS,
} from '../../src/sepolia.js';

describe('Sepolia deployment configuration', () => {
  it('pins checksummed, distinct protocol dependencies', () => {
    assert.equal(ETHEREUM_SEPOLIA_CHAIN_ID, 11_155_111);
    assert.equal(isAddress(SEPOLIA_USDC_ADDRESS, { strict: true }), true);
    assert.equal(isAddress(SEPOLIA_NOX_COMPUTE_ADDRESS, { strict: true }), true);
    assert.equal(getAddress(SEPOLIA_USDC_ADDRESS), SEPOLIA_USDC_ADDRESS);
    assert.equal(getAddress(SEPOLIA_NOX_COMPUTE_ADDRESS), SEPOLIA_NOX_COMPUTE_ADDRESS);
    assert.notEqual(SEPOLIA_USDC_ADDRESS, SEPOLIA_NOX_COMPUTE_ADDRESS);
  });

  it('allows one hour for asynchronous proof recovery', () => {
    assert.equal(COMPUTE_TIMEOUT_SECONDS, 3_600n);
  });
});
