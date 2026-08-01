import { useEffect, useState } from 'react';
import { getAddress, isAddress, parseUnits, type Address, type Hash } from 'viem';
import { useConnect, useConnection, useSwitchChain } from 'wagmi';
import { appConfig } from '../config';
import { formatTokenAmount, shortAddress } from '../lib/format';
import {
  RoundStatus,
  actionFor,
  hasMaskBit,
  parseObligations,
  withdrawalEntitlement,
} from '../lib/round';
import type { RoundAction, RoundSnapshot } from '../lib/round';
import type { useRoundActions } from '../hooks/useRoundActions';
import { Icon } from './Icon';

type Actions = ReturnType<typeof useRoundActions>['actions'];

type ActionPanelProps = {
  actions: Actions;
  allowance: bigint;
  connectedParticipantIndex: number;
  decimals: number;
  error: string | undefined;
  onCreateNextRound?: () => void;
  pending: { label: string; hash?: Hash } | undefined;
  round: RoundSnapshot;
  symbol: string;
};

const actionContent: Record<
  Exclude<RoundAction, 'submit' | 'wait'>,
  { label: string; title: string; description: string }
> = {
  approve: {
    title: 'Approve collateral',
    label: 'Approve exact collateral',
    description:
      'Allow NetSettle to transfer this round’s exact collateral cap. Funding is a separate confirmation.',
  },
  fund: {
    title: 'Fund your position',
    label: 'Fund collateral',
    description:
      'Deposit the same collateral cap as the other participants. Fee-on-transfer tokens are rejected.',
  },
  validate: {
    title: 'Verify confidential arithmetic',
    label: 'Verify safety proofs',
    description:
      'Ask Nox for six public Boolean proofs: three overflow checks and three collateral-cap checks. Net amounts stay sealed.',
  },
  finalize: {
    title: 'Settle net positions',
    label: 'Open verified positions',
    description:
      'Fetch proofs for the three pay and receive positions, then prove total paid equals total received onchain.',
  },
  withdraw: {
    title: 'Withdraw your entitlement',
    label: 'Withdraw settlement',
    description:
      'Claim your original collateral adjusted by the final public net position. This can be claimed exactly once.',
  },
  expire: {
    title: 'Recover an expired round',
    label: 'Mark round expired',
    description:
      'The active deadline has passed. Mark the round expired so funded participants can recover collateral.',
  },
  refund: {
    title: 'Recover your collateral',
    label: 'Claim full refund',
    description:
      'This round did not settle. Claim the exact collateral you deposited; confidential net handles remain closed.',
  },
};

export function ActionPanel(props: ActionPanelProps) {
  const connection = useConnection();
  const connect = useConnect();
  const switchChain = useSwitchChain();
  const connector = connect.connectors[0];
  const wrongNetwork =
    connection.status === 'connected' && connection.chainId !== appConfig.chain.id;
  const now = useNowSeconds();
  const action = actionFor(props.round, props.connectedParticipantIndex, props.allowance, now);

  if (connection.status !== 'connected') {
    return (
      <PanelFrame
        description="Connect an injected wallet to see the one action available to you in this round."
        eyebrow="Your action"
        title="Connect to participate"
      >
        <button
          className="primary-button"
          disabled={!connector || connect.isPending}
          onClick={() => connector && connect.connect({ connector })}
          type="button"
        >
          <Icon name="wallet" />
          {connect.isPending ? 'Connecting…' : 'Connect wallet'}
        </button>
      </PanelFrame>
    );
  }

  if (wrongNetwork) {
    return (
      <PanelFrame
        description="NetSettle is deployed on Ethereum Sepolia. No transaction will be requested on another network."
        eyebrow="Network required"
        title="Switch to Sepolia"
      >
        <button
          className="primary-button"
          disabled={switchChain.isPending}
          onClick={() => switchChain.switchChain({ chainId: appConfig.chain.id })}
          type="button"
        >
          <Icon name="network" />
          {switchChain.isPending ? 'Switching…' : 'Switch network'}
        </button>
      </PanelFrame>
    );
  }

  if (action === 'submit') return <SubmissionPanel {...props} />;
  if (action === 'wait') return <WaitingPanel {...props} />;

  const content = actionContent[action];
  const extra =
    action === 'approve' || action === 'fund'
      ? `${formatTokenAmount(props.round.collateralCap, props.decimals)} ${props.symbol}`
      : action === 'withdraw' && props.connectedParticipantIndex >= 0
        ? `${formatTokenAmount(
            withdrawalEntitlement(props.round, props.connectedParticipantIndex),
            props.decimals,
          )} ${props.symbol}`
        : undefined;

  return (
    <PanelFrame description={content.description} eyebrow="Your action" title={content.title}>
      {extra && (
        <div className="action-amount">
          <span>{action === 'withdraw' ? 'Your entitlement' : 'Collateral required'}</span>
          <strong className="mono">{extra}</strong>
        </div>
      )}
      <ActionFeedback error={props.error} pending={props.pending} />
      <button
        className="primary-button"
        disabled={Boolean(props.pending)}
        onClick={() => void props.actions[action]().catch(() => undefined)}
        type="button"
      >
        <Icon name={iconForAction(action)} />
        {props.pending?.label ?? content.label}
      </button>
      {action === 'validate' && (
        <p className="retry-note">
          If Nox is still computing, this action can be retried safely after reload.
        </p>
      )}
    </PanelFrame>
  );
}

function SubmissionPanel(props: ActionPanelProps) {
  const [values, setValues] = useState<[string, string]>(['', '']);
  const [validationError, setValidationError] = useState<string>();
  const recipients = props.round.participants
    .map((address, index) => ({ address, index }))
    .filter(({ index }) => index !== props.connectedParticipantIndex);

  function submit() {
    setValidationError(undefined);
    try {
      const parsed = parseObligations(values, props.decimals, props.round.collateralCap);
      void props.actions.submit(parsed).catch(() => undefined);
    } catch (caught) {
      setValidationError(
        caught instanceof Error ? caught.message : 'Enter two valid token amounts.',
      );
    }
  }

  return (
    <PanelFrame
      description="Both amounts are encrypted through Nox before the transaction is signed. A zero still appears onchain as an encrypted submission."
      eyebrow="Your action"
      title="Submit two obligations"
    >
      <div className="obligation-fields">
        {recipients.map((recipient, fieldIndex) => (
          <label key={recipient.address}>
            <span>
              To participant {['A', 'B', 'C'][recipient.index]}{' '}
              <span className="mono">{shortAddress(recipient.address)}</span>
            </span>
            <span className="amount-input">
              <input
                aria-label={`Obligation to participant ${['A', 'B', 'C'][recipient.index]}`}
                autoComplete="off"
                inputMode="decimal"
                min="0"
                onChange={(event) =>
                  setValues((current) => {
                    const next: [string, string] = [...current];
                    next[fieldIndex] = event.target.value;
                    return next;
                  })
                }
                placeholder="0"
                type="number"
                value={values[fieldIndex]}
              />
              <span className="mono">{props.symbol}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="cap-line">
        <span>Combined maximum</span>
        <strong className="mono">
          {formatTokenAmount(props.round.collateralCap, props.decimals)} {props.symbol}
        </strong>
      </div>
      <ActionFeedback error={validationError ?? props.error} pending={props.pending} />
      <button
        className="primary-button"
        disabled={Boolean(props.pending)}
        onClick={submit}
        type="button"
      >
        <Icon name="submit" />
        {props.pending?.label ?? 'Encrypt and submit both'}
      </button>
      <p className="privacy-explainer">
        Obligation amounts are private. Participants, transaction timing, contract calls, and final
        net positions are public.
      </p>
    </PanelFrame>
  );
}

function WaitingPanel(props: ActionPanelProps) {
  const index = props.connectedParticipantIndex;
  const status = props.round.status as RoundStatus;
  const participant = index >= 0;
  const funded = participant && hasMaskBit(props.round.fundedMask, index);
  const submitted = participant && hasMaskBit(props.round.submittedMask, index);
  const claimed = participant && hasMaskBit(props.round.claimedMask, index);
  const canCreateNextRound =
    participant &&
    status === RoundStatus.Finalized &&
    props.round.claimedMask === 7 &&
    Boolean(props.onCreateNextRound);
  const title = !participant
    ? 'Round is view-only'
    : status === RoundStatus.Funding && funded
      ? 'Collateral funded'
      : status === RoundStatus.Submitting && submitted
        ? 'Obligations sealed'
        : canCreateNextRound
          ? 'Round complete'
          : claimed
            ? 'Claim complete'
            : 'Waiting for the group';
  const description = !participant
    ? 'This wallet is not one of the three public participants. You can inspect every proof and public result without acting.'
    : status === RoundStatus.Funding
      ? 'Your deposit is confirmed. The submission stage opens only after all three equal deposits arrive.'
      : status === RoundStatus.Submitting
        ? 'Your encrypted vector is confirmed. Plaintext is not stored in this interface and will not reappear after reload.'
        : canCreateNextRound
          ? 'All three participants have withdrawn. Start another fixed three-party clearing round when you are ready.'
          : claimed
            ? 'This wallet has already claimed its one available withdrawal or refund.'
            : 'No transaction is required from this wallet at the current stage.';

  return (
    <PanelFrame description={description} eyebrow="Current state" title={title}>
      <div className="confirmed-state">
        <span>
          <Icon name={claimed || funded || submitted ? 'check' : 'clock'} />
        </span>
        <strong>
          {claimed || funded || submitted ? 'Confirmed onchain' : 'No action available'}
        </strong>
      </div>
      {canCreateNextRound && (
        <button className="primary-button" onClick={props.onCreateNextRound} type="button">
          <Icon name="settle" />
          Create next round
        </button>
      )}
    </PanelFrame>
  );
}

export function CreateRoundPanel({
  actions,
  decimals,
  error,
  onCreated,
  pending,
  symbol,
}: {
  actions: Actions;
  decimals: number;
  error: string | undefined;
  onCreated?: () => void;
  pending: ActionPanelProps['pending'];
  symbol: string;
}) {
  const connection = useConnection();
  const connect = useConnect();
  const switchChain = useSwitchChain();
  const connector = connect.connectors[0];
  const [participants, setParticipants] = useState<[string, string, string]>(['', '', '']);
  const [cap, setCap] = useState('');
  const [hours, setHours] = useState('24');
  const [validationError, setValidationError] = useState<string>();

  const wrongNetwork =
    connection.status === 'connected' && connection.chainId !== appConfig.chain.id;
  const effectiveParticipants = [
    participants[0] || connection.address || '',
    participants[1],
    participants[2],
  ] as const;
  const normalized = effectiveParticipants.map((value) =>
    isAddress(value) ? getAddress(value) : undefined,
  );

  function create() {
    setValidationError(undefined);
    try {
      if (normalized.some((address) => !address)) {
        throw new Error('Enter three valid Ethereum addresses.');
      }
      const addresses = normalized as [Address, Address, Address];
      if (new Set(addresses.map((address) => address.toLowerCase())).size !== 3) {
        throw new Error('Each participant address must be different.');
      }
      const collateral = parseUnits(cap, decimals);
      if (collateral <= 0n) throw new Error('Collateral must be greater than zero.');
      const duration = Number(hours);
      if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error('The deadline duration must be greater than zero.');
      }
      const deadline = BigInt(Math.floor(Date.now() / 1_000) + Math.floor(duration * 3_600));
      void actions
        .createRound(addresses, collateral, deadline)
        .then(() => onCreated?.())
        .catch(() => undefined);
    } catch (caught) {
      setValidationError(caught instanceof Error ? caught.message : 'Check the round details.');
    }
  }

  if (connection.status !== 'connected') {
    return (
      <PanelFrame
        description="Connect a wallet to create the first fixed three-participant clearing round."
        eyebrow="Create round"
        title="Connect to begin"
      >
        <button
          className="primary-button"
          disabled={!connector || connect.isPending}
          onClick={() => connector && connect.connect({ connector })}
          type="button"
        >
          <Icon name="wallet" />
          {connect.isPending ? 'Connecting…' : 'Connect wallet'}
        </button>
      </PanelFrame>
    );
  }

  if (wrongNetwork) {
    return (
      <PanelFrame
        description="Round creation is available only on the configured Ethereum Sepolia deployment."
        eyebrow="Network required"
        title="Switch to Sepolia"
      >
        <button
          className="primary-button"
          onClick={() => switchChain.switchChain({ chainId: appConfig.chain.id })}
          type="button"
        >
          <Icon name="network" />
          Switch network
        </button>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame
      description="Every round has exactly three public participants, one pinned token, equal collateral, and one deadline."
      eyebrow="Create round"
      title="Define the clearing group"
    >
      <div className="create-fields">
        {effectiveParticipants.map((participant, index) => (
          <label key={index}>
            <span>Participant {['A', 'B', 'C'][index]}</span>
            <input
              aria-label={`Participant ${['A', 'B', 'C'][index]} address`}
              className="mono"
              onChange={(event) =>
                setParticipants((current) => {
                  const next: [string, string, string] = [...current];
                  next[index] = event.target.value;
                  return next;
                })
              }
              placeholder="0x…"
              value={participant}
            />
          </label>
        ))}
        <div className="form-row">
          <label>
            <span>Collateral per participant</span>
            <span className="amount-input">
              <input
                inputMode="decimal"
                min="0"
                onChange={(event) => setCap(event.target.value)}
                placeholder="100"
                type="number"
                value={cap}
              />
              <span className="mono">{symbol}</span>
            </span>
          </label>
          <label>
            <span>Submission window</span>
            <span className="amount-input">
              <input
                min="1"
                onChange={(event) => setHours(event.target.value)}
                type="number"
                value={hours}
              />
              <span>hours</span>
            </span>
          </label>
        </div>
      </div>
      <ActionFeedback error={validationError ?? error} pending={pending} />
      <button className="primary-button" disabled={Boolean(pending)} onClick={create} type="button">
        <Icon name="settle" />
        {pending?.label ?? 'Create clearing round'}
      </button>
    </PanelFrame>
  );
}

function useNowSeconds() {
  const [now, setNow] = useState(0n);

  useEffect(() => {
    const update = () => setNow(BigInt(Math.floor(Date.now() / 1_000)));
    const first = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 30_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  return now;
}

function ActionFeedback({
  error,
  pending,
}: {
  error: string | undefined;
  pending: ActionPanelProps['pending'];
}) {
  if (error) {
    return (
      <div className="action-notice notice-error" role="alert">
        <Icon name="failure" />
        <span>{error}</span>
      </div>
    );
  }
  if (pending) {
    return (
      <div className="action-notice notice-pending" aria-live="polite">
        <Icon name="clock" />
        <span>
          {pending.label}
          {pending.hash && (
            <a
              href={`${appConfig.explorerUrl}/tx/${pending.hash}`}
              rel="noreferrer"
              target="_blank"
            >
              {shortAddress(pending.hash, 8, 6)}
              <Icon name="external" />
            </a>
          )}
        </span>
      </div>
    );
  }
  return null;
}

function PanelFrame({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <aside className="action-panel">
      <div className="action-panel-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </aside>
  );
}

function iconForAction(action: Exclude<RoundAction, 'submit' | 'wait'>) {
  if (action === 'approve' || action === 'fund') return 'fund' as const;
  if (action === 'validate') return 'refresh' as const;
  if (action === 'finalize') return 'settle' as const;
  if (action === 'withdraw' || action === 'refund') return 'withdraw' as const;
  return 'clock' as const;
}
