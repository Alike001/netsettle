import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { hasReportedFailure } from './nox-test-guard.mjs';

describe('Nox test guard', () => {
  it('accepts a passing Hardhat node:test report', () => {
    assert.equal(
      hasReportedFailure(
        'NetSettle Nox end-to-end\n  ✔ valid settlement\n\n3 passing (3 nodejs)\n',
      ),
      false,
    );
  });

  it('fails if Hardhat reports a numbered test failure despite a zero process status', () => {
    assert.equal(
      hasReportedFailure(
        'NetSettle Nox end-to-end\n  1) setup failed\n\n1) Suite:\nError: port in use\n',
      ),
      true,
    );
  });
});
