import { useState } from 'react';
import type { Hash } from 'viem';
import { appConfig } from '../config';
import { shortAddress } from '../lib/format';
import { Icon } from './Icon';

type ActivityLog = {
  blockNumber?: bigint | null;
  eventName?: string;
  transactionHash?: Hash | null;
};

const eventLabels: Record<string, string> = {
  ObligationsSubmitted: 'Encrypted obligations submitted',
  RefundClaimed: 'Collateral refund claimed',
  RoundCreated: 'Round created',
  RoundFinalized: 'Net positions finalized',
  RoundFunded: 'Collateral funded',
  RoundStatusChanged: 'Round state changed',
  WithdrawalClaimed: 'Settlement withdrawn',
};

export function RoundActivity({
  configured,
  events,
}: {
  configured: boolean;
  events: readonly ActivityLog[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="activity-card">
      <button
        aria-expanded={open}
        className="activity-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>
          <strong>Round activity</strong>
          <span>
            {configured
              ? `${events.length} verified chain event${events.length === 1 ? '' : 's'}`
              : 'Deployment block required for complete history'}
          </span>
        </span>
        <Icon className={open ? 'chevron-open' : ''} name="chevron" />
      </button>
      {open && (
        <div className="activity-body">
          {!configured ? (
            <p className="empty-copy">
              Configure <code>VITE_DEPLOYMENT_BLOCK</code> at deployment so the app can retrieve
              complete Sepolia history without guessing a scan range.
            </p>
          ) : events.length === 0 ? (
            <p className="empty-copy">No events have been emitted for this round yet.</p>
          ) : (
            <ol className="activity-list">
              {events.map((event, index) => (
                <li key={`${event.transactionHash ?? 'event'}-${index}`}>
                  <span className="activity-mark">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>{eventLabels[event.eventName ?? ''] ?? event.eventName}</strong>
                    <span className="mono">Block {event.blockNumber?.toString() ?? 'pending'}</span>
                  </div>
                  {event.transactionHash && (
                    <a
                      aria-label="Open transaction in Etherscan"
                      href={`${appConfig.explorerUrl}/tx/${event.transactionHash}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {shortAddress(event.transactionHash, 8, 6)}
                      <Icon name="external" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
