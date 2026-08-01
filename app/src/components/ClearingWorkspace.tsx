import type { Address } from 'viem';
import { formatTokenAmount, shortAddress } from '../lib/format';
import { RoundStatus, hasMaskBit, statusLabels, total } from '../lib/round';
import type { RoundSnapshot } from '../lib/round';
import { Icon } from './Icon';

type ClearingWorkspaceProps = {
  decimals: number;
  round: RoundSnapshot;
  symbol: string;
};

const letters = ['A', 'B', 'C'] as const;

export function ClearingWorkspace({ decimals, round, symbol }: ClearingWorkspaceProps) {
  const status = round.status as RoundStatus;
  const finalized = status === RoundStatus.Finalized;

  return (
    <section className="clearing-card" aria-labelledby="clearing-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Current round</p>
          <h1 id="clearing-heading">Confidential clearing</h1>
        </div>
        <span className="privacy-chip">
          <span className="privacy-glyph">•••</span>
          Six encrypted routes
        </span>
      </div>

      <div className={`triangle-stage ${finalized ? 'is-finalized' : ''}`}>
        <RouteDiagram />
        {round.participants.map((participant, index) => (
          <ParticipantNode
            address={participant}
            decimals={decimals}
            index={index}
            key={participant}
            round={round}
            symbol={symbol}
          />
        ))}
        <ClearingCore round={round} />
      </div>

      <div className="mobile-clearing-summary">
        <div className="mobile-participants">
          {round.participants.map((participant, index) => (
            <ParticipantNode
              address={participant}
              decimals={decimals}
              index={index}
              key={participant}
              round={round}
              symbol={symbol}
            />
          ))}
        </div>
        <div className="encrypted-summary">
          <span className="route-swatch" />
          <div>
            <strong>6 obligation values are encrypted</strong>
            <span>Every participant submitted a complete two-recipient vector.</span>
          </div>
        </div>
        <ClearingCore round={round} />
      </div>

      {finalized && (
        <div className="conservation-proof">
          <span className="proof-icon">
            <Icon name="check" />
          </span>
          <div>
            <span className="proof-label">Conservation verified</span>
            <strong className="mono">
              {formatTokenAmount(total(round.finalPay), decimals)} {symbol} paid ={' '}
              {formatTokenAmount(total(round.finalReceive), decimals)} {symbol} received
            </strong>
          </div>
        </div>
      )}
    </section>
  );
}

function ParticipantNode({
  address,
  decimals,
  index,
  round,
  symbol,
}: {
  address: Address;
  decimals: number;
  index: number;
  round: RoundSnapshot;
  symbol: string;
}) {
  const status = round.status as RoundStatus;
  const funded = hasMaskBit(round.fundedMask, index);
  const submitted = hasMaskBit(round.submittedMask, index);
  const claimed = hasMaskBit(round.claimedMask, index);
  const pay = round.finalPay[index]!;
  const receive = round.finalReceive[index]!;
  const position =
    pay > 0n
      ? `Pays ${formatTokenAmount(pay, decimals)} ${symbol}`
      : receive > 0n
        ? `Receives ${formatTokenAmount(receive, decimals)} ${symbol}`
        : 'Even';
  const readiness =
    status === RoundStatus.Funding
      ? funded
        ? 'Collateral funded'
        : 'Awaiting collateral'
      : status === RoundStatus.Submitting
        ? submitted
          ? 'Obligations submitted'
          : 'Awaiting submission'
        : status === RoundStatus.Finalized
          ? claimed
            ? `${position} · claimed`
            : position
          : status === RoundStatus.Failed || status === RoundStatus.Expired
            ? claimed
              ? 'Refund claimed'
              : funded
                ? 'Refund available'
                : 'Not funded'
            : 'Encrypted inputs sealed';

  return (
    <article className={`participant-node participant-${index}`}>
      <div className="participant-topline">
        <span className="participant-avatar">{letters[index]}</span>
        <span>Participant {letters[index]}</span>
        <span className={`readiness-dot ${funded ? 'is-ready' : ''}`} />
      </div>
      <strong className="mono participant-address">{shortAddress(address, 8, 6)}</strong>
      <span
        className={`participant-state ${status === RoundStatus.Finalized ? 'is-position' : ''}`}
      >
        {readiness}
      </span>
    </article>
  );
}

function ClearingCore({ round }: { round: RoundSnapshot }) {
  const status = round.status as RoundStatus;
  const funded = countMask(round.fundedMask);
  const submitted = countMask(round.submittedMask);
  const copy =
    status === RoundStatus.Funding
      ? `Waiting for ${3 - funded} deposit${3 - funded === 1 ? '' : 's'}`
      : status === RoundStatus.Submitting
        ? `Waiting for ${3 - submitted} submission${3 - submitted === 1 ? '' : 's'}`
        : status === RoundStatus.Computing
          ? 'Safety proofs can be retried'
          : status === RoundStatus.ReadyToFinalize
            ? 'Net proofs are ready'
            : status === RoundStatus.Finalized
              ? 'All positions conserve value'
              : status === RoundStatus.Failed
                ? 'Collateral is refundable'
                : 'Deadline recovery is available';

  return (
    <div className={`clearing-core core-${status}`}>
      <span className="core-orbit">
        {status === RoundStatus.Computing ? <Icon name="refresh" /> : <Icon name="settle" />}
      </span>
      <strong>{statusLabels[status]}</strong>
      <span>{copy}</span>
    </div>
  );
}

function RouteDiagram() {
  const routes = [
    'M382 102 Q255 204 166 385',
    'M181 395 Q272 221 401 118',
    'M419 104 Q548 204 637 385',
    'M622 395 Q532 221 399 120',
    'M185 433 Q400 489 615 433',
    'M615 414 Q400 463 185 414',
  ];
  const labels = [
    ['route-label route-ab-1', 'Encrypted'],
    ['route-label route-ab-2', 'Encrypted'],
    ['route-label route-ac-1', 'Encrypted'],
    ['route-label route-ac-2', 'Encrypted'],
    ['route-label route-bc-1', 'Encrypted'],
    ['route-label route-bc-2', 'Encrypted'],
  ] as const;

  return (
    <>
      <svg
        aria-label="Six encrypted directed obligations between three participants"
        className="route-diagram"
        role="img"
        viewBox="0 0 800 540"
      >
        <defs>
          <marker
            id="route-arrow"
            markerHeight="7"
            markerWidth="7"
            orient="auto"
            refX="6"
            refY="3.5"
          >
            <path d="M0 0 7 3.5 0 7Z" fill="currentColor" />
          </marker>
        </defs>
        {routes.map((route, index) => (
          <path className="encrypted-route" d={route} key={index} markerEnd="url(#route-arrow)" />
        ))}
      </svg>
      {labels.map(([className, label]) => (
        <span className={className} key={className}>
          {label}
        </span>
      ))}
    </>
  );
}

function countMask(mask: number) {
  return [0, 1, 2].filter((index) => hasMaskBit(mask, index)).length;
}
