import type { Address } from 'viem';
import { useConnect, useConnection, useDisconnect, useSwitchChain } from 'wagmi';
import { appConfig } from '../config';
import { formatDeadline, shortAddress } from '../lib/format';
import type { RoundStatus } from '../lib/round';
import { statusLabels } from '../lib/round';
import { Icon } from './Icon';

type AppHeaderProps = {
  contractAddress: Address | undefined;
  deadline?: bigint;
  roundId?: bigint;
  status?: RoundStatus;
  symbol: string;
};

export function AppHeader({ contractAddress, deadline, roundId, status, symbol }: AppHeaderProps) {
  const connection = useConnection();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const wrongNetwork =
    connection.status === 'connected' && connection.chainId !== appConfig.chain.id;
  const connector = connect.connectors[0];

  return (
    <header className="app-header">
      <div className="header-main">
        <a className="wordmark" href="/" aria-label="NetSettle home">
          <BrandMark />
          <span>NetSettle</span>
        </a>
        <div className="header-state">
          {status !== undefined && (
            <span className={`status-pill status-${status}`}>
              <span className="status-dot" />
              {statusLabels[status]}
            </span>
          )}
          {roundId && <span className="mono muted">Round #{roundId.toString()}</span>}
        </div>
        <div className="header-wallet">
          <span className={`network-pill ${wrongNetwork ? 'network-wrong' : ''}`}>
            <Icon name="network" />
            {wrongNetwork ? 'Wrong network' : 'Ethereum Sepolia'}
          </span>
          {connection.status === 'connected' ? (
            <button
              className="wallet-control"
              onClick={() =>
                wrongNetwork
                  ? switchChain.switchChain({ chainId: appConfig.chain.id })
                  : disconnect.disconnect()
              }
              type="button"
            >
              <span className="wallet-presence" />
              <span className="mono">{shortAddress(connection.address)}</span>
              <span className="wallet-action">{wrongNetwork ? 'Switch' : 'Disconnect'}</span>
            </button>
          ) : (
            <button
              className="wallet-control"
              disabled={!connector || connect.isPending}
              onClick={() => connector && connect.connect({ connector })}
              type="button"
            >
              <Icon name="wallet" />
              {connect.isPending ? 'Connecting…' : 'Connect wallet'}
            </button>
          )}
        </div>
      </div>
      <div className="header-meta" aria-label="Round metadata">
        <span>
          Token <strong className="mono">{symbol}</strong>
        </span>
        {deadline && (
          <span>
            Deadline <strong>{formatDeadline(deadline)}</strong>
          </span>
        )}
        {contractAddress && (
          <a
            href={`${appConfig.explorerUrl}/address/${contractAddress}`}
            rel="noreferrer"
            target="_blank"
          >
            Contract <span className="mono">{shortAddress(contractAddress)}</span>
            <Icon name="external" />
          </a>
        )}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 40 40">
      <path d="M20 7 7.5 30h25L20 7Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="7" r="3.25" />
      <circle cx="7.5" cy="30" r="3.25" />
      <circle cx="32.5" cy="30" r="3.25" />
      <circle cx="20" cy="22" r="3" className="brand-core" />
    </svg>
  );
}
