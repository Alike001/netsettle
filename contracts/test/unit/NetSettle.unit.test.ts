import { strict as assert } from 'node:assert';
import { before, describe, it } from 'node:test';
import { network } from 'hardhat';
import type { Address, Hash } from 'viem';
import { zeroAddress, zeroHash } from 'viem';

const COLLATERAL = 100n;
const COMPUTE_TIMEOUT = 600;
const STARTING_BALANCE = 1_000n;

type Connection = Awaited<ReturnType<typeof network.getOrCreate>>;
type RoundSnapshot = {
  participants: readonly Address[];
  collateralCap: bigint;
  submissionDeadline: bigint;
  status: number;
  fundedMask: number;
};

async function deployFixture(connection: Connection) {
  const { viem } = connection;
  const wallets = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  const token = await viem.deployContract('MockToken');
  const settlement = await viem.deployContract('NetSettle', [token.address, COMPUTE_TIMEOUT]);
  const participants = wallets.slice(0, 3);
  const stranger = wallets[3];
  assert.equal(participants.length, 3);
  assert.ok(stranger);

  for (const participant of participants) {
    await waitFor(publicClient, token.write.mint([participant.account.address, STARTING_BALANCE]));
    const participantToken = await viem.getContractAt('MockToken', token.address, {
      client: { wallet: participant },
    });
    await waitFor(publicClient, participantToken.write.approve([settlement.address, COLLATERAL]));
  }

  return { participants, publicClient, settlement, stranger, token, viem };
}

async function waitFor(
  publicClient: Awaited<ReturnType<Connection['viem']['getPublicClient']>>,
  hashPromise: Promise<Hash>,
) {
  const hash = await hashPromise;
  await publicClient.waitForTransactionReceipt({ hash });
}

async function createRound(fixture: Awaited<ReturnType<typeof deployFixture>>) {
  const latestBlock = await fixture.publicClient.getBlock();
  const deadline = latestBlock.timestamp + 3_600n;
  const addresses = fixture.participants.map((wallet) => wallet.account.address) as [
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
  ];
  await waitFor(
    fixture.publicClient,
    fixture.settlement.write.createRound([addresses, COLLATERAL, deadline]),
  );
  return { addresses, deadline, roundId: 1n };
}

async function participantContracts(fixture: Awaited<ReturnType<typeof deployFixture>>) {
  return Promise.all(
    fixture.participants.map((wallet) =>
      fixture.viem.getContractAt('NetSettle', fixture.settlement.address, {
        client: { wallet },
      }),
    ),
  );
}

describe('NetSettle deterministic state machine', () => {
  let connection: Connection;

  before(async () => {
    connection = await network.getOrCreate();
  });

  it('creates one fixed three-participant round and rejects malformed definitions', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const { addresses, deadline, roundId } = await createRound(fixture);
    const snapshot = (await fixture.settlement.read.getRound([roundId])) as RoundSnapshot;

    assert.deepEqual(
      snapshot.participants.map((address) => address.toLowerCase()),
      addresses.map((address) => address.toLowerCase()),
    );
    assert.equal(snapshot.collateralCap, COLLATERAL);
    assert.equal(snapshot.submissionDeadline, deadline);
    assert.equal(snapshot.status, 1);
    assert.equal(snapshot.fundedMask, 0);

    await assert.rejects(
      fixture.settlement.write.createRound([
        [addresses[0], addresses[0], addresses[2]],
        COLLATERAL,
        deadline,
      ]),
    );
    await assert.rejects(
      fixture.settlement.write.createRound([
        [zeroAddress, addresses[1], addresses[2]],
        COLLATERAL,
        deadline,
      ]),
    );
    await assert.rejects(fixture.settlement.write.createRound([addresses, 0n, deadline]));
    await assert.rejects(fixture.settlement.write.createRound([addresses, COLLATERAL, 1n]));
  });

  it('accepts one exact collateral deposit per participant and nobody else', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const { roundId } = await createRound(fixture);
    const contracts = await participantContracts(fixture);
    const outsider = await fixture.viem.getContractAt('NetSettle', fixture.settlement.address, {
      client: { wallet: fixture.stranger },
    });

    await assert.rejects(outsider.write.fundRound([roundId]));
    await waitFor(fixture.publicClient, contracts[0]!.write.fundRound([roundId]));
    await assert.rejects(contracts[0]!.write.fundRound([roundId]));
    await waitFor(fixture.publicClient, contracts[1]!.write.fundRound([roundId]));
    await waitFor(fixture.publicClient, contracts[2]!.write.fundRound([roundId]));

    const snapshot = (await fixture.settlement.read.getRound([roundId])) as RoundSnapshot;
    assert.equal(snapshot.fundedMask, 7);
    assert.equal(snapshot.status, 2);
    assert.equal(await fixture.token.read.balanceOf([fixture.settlement.address]), COLLATERAL * 3n);
  });

  it('rejects fee-on-transfer collateral before it can fund a round', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const feeToken = await fixture.viem.deployContract('FeeOnTransferToken');
    const settlement = await fixture.viem.deployContract('NetSettle', [
      feeToken.address,
      COMPUTE_TIMEOUT,
    ]);
    const participant = fixture.participants[0]!;
    const latestBlock = await fixture.publicClient.getBlock();
    const deadline = latestBlock.timestamp + 3_600n;
    const addresses = fixture.participants.map((wallet) => wallet.account.address) as [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
    ];

    await waitFor(
      fixture.publicClient,
      feeToken.write.mint([participant.account.address, STARTING_BALANCE]),
    );
    const participantToken = await fixture.viem.getContractAt(
      'FeeOnTransferToken',
      feeToken.address,
      {
        client: { wallet: participant },
      },
    );
    const participantSettlement = await fixture.viem.getContractAt(
      'NetSettle',
      settlement.address,
      {
        client: { wallet: participant },
      },
    );
    await waitFor(
      fixture.publicClient,
      participantToken.write.approve([settlement.address, COLLATERAL]),
    );
    await waitFor(
      fixture.publicClient,
      settlement.write.createRound([addresses, COLLATERAL, deadline]),
    );

    await assert.rejects(participantSettlement.write.fundRound([1n]));
    assert.equal(await feeToken.read.balanceOf([settlement.address]), 0n);
    const snapshot = (await settlement.read.getRound([1n])) as RoundSnapshot;
    assert.equal(snapshot.fundedMask, 0);
  });

  it('expires an incomplete round and refunds only funded participants once', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const { deadline, roundId } = await createRound(fixture);
    const contracts = await participantContracts(fixture);
    await waitFor(fixture.publicClient, contracts[0]!.write.fundRound([roundId]));

    await assert.rejects(fixture.settlement.write.expireRound([roundId]));
    await connection.networkHelpers.time.increaseTo(deadline);
    await waitFor(fixture.publicClient, fixture.settlement.write.expireRound([roundId]));
    const expired = (await fixture.settlement.read.getRound([roundId])) as RoundSnapshot;
    assert.equal(expired.status, 7);

    await waitFor(fixture.publicClient, contracts[0]!.write.claimRefund([roundId]));
    assert.equal(
      await fixture.token.read.balanceOf([fixture.participants[0]!.account.address]),
      STARTING_BALANCE,
    );
    await assert.rejects(contracts[0]!.write.claimRefund([roundId]));
    await assert.rejects(contracts[1]!.write.claimRefund([roundId]));
  });

  it('rejects submissions before funding and from a non-participant', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const { deadline, roundId } = await createRound(fixture);
    const contracts = await participantContracts(fixture);
    const emptyInputs = [zeroHash, zeroHash] as const;
    const emptyProofs = ['0x', '0x'] as const;

    await assert.rejects(
      contracts[0]!.write.submitObligations([roundId, emptyInputs, emptyProofs]),
    );
    for (const contract of contracts) {
      await waitFor(fixture.publicClient, contract.write.fundRound([roundId]));
    }
    const outsider = await fixture.viem.getContractAt('NetSettle', fixture.settlement.address, {
      client: { wallet: fixture.stranger },
    });
    await assert.rejects(outsider.write.submitObligations([roundId, emptyInputs, emptyProofs]));
    await connection.networkHelpers.time.increaseTo(deadline);
    await assert.rejects(
      contracts[0]!.write.submitObligations([roundId, emptyInputs, emptyProofs]),
    );
  });

  it('keeps independent masks and deadlines across multiple rounds', async () => {
    const fixture = await connection.networkHelpers.loadFixture(deployFixture);
    const first = await createRound(fixture);
    const addresses = fixture.participants.map((wallet) => wallet.account.address) as [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
    ];
    await waitFor(
      fixture.publicClient,
      fixture.settlement.write.createRound([addresses, COLLATERAL, first.deadline + 60n]),
    );
    const contracts = await participantContracts(fixture);
    await waitFor(fixture.publicClient, contracts[0]!.write.fundRound([first.roundId]));

    const firstRound = (await fixture.settlement.read.getRound([1n])) as RoundSnapshot;
    const secondRound = (await fixture.settlement.read.getRound([2n])) as RoundSnapshot;
    assert.equal(firstRound.fundedMask, 1);
    assert.equal(secondRound.fundedMask, 0);
    assert.equal(await fixture.settlement.read.roundCount(), 2n);
  });
});
