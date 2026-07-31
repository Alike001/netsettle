import { parseUnits, type Address, type Hex } from 'viem';

export const RoundStatus = {
  None: 0,
  Funding: 1,
  Submitting: 2,
  Computing: 3,
  ReadyToFinalize: 4,
  Finalized: 5,
  Failed: 6,
  Expired: 7,
} as const;

export type RoundStatus = (typeof RoundStatus)[keyof typeof RoundStatus];

export type RoundSnapshot = {
  participants: readonly [Address, Address, Address];
  collateralCap: bigint;
  submissionDeadline: bigint;
  computeDeadline: bigint;
  status: number;
  fundedMask: number;
  submittedMask: number;
  claimedMask: number;
  sumValidHandles: readonly [Hex, Hex, Hex];
  withinCapHandles: readonly [Hex, Hex, Hex];
  netPayHandles: readonly [Hex, Hex, Hex];
  netReceiveHandles: readonly [Hex, Hex, Hex];
  finalPay: readonly [bigint, bigint, bigint];
  finalReceive: readonly [bigint, bigint, bigint];
};

export type LifecycleState = 'complete' | 'current' | 'upcoming' | 'failed';
export type LifecycleItem = {
  key: 'fund' | 'submit' | 'compute' | 'settle' | 'withdraw';
  label: string;
  detail: string;
  state: LifecycleState;
};

export type RoundAction =
  | 'approve'
  | 'fund'
  | 'submit'
  | 'validate'
  | 'finalize'
  | 'withdraw'
  | 'expire'
  | 'refund'
  | 'wait';

export const statusLabels: Record<RoundStatus, string> = {
  [RoundStatus.None]: 'Not created',
  [RoundStatus.Funding]: 'Funding',
  [RoundStatus.Submitting]: 'Collecting obligations',
  [RoundStatus.Computing]: 'Computing in Nox',
  [RoundStatus.ReadyToFinalize]: 'Ready to settle',
  [RoundStatus.Finalized]: 'Net positions verified',
  [RoundStatus.Failed]: 'Validation failed',
  [RoundStatus.Expired]: 'Round expired',
};

export function hasMaskBit(mask: number, index: number) {
  return (mask & (1 << index)) !== 0;
}

export function participantIndex(
  participants: RoundSnapshot['participants'],
  address: Address | undefined,
) {
  if (!address) return -1;
  return participants.findIndex(
    (participant) => participant.toLowerCase() === address.toLowerCase(),
  );
}

export function total(values: readonly bigint[]) {
  return values.reduce((sum, value) => sum + value, 0n);
}

export function withdrawalEntitlement(snapshot: RoundSnapshot, index: number) {
  return snapshot.collateralCap - snapshot.finalPay[index]! + snapshot.finalReceive[index]!;
}

export function parseObligations(
  values: readonly [string, string],
  decimals: number,
  collateralCap: bigint,
) {
  let parsed: [bigint, bigint];
  try {
    parsed = values.map((value) => parseUnits(value || '0', decimals)) as [bigint, bigint];
  } catch {
    throw new Error('Enter two valid token amounts.');
  }
  if (parsed.some((value) => value < 0n)) {
    throw new Error('Amounts cannot be negative.');
  }
  if (parsed[0] + parsed[1] > collateralCap) {
    throw new Error('The two obligations cannot exceed your collateral cap.');
  }
  return parsed;
}

export function actionFor(
  snapshot: RoundSnapshot,
  connectedParticipantIndex: number,
  allowance: bigint,
  now: bigint,
): RoundAction {
  const status = snapshot.status as RoundStatus;
  const submissionExpired =
    (status === RoundStatus.Funding || status === RoundStatus.Submitting) &&
    now >= snapshot.submissionDeadline;
  const computationExpired =
    (status === RoundStatus.Computing || status === RoundStatus.ReadyToFinalize) &&
    now >= snapshot.computeDeadline;
  if (submissionExpired || computationExpired) return 'expire';

  if (status === RoundStatus.Computing) return 'validate';
  if (status === RoundStatus.ReadyToFinalize) return 'finalize';
  if (connectedParticipantIndex < 0) return 'wait';

  const funded = hasMaskBit(snapshot.fundedMask, connectedParticipantIndex);
  const submitted = hasMaskBit(snapshot.submittedMask, connectedParticipantIndex);
  const claimed = hasMaskBit(snapshot.claimedMask, connectedParticipantIndex);

  if (status === RoundStatus.Funding) {
    if (funded) return 'wait';
    return allowance >= snapshot.collateralCap ? 'fund' : 'approve';
  }
  if (status === RoundStatus.Submitting) return submitted ? 'wait' : 'submit';
  if (status === RoundStatus.Finalized) return claimed ? 'wait' : 'withdraw';
  if (status === RoundStatus.Failed || status === RoundStatus.Expired) {
    return funded && !claimed ? 'refund' : 'wait';
  }
  return 'wait';
}

export function lifecycleFor(snapshot: RoundSnapshot): LifecycleItem[] {
  const status = snapshot.status as RoundStatus;
  const failed = status === RoundStatus.Failed || status === RoundStatus.Expired;
  const activeIndex = activeLifecycleIndex(snapshot);
  const details = [
    `${countMask(snapshot.fundedMask)} of 3 funded`,
    `${countMask(snapshot.submittedMask)} of 3 submitted`,
    status === RoundStatus.Computing ? 'Safety proofs pending' : 'Confidential arithmetic',
    status === RoundStatus.Finalized ? 'Conservation proved' : 'Public proof pending',
    `${countMask(snapshot.claimedMask)} of 3 claimed`,
  ];
  const labels = ['Fund', 'Submit', 'Compute', 'Settle', 'Withdraw'];
  const keys = ['fund', 'submit', 'compute', 'settle', 'withdraw'] as const;

  return keys.map((key, index) => ({
    key,
    label: labels[index]!,
    detail: details[index]!,
    state: failed && index === activeIndex ? 'failed' : lifecycleState(index, activeIndex),
  }));
}

function activeLifecycleIndex(snapshot: RoundSnapshot) {
  const status = snapshot.status as RoundStatus;
  if (status === RoundStatus.Funding) return 0;
  if (status === RoundStatus.Submitting) return 1;
  if (status === RoundStatus.Computing || status === RoundStatus.Failed) return 2;
  if (status === RoundStatus.ReadyToFinalize) return 3;
  if (status === RoundStatus.Expired) {
    if (snapshot.fundedMask !== 7) return 0;
    if (snapshot.submittedMask !== 7) return 1;
    return 2;
  }
  return 4;
}

function lifecycleState(index: number, activeIndex: number): LifecycleState {
  if (index < activeIndex) return 'complete';
  if (index === activeIndex) return 'current';
  return 'upcoming';
}

function countMask(mask: number) {
  return [0, 1, 2].filter((index) => hasMaskBit(mask, index)).length;
}
