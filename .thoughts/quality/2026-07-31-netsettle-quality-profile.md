# Project Quality Profile: NetSettle

## Detected Stack

- npm workspaces with a Hardhat 3 smart-contract package and a React 19 + Vite 8 frontend package.
- Solidity `0.8.35`, iExec Nox protocol contracts, Nox Hardhat plugin, OpenZeppelin contracts, Viem, wagmi, and the Nox Handle SDK.
- TypeScript for deployment, tests, frontend state, and contract integration.
- Docker-backed local Nox services for confidential integration tests.
- Ethereum Sepolia for final end-to-end verification.

The advertised stack-detection helper was not present in the installed skill directory, so this profile is based on the approved plan and the inspected official Nox starter/SDK manifests.

## Existing Commands

The workspace had no application manifest when this profile was created. The root workspace must expose these stable commands once scaffolded:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:nox`
- `npm run build`

## Required Local Checks

Run after every non-trivial piece, not only at handoff:

1. Format and lint the files changed in the current slice.
2. Type-check the affected workspace.
3. Run focused unit tests for the changed behavior.
4. Run the full contract test suite after contract state or arithmetic changes.
5. Run Docker-backed Nox integration tests after encrypted-handle or proof-flow changes.
6. Run the frontend production build after integration or styling changes.
7. Run browser tests at desktop and mobile widths after visible changes.
8. Run a real three-wallet Sepolia script before claiming end-to-end completion.

## Required CI Gates

- Dependency installation from the committed lockfile.
- Formatting and linting.
- TypeScript type-checking.
- Solidity compilation.
- Deterministic contract unit and edge-case tests.
- Frontend unit tests and production build.
- Secret scanning and a check that no `.env` file, private key, mnemonic, or RPC credential is tracked.
- Docker-backed Nox tests may use a dedicated integration job when the runner supports Docker.
- Sepolia evidence is a release gate and recorded artifact, not a per-commit CI dependency.

## Suggested Hooks

- Pre-commit: format check, lint changed files, and reject obvious secret-file names.
- Pre-push: workspace type-check, focused unit tests, and production build.
- Hooks must stay under roughly 60 seconds; Docker Nox and Sepolia tests remain explicit gates.

## File Size Policy

- Target: 200 source lines.
- Warning: above 200 source lines.
- Hard cap: above 300 source lines.
- Exclusions: generated ABIs/type artifacts, lockfiles, build output, vendored code, fixtures, and deployment artifacts.
- Escape hatch: a larger source file requires a written reason here or in `handoff.md` and should still be split when ownership boundaries are clear.

## Commit Policy

- Conventional commit subjects (`docs:`, `chore:`, `feat:`, `test:`, `fix:`).
- Commit after each meaningful verified slice: baseline, contract core, Nox integration, frontend core, Sepolia deployment, and submission assets.
- Never commit secrets, funded-wallet keys, `.env` files, or unverified generated deployment addresses.

## AGENTS.md Notes

- No mock data may be presented as product behavior.
- Contract and Nox state are the source of truth after reload.
- Every judgment is deterministic: netting, validity, conservation, and withdrawal entitlement.
- Privacy claims must distinguish encrypted obligations from public participants, timing, calls, and final positions.
- Every async path requires named pending, retry, reload, expiry, and refund states.

## Open Questions

- The final pinned Sepolia ERC-20 must be verified for reliable address, decimals, and user access before deployment.
- Docker is installed but sandbox access to its socket requires explicit permission for Nox integration tests.
- Sepolia deployment requires locally configured RPC and funded test-wallet secrets; they must never enter Git or chat.
