import { getAddress } from 'viem';
import { describe, expect, it } from 'vitest';

import { appConfig, netSettleSepoliaDeployment } from './config';

describe('public Sepolia deployment configuration', () => {
  it('opens the verified NetSettle deployment without private environment setup', () => {
    expect(netSettleSepoliaDeployment.address).toBe(
      getAddress('0x9f10b266F90638fC058e0891901082Fe9eccD8EA'),
    );
    expect(netSettleSepoliaDeployment.block).toBe(11_388_543n);
    expect(netSettleSepoliaDeployment.successfulRoundId).toBe(1n);
    expect(appConfig.contractAddress).toBe(netSettleSepoliaDeployment.address);
    expect(appConfig.deploymentBlock).toBe(netSettleSepoliaDeployment.block);
    expect(appConfig.successfulRoundId).toBe(netSettleSepoliaDeployment.successfulRoundId);
  });
});
