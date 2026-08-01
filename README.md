# NetSettle

**Many private obligations become a few verifiable settlements without publishing the underlying payment amounts.**

NetSettle is a three-party clearing product built with iExec Nox on Ethereum Sepolia. Three public wallet addresses deposit equal test USDC collateral and each submit two confidential obligations. Nox computes the six values privately. The contract publishes only three final net positions, proves that total pay equals total receive, and lets each participant withdraw exactly once.

**Judge start:** [open the completed, verifiable Round #1](https://netsettle-alike001s-projects.vercel.app/?round=1). It contains six real encrypted submissions, Nox proof validation, conserved net positions, and all three withdrawals. [Round #2](https://netsettle-alike001s-projects.vercel.app/?round=2) is the separate real expiry/refund proof. A connected Sepolia wallet can start its own independent three-party round from an active observer view or any closed round.

## What is private

- Private: the six bilateral obligation amounts.
- Public: participant addresses, token, collateral, deadlines, transaction timing, called functions, round status, final net positions, and withdrawals.

The current Handle SDK sends an entered amount over TLS to the trusted Nox gateway, which returns an encrypted handle and proof. NetSettle does not claim browser-local encryption, anonymity, or hidden blockchain metadata.

## Deployment

| Item                    | Value                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Network                 | Ethereum Sepolia (`11155111`)                                                                                                                                                                                                                                                                                    |
| Settlement token        | Circle test USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`)                                                                                                                                                                                                                                                  |
| NoxCompute              | `0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF`                                                                                                                                                                                                                                                                     |
| NetSettle               | [0x9f10…D8EA](https://sepolia.etherscan.io/address/0x9f10b266F90638fC058e0891901082Fe9eccD8EA)                                                                                                                                                                                                                   |
| Verified source         | [Etherscan](https://sepolia.etherscan.io/address/0x9f10b266F90638fC058e0891901082Fe9eccD8EA#code), [Blockscout](https://eth-sepolia.blockscout.com/address/0x9f10b266F90638fC058e0891901082Fe9eccD8EA#code), [Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x9f10b266F90638fC058e0891901082Fe9eccD8EA) |
| Deployment transaction  | [0x5b46…10ee](https://sepolia.etherscan.io/tx/0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee)                                                                                                                                                                                                |
| Deployment block        | `11388543`                                                                                                                                                                                                                                                                                                       |
| Compute recovery window | 1 hour                                                                                                                                                                                                                                                                                                           |
| Hosted frontend         | [completed Round #1](https://netsettle-alike001s-projects.vercel.app/?round=1)                                                                                                                                                                                                                                   |

Circle test USDC has no financial value. The deployment was confirmed with the contract's public token and compute-timeout getters.

## How it works

1. A creator opens a round for exactly three distinct wallets, one equal collateral amount, and a deadline.
2. Each participant approves and deposits the exact collateral in test USDC.
3. Each participant submits a fixed two-value encrypted vector—even a zero is encrypted.
4. Nox privately checks safe arithmetic and the collateral cap, then computes each wallet's net pay or receive position.
5. Public proofs reveal only the final net positions. The Solidity contract reruns the conservation check.
6. Each wallet withdraws `collateral - netPay + netReceive`. Invalid or expired rounds refund funded participants.

All round state is reconstructed from the chain after reload. Pending proof requests can be retried without resubmitting a financial action.

## Requirements

- Node.js 22.12 or newer and npm 11
- Docker for the real local Nox integration suite
- Three Ethereum Sepolia wallets with Sepolia ETH and Circle test USDC for the live flow
- A browser wallet such as MetaMask or Rabby

## Install and verify

```bash
npm ci
npm run format:check
npm run typecheck
npm run lint
XDG_CACHE_HOME="$PWD/.cache" npm test
XDG_CACHE_HOME="$PWD/.cache" npm run build
```

Run the Docker-backed confidential-compute tests separately:

```bash
XDG_CACHE_HOME="$PWD/.cache" npm run test:nox
```

These tests use real encrypted handles and proof flows against the local Nox stack. The deterministic unit suite covers authorization, duplicate actions, deadlines, cap boundaries, conservation, withdrawals, refunds, and frontend state/input rules.

At the current release, the suite includes 10 deterministic contract/config tests, a Nox-runner guard, 20 frontend behavior/UI tests, and 5 Docker-backed Nox integration tests. The live contract and frontend are separately evidenced by the linked Sepolia rounds above.

## Deploy safely to Sepolia

Never put a private key in this repository, a `.env` file, a command, or chat. Hardhat stores it in an encrypted keystore outside the project and prompts for it interactively.

```bash
cd contracts
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
cd ..
XDG_CACHE_HOME="$PWD/.cache" npm run check:sepolia
XDG_CACHE_HOME="$PWD/.cache" npm run check:deployer
XDG_CACHE_HOME="$PWD/.cache" npm run deploy:sepolia
XDG_CACHE_HOME="$PWD/.cache" npm run check:deployment
```

The first read-only preflight verifies the RPC chain ID, official USDC bytecode and metadata, and NoxCompute bytecode. The deployer check derives only the configured account's public address and Sepolia ETH balance; it signs and sends nothing. Confirm that address before running the resumable Ignition deployment, which pins the token and one-hour compute timeout in code. The final deployment check confirms the onchain NetSettle bytecode, token, timeout, and current round count.

The frontend defaults to this verified deployment and public Sepolia RPC, so it starts without a `.env` file:

```bash
npm run dev --workspace app
```

`app/.env.example` lists optional public overrides for a custom deployment or RPC.

## Host the frontend on Vercel

The public frontend is live at
[netsettle-alike001s-projects.vercel.app](https://netsettle-alike001s-projects.vercel.app).
Vercel is configured at the repository root in `vercel.json` and `.vercelignore`
excludes local research clones. Vercel runs `npm ci`, builds the `app` workspace,
and publishes `app/dist`.

The hosted frontend contains only the public NetSettle Sepolia address and a
public RPC fallback. Do not configure `SEPOLIA_PRIVATE_KEY`, a seed phrase, or
any wallet secret in Vercel.

## Repository map

- `contracts/contracts/NetSettle.sol` — confidential clearing and settlement state machine
- `contracts/test/` — deterministic and Docker-backed Nox tests
- `contracts/ignition/` — pinned Sepolia deployment
- `app/src/` — contract-backed React interface
- `research/domain-knowledge.md` — judging criteria and protocol research
- `docs/demo-readiness.md` — live evidence and offline-presentation checklist
- `feedback.md` — evidence-based iExec Nox tool feedback

## Current status

The contract, confidential local integration, frontend, responsive browser QA, deployment safeguards, a complete three-wallet Ethereum Sepolia settlement, and a separate expired-round recovery are complete. Round #1 used six real encrypted obligation submissions, passed Nox safety validation, finalized conserved public net positions, and completed all three one-time withdrawals. Round #2 proved that an expired funded round returns exact collateral to every participant without opening confidential handles. Their public activity can be reviewed directly in the deployed app or through the linked transaction evidence in [docs/demo-readiness.md](docs/demo-readiness.md).

This is hackathon software for testnet use, not audited production custody code.
