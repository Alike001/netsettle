import { createViemHandleClient } from '@iexec-nox/handle';
import type { HandleClient, HexString } from '@iexec-nox/handle';
import { strict as assert } from 'node:assert';
import type { network } from 'hardhat';
import type { Address, Hash } from 'viem';

export const COLLATERAL = 100n;
export const STARTING_BALANCE = 1_000n;

export type Connection = Awaited<ReturnType<typeof network.getOrCreate>>;
export type Matrix = readonly [
  readonly [bigint, bigint],
  readonly [bigint, bigint],
  readonly [bigint, bigint],
];
export type NoxRuntime = {
  handleGatewayUrl: string;
  noxComputeAddress: Address;
};
export type RoundSnapshot = {
  participants: readonly Address[];
  collateralCap: bigint;
  submissionDeadline: bigint;
  computeDeadline: bigint;
  status: number;
  fundedMask: number;
  submittedMask: number;
  claimedMask: number;
  sumValidHandles: readonly HexString[];
  withinCapHandles: readonly HexString[];
  netPayHandles: readonly HexString[];
  netReceiveHandles: readonly HexString[];
  finalPay: readonly bigint[];
  finalReceive: readonly bigint[];
};

export async function waitFor(
  publicClient: Awaited<ReturnType<Connection['viem']['getPublicClient']>>,
  hashPromise: Promise<Hash>,
) {
  const hash = await hashPromise;
  await publicClient.waitForTransactionReceipt({ hash });
}

export async function openFundedRound(connection: Connection, noxRuntime: NoxRuntime) {
  const { viem } = connection;
  const wallets = await viem.getWalletClients();
  const participants = [wallets[0]!, wallets[1]!, wallets[2]!] as const;
  const publicClient = await viem.getPublicClient();
  const token = await viem.deployContract('MockToken');
  const settlement = await viem.deployContract('NetSettle', [token.address, 600]);

  const handleClients = (await Promise.all(
    participants.map((wallet) => {
      const scopedWallet = wallet.extend(() => ({
        getAddresses: async () => [wallet.account.address] as [Address],
      }));
      return createViemHandleClient(scopedWallet, {
        gatewayUrl: noxRuntime.handleGatewayUrl as `http://${string}` | `https://${string}`,
        smartContractAddress: noxRuntime.noxComputeAddress,
        subgraphUrl: 'https://example.com/subgraphs/id/none',
      });
    }),
  )) as [HandleClient, HandleClient, HandleClient];

  for (const participant of participants) {
    await waitFor(publicClient, token.write.mint([participant.account.address, STARTING_BALANCE]));
    const participantToken = await viem.getContractAt('MockToken', token.address, {
      client: { wallet: participant },
    });
    await waitFor(publicClient, participantToken.write.approve([settlement.address, COLLATERAL]));
  }

  const latestBlock = await publicClient.getBlock();
  const deadline = latestBlock.timestamp + 3_600n;
  const addresses = participants.map((wallet) => wallet.account.address) as [
    Address,
    Address,
    Address,
  ];
  await waitFor(publicClient, settlement.write.createRound([addresses, COLLATERAL, deadline]));

  const participantSettlements = await Promise.all(
    participants.map((wallet) =>
      viem.getContractAt('NetSettle', settlement.address, {
        client: { wallet },
      }),
    ),
  );
  for (const contract of participantSettlements) {
    await waitFor(publicClient, contract.write.fundRound([1n]));
  }

  return {
    deadline,
    handleClients,
    participantSettlements,
    participants,
    publicClient,
    roundId: 1n,
    settlement,
    token,
  };
}

export async function encryptRow(
  context: Awaited<ReturnType<typeof openFundedRound>>,
  participantIndex: number,
  values: readonly [bigint, bigint],
  applicationContract: Address = context.settlement.address,
) {
  const client = context.handleClients[participantIndex];
  assert.ok(client);
  const encrypted = await Promise.all(
    values.map((value) => client.encryptInput(value, 'uint256', applicationContract)),
  );
  assert.equal(encrypted.length, 2);
  return encrypted as [
    Awaited<ReturnType<HandleClient['encryptInput']>>,
    Awaited<ReturnType<HandleClient['encryptInput']>>,
  ];
}

export async function submitRow(
  context: Awaited<ReturnType<typeof openFundedRound>>,
  participantIndex: number,
  encrypted: Awaited<ReturnType<typeof encryptRow>>,
) {
  const contract = context.participantSettlements[participantIndex];
  assert.ok(contract);
  await waitFor(
    context.publicClient,
    contract.write.submitObligations([
      context.roundId,
      [encrypted[0].handle, encrypted[1].handle],
      [encrypted[0].handleProof, encrypted[1].handleProof],
    ]),
  );
}

export async function submitMatrix(
  context: Awaited<ReturnType<typeof openFundedRound>>,
  matrix: Matrix,
) {
  const rows = [] as Awaited<ReturnType<typeof encryptRow>>[];
  for (let i = 0; i < 3; i += 1) {
    const values = matrix[i];
    assert.ok(values);
    const encrypted = await encryptRow(context, i, values);
    await submitRow(context, i, encrypted);
    rows.push(encrypted);
  }
  return rows;
}

export async function readRound(context: Awaited<ReturnType<typeof openFundedRound>>) {
  return (await context.settlement.read.getRound([context.roundId])) as RoundSnapshot;
}
