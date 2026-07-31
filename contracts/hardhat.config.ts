import noxPlugin from '@iexec-nox/nox-hardhat-plugin';
import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import { configVariable, defineConfig } from 'hardhat/config';

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, noxPlugin],
  solidity: {
    profiles: {
      default: {
        version: '0.8.35',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    default: {
      type: 'edr-simulated',
      chainId: 31337,
    },
    sepoliaReadOnly: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
  },
});
