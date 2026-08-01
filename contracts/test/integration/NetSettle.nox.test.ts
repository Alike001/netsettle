import type { Handle, HexString } from '@iexec-nox/handle';
import { nox } from '@iexec-nox/nox-hardhat-plugin';
import { strict as assert } from 'node:assert';
import { before, describe, it } from 'node:test';
import { network } from 'hardhat';
import { maxUint256 } from 'viem';
import {
  STARTING_BALANCE,
  encryptRow,
  openFundedRound,
  readRound,
  submitMatrix,
  submitRow,
  waitFor,
} from '../helpers/settlement.js';
import type { Connection, Matrix, NoxRuntime } from '../helpers/settlement.js';

type PublicDecrypt = Awaited<ReturnType<typeof nox.connect>>['publicDecrypt'];

function asProofTuple(proofs: HexString[]) {
  assert.equal(proofs.length, 3);
  return [proofs[0]!, proofs[1]!, proofs[2]!] as const;
}

async function decryptBooleans(publicDecrypt: PublicDecrypt, handles: readonly HexString[]) {
  const results = await Promise.all(
    handles.map((handle) => publicDecrypt(handle as Handle<'bool'>)),
  );
  return {
    proofs: asProofTuple(results.map((result) => result.decryptionProof)),
    values: results.map((result) => result.value),
  };
}

async function decryptAmounts(publicDecrypt: PublicDecrypt, handles: readonly HexString[]) {
  const results = await Promise.all(
    handles.map((handle) => publicDecrypt(handle as Handle<'uint256'>)),
  );
  return {
    proofs: asProofTuple(results.map((result) => result.decryptionProof)),
    values: results.map((result) => result.value),
  };
}

describe('NetSettle Nox end-to-end', () => {
  let connection: Connection;
  let noxRuntime: Awaited<ReturnType<typeof nox.connect>>;

  before(async () => {
    connection = await network.getOrCreate();
    noxRuntime = await nox.connect(connection);
  });

  it(
    'turns six confidential obligations into three conserved settlements',
    { timeout: 360_000 },
    async () => {
      const context = await openFundedRound(connection, noxRuntime as NoxRuntime);
      const matrix: Matrix = [
        [70n, 30n],
        [20n, 30n],
        [40n, 10n],
      ];

      const firstRow = await encryptRow(context, 0, matrix[0]);
      await assert.rejects(
        context.participantSettlements[1]!.write.submitObligations([
          context.roundId,
          [firstRow[0].handle, firstRow[1].handle],
          [firstRow[0].handleProof, firstRow[1].handleProof],
        ]),
      );
      await submitRow(context, 0, firstRow);
      await assert.rejects(
        context.participantSettlements[0]!.write.submitObligations([
          context.roundId,
          [firstRow[0].handle, firstRow[1].handle],
          [firstRow[0].handleProof, firstRow[1].handleProof],
        ]),
      );
      await assert.rejects(
        context.handleClients[1].decrypt(firstRow[0].handle as Handle<'uint256'>),
      );

      const wrongContract = await encryptRow(context, 1, matrix[1], context.token.address);
      await assert.rejects(
        context.participantSettlements[1]!.write.submitObligations([
          context.roundId,
          [wrongContract[0].handle, wrongContract[1].handle],
          [wrongContract[0].handleProof, wrongContract[1].handleProof],
        ]),
      );
      await submitRow(context, 1, await encryptRow(context, 1, matrix[1]));
      await submitRow(context, 2, await encryptRow(context, 2, matrix[2]));

      let snapshot = await readRound(context);
      assert.equal(snapshot.status, 3);
      assert.equal(snapshot.submittedMask, 7);
      const sumChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.sumValidHandles);
      const capChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.withinCapHandles);
      assert.deepEqual(sumChecks.values, [true, true, true]);
      assert.deepEqual(capChecks.values, [true, true, true]);

      await waitFor(
        context.publicClient,
        context.settlement.write.validateRound([
          context.roundId,
          sumChecks.proofs,
          capChecks.proofs,
        ]),
      );
      snapshot = await readRound(context);
      assert.equal(snapshot.status, 4);

      const pay = await decryptAmounts(noxRuntime.publicDecrypt, snapshot.netPayHandles);
      const receive = await decryptAmounts(noxRuntime.publicDecrypt, snapshot.netReceiveHandles);
      assert.deepEqual(pay.values, [40n, 0n, 0n]);
      assert.deepEqual(receive.values, [0n, 30n, 10n]);
      assert.equal(
        pay.values.reduce((sum, value) => sum + value, 0n),
        receive.values.reduce((sum, value) => sum + value, 0n),
      );

      await waitFor(
        context.publicClient,
        context.settlement.write.finalizeRound([context.roundId, pay.proofs, receive.proofs]),
      );
      snapshot = await readRound(context);
      assert.equal(snapshot.status, 5);
      assert.deepEqual(snapshot.finalPay, [40n, 0n, 0n]);
      assert.deepEqual(snapshot.finalReceive, [0n, 30n, 10n]);

      for (const contract of context.participantSettlements) {
        await waitFor(context.publicClient, contract.write.withdraw([context.roundId]));
      }
      const expectedBalances = [960n, 1_030n, 1_010n];
      for (let i = 0; i < 3; i += 1) {
        assert.equal(
          await context.token.read.balanceOf([context.participants[i]!.account.address]),
          expectedBalances[i],
        );
      }
      assert.equal(await context.token.read.balanceOf([context.settlement.address]), 0n);
      await assert.rejects(context.participantSettlements[0]!.write.withdraw([context.roundId]));
    },
  );

  it(
    'expires an unresolved confidential computation and refunds all funded participants',
    { timeout: 300_000 },
    async () => {
      const context = await openFundedRound(connection, noxRuntime as NoxRuntime);
      await submitMatrix(context, [
        [1n, 0n],
        [0n, 1n],
        [0n, 0n],
      ]);

      const computing = await readRound(context);
      assert.equal(computing.status, 3);
      await connection.networkHelpers.time.increaseTo(computing.computeDeadline);
      await waitFor(context.publicClient, context.settlement.write.expireRound([context.roundId]));
      assert.equal((await readRound(context)).status, 7);

      for (const contract of context.participantSettlements) {
        await waitFor(context.publicClient, contract.write.claimRefund([context.roundId]));
      }
      for (const participant of context.participants) {
        assert.equal(
          await context.token.read.balanceOf([participant.account.address]),
          STARTING_BALANCE,
        );
      }
    },
  );

  it(
    'expires after safety validation if public net-position proofs do not arrive',
    { timeout: 300_000 },
    async () => {
      const context = await openFundedRound(connection, noxRuntime as NoxRuntime);
      await submitMatrix(context, [
        [1n, 0n],
        [0n, 1n],
        [0n, 0n],
      ]);

      let snapshot = await readRound(context);
      const sumChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.sumValidHandles);
      const capChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.withinCapHandles);
      await waitFor(
        context.publicClient,
        context.settlement.write.validateRound([
          context.roundId,
          sumChecks.proofs,
          capChecks.proofs,
        ]),
      );
      snapshot = await readRound(context);
      assert.equal(snapshot.status, 4);

      await connection.networkHelpers.time.increaseTo(snapshot.computeDeadline);
      await waitFor(context.publicClient, context.settlement.write.expireRound([context.roundId]));
      assert.equal((await readRound(context)).status, 7);

      for (const contract of context.participantSettlements) {
        await waitFor(context.publicClient, contract.write.claimRefund([context.roundId]));
      }
      for (const participant of context.participants) {
        assert.equal(
          await context.token.read.balanceOf([participant.account.address]),
          STARTING_BALANCE,
        );
      }
    },
  );

  it(
    'fails an over-collateral round without revealing net positions and refunds everyone',
    { timeout: 300_000 },
    async () => {
      const context = await openFundedRound(connection, noxRuntime as NoxRuntime);
      await submitMatrix(context, [
        [80n, 30n],
        [0n, 0n],
        [0n, 0n],
      ]);
      let snapshot = await readRound(context);
      const sumChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.sumValidHandles);
      const capChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.withinCapHandles);
      assert.deepEqual(sumChecks.values, [true, true, true]);
      assert.deepEqual(capChecks.values, [false, true, true]);

      await waitFor(
        context.publicClient,
        context.settlement.write.validateRound([
          context.roundId,
          sumChecks.proofs,
          capChecks.proofs,
        ]),
      );
      snapshot = await readRound(context);
      assert.equal(snapshot.status, 6);
      await assert.rejects(
        noxRuntime.publicDecrypt(snapshot.netPayHandles[0]! as Handle<'uint256'>),
      );

      for (const contract of context.participantSettlements) {
        await waitFor(context.publicClient, contract.write.claimRefund([context.roundId]));
      }
      for (const participant of context.participants) {
        assert.equal(
          await context.token.read.balanceOf([participant.account.address]),
          STARTING_BALANCE,
        );
      }
    },
  );

  it(
    'turns encrypted uint256 overflow into a publicly provable refundable failure',
    { timeout: 300_000 },
    async () => {
      const context = await openFundedRound(connection, noxRuntime as NoxRuntime);
      await submitMatrix(context, [
        [maxUint256, 1n],
        [0n, 0n],
        [0n, 0n],
      ]);
      const snapshot = await readRound(context);
      const sumChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.sumValidHandles);
      const capChecks = await decryptBooleans(noxRuntime.publicDecrypt, snapshot.withinCapHandles);
      assert.deepEqual(sumChecks.values, [false, true, true]);

      await waitFor(
        context.publicClient,
        context.settlement.write.validateRound([
          context.roundId,
          sumChecks.proofs,
          capChecks.proofs,
        ]),
      );
      assert.equal((await readRound(context)).status, 6);
    },
  );
});
