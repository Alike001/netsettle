# NetSettle

**Many private obligations become a few verifiable settlements without publishing the underlying payment amounts.**

NetSettle is a three-party clearing product built with iExec Nox on Ethereum Sepolia. Three public wallet addresses deposit equal test USDC collateral and each submit two confidential obligations. Nox computes the six values privately. The contract publishes only three final net positions, proves that total pay equals total receive, and lets each participant withdraw exactly once.

## What is private

- Private: the six bilateral obligation amounts.
- Public: participant addresses, token, collateral, deadlines, transaction timing, called functions, round status, final net positions, and withdrawals.

The current Handle SDK sends an entered amount over TLS to the trusted Nox gateway, which returns an encrypted handle and proof. NetSettle does not claim browser-local encryption, anonymity, or hidden blockchain metadata.

## Deployment

| Item                    | Value                                                           |
| ----------------------- | --------------------------------------------------------------- |
| Network                 | Ethereum Sepolia (`11155111`)                                   |
| Settlement token        | Circle test USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`) |
| NoxCompute              | `0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF`                    |
| NetSettle               | Pending live deployment                                         |
| Compute recovery window | 1 hour                                                          |

Circle test USDC has no financial value. The live NetSettle address and deployment block will be added only after an evidenced Sepolia deployment.

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
```

The first read-only preflight verifies the RPC chain ID, official USDC bytecode and metadata, and NoxCompute bytecode. The deployer check derives only the configured account's public address and Sepolia ETH balance; it signs and sends nothing. Confirm that address before running the resumable Ignition deployment, which pins the token and one-hour compute timeout in code.

After deployment, copy `app/.env.example` to `app/.env.local` and set only public values:

```dotenv
VITE_NETSETTLE_ADDRESS=0x...
VITE_DEPLOYMENT_BLOCK=...
VITE_SEPOLIA_RPC_URL=https://...
```

Then run:

```bash
npm run dev --workspace app
```

## Repository map

- `contracts/contracts/NetSettle.sol` — confidential clearing and settlement state machine
- `contracts/test/` — deterministic and Docker-backed Nox tests
- `contracts/ignition/` — pinned Sepolia deployment
- `app/src/` — contract-backed React interface
- `research/domain-knowledge.md` — judging criteria and protocol research
- `design.doc.md` — accepted UX direction and privacy language
- `feedback.md` — evidence-based iExec Nox tool feedback

## Current status

The contract, confidential local integration, frontend, responsive browser QA, and deployment safeguards are complete. The required three-wallet Ethereum Sepolia evidence is still pending and is not represented with mock data.

This is hackathon software for testnet use, not audited production custody code.
