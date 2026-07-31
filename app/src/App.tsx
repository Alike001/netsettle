import { useConnection } from 'wagmi';
import { ActionPanel, CreateRoundPanel } from './components/ActionPanel';
import { AppHeader } from './components/AppHeader';
import { ClearingWorkspace } from './components/ClearingWorkspace';
import { Icon } from './components/Icon';
import { LifecycleRail } from './components/LifecycleRail';
import { RoundActivity } from './components/RoundActivity';
import { useRoundActions } from './hooks/useRoundActions';
import { useRoundData } from './hooks/useRoundData';
import { errorMessage } from './lib/format';
import { lifecycleFor, participantIndex, type RoundStatus } from './lib/round';

export default function App() {
  const connection = useConnection();
  const data = useRoundData();
  const actionState = useRoundActions({
    contractAddress: data.contractAddress,
    onConfirmed: data.refetch,
    round: data.round,
    roundId: data.roundId,
    tokenAddress: data.tokenAddress,
  });
  const connectedParticipantIndex = data.round
    ? participantIndex(data.round.participants, connection.address)
    : -1;

  return (
    <div className="app">
      <AppHeader
        contractAddress={data.contractAddress}
        deadline={data.round?.submissionDeadline}
        roundId={data.roundId}
        status={data.round?.status as RoundStatus | undefined}
        symbol={data.symbol}
      />
      <main className="app-main">
        {!data.contractAddress ? (
          <DeploymentState />
        ) : data.isLoading ? (
          <LoadingState />
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={() => void data.refetch()} />
        ) : !data.roundId || data.roundCount === 0n ? (
          <div className="workspace-grid">
            <EmptyRound />
            <CreateRoundPanel
              actions={actionState.actions}
              decimals={data.decimals}
              error={actionState.error}
              pending={actionState.pending}
              symbol={data.symbol}
            />
          </div>
        ) : data.round ? (
          <>
            <div className="workspace-grid">
              <ClearingWorkspace decimals={data.decimals} round={data.round} symbol={data.symbol} />
              <ActionPanel
                actions={actionState.actions}
                allowance={data.allowance}
                connectedParticipantIndex={connectedParticipantIndex}
                decimals={data.decimals}
                error={actionState.error}
                pending={actionState.pending}
                round={data.round}
                symbol={data.symbol}
              />
            </div>
            <LifecycleRail items={lifecycleFor(data.round)} />
            <RoundActivity configured={data.activityConfigured} events={data.activity} />
          </>
        ) : (
          <ErrorState
            error={new Error('The requested round does not exist.')}
            onRetry={() => void data.refetch()}
          />
        )}
      </main>
      <footer className="app-footer">
        <span>
          Built with iExec Nox. Obligation amounts are confidential; participant addresses, calls,
          timing, and final net positions are public.
        </span>
        <a
          href="https://docs.iex.ec/nox-protocol/getting-started/welcome"
          rel="noreferrer"
          target="_blank"
        >
          How Nox works <Icon name="external" />
        </a>
      </footer>
    </div>
  );
}

function DeploymentState() {
  return (
    <section className="system-state">
      <span className="system-state-icon">
        <Icon name="network" />
      </span>
      <p className="eyebrow">Deployment unavailable</p>
      <h1>NetSettle is not configured</h1>
      <p>
        This build has no contract address, so it will not invent a round. Configure the deployed
        Sepolia contract to load real state.
      </p>
      <code>VITE_NETSETTLE_ADDRESS=0x…</code>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="workspace-grid" aria-label="Loading current Sepolia round">
      <section className="clearing-card skeleton-card">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-stage" />
      </section>
      <aside className="action-panel skeleton-card">
        <div className="skeleton skeleton-kicker" />
        <div className="skeleton skeleton-action-title" />
        <div className="skeleton skeleton-copy" />
        <div className="skeleton skeleton-button" />
      </aside>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <section className="system-state state-error">
      <span className="system-state-icon">
        <Icon name="failure" />
      </span>
      <p className="eyebrow">Sepolia read failed</p>
      <h1>Round state could not be loaded</h1>
      <p>{errorMessage(error)}</p>
      <button className="primary-button" onClick={onRetry} type="button">
        <Icon name="refresh" />
        Retry chain read
      </button>
    </section>
  );
}

function EmptyRound() {
  return (
    <section className="clearing-card empty-round">
      <div className="empty-mark" aria-hidden="true">
        <span className="empty-node empty-node-a">A</span>
        <span className="empty-node empty-node-b">B</span>
        <span className="empty-node empty-node-c">C</span>
        <span className="empty-core">Nox</span>
      </div>
      <p className="eyebrow">No current round</p>
      <h1>Six private obligations. Three verifiable net positions.</h1>
      <p>
        Create one fixed three-participant round. Each person funds equal collateral and encrypts
        exactly two obligation values before Nox clears the group.
      </p>
      <ul className="empty-constraints">
        <li>
          <Icon name="check" /> Exactly three public wallet addresses
        </li>
        <li>
          <Icon name="check" /> One pinned Sepolia ERC-20
        </li>
        <li>
          <Icon name="check" /> Deterministic conservation proof
        </li>
      </ul>
    </section>
  );
}
