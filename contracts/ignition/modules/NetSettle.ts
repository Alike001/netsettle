import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

import { COMPUTE_TIMEOUT_SECONDS, SEPOLIA_USDC_ADDRESS } from '../../src/sepolia.js';

export default buildModule('NetSettleModule', (m) => {
  const netSettle = m.contract('NetSettle', [SEPOLIA_USDC_ADDRESS, COMPUTE_TIMEOUT_SECONDS]);

  return { netSettle };
});
