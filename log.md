# Project Log (append-only — newest entry at top)

Tell Codex to add a new entry here after every meaningful session. Never edit or delete past entries — only add new ones above them.

---

### 2026-07-31 — Prepared the frontend for reproducible Vercel hosting
- **What was done/found**: Added root-level `vercel.json` so Vercel installs the pinned workspace lockfile, builds only the `app` workspace, and publishes `app/dist`. Documented the import configuration and explicit secret boundary in the README. The Git repository currently has no remote, so Vercel cannot import it until a public GitHub repository is selected and pushed.
- **What broke (if anything)**: Context7's documentation service was unavailable during the Vercel configuration check. No deployment was attempted because the user has not yet provided a GitHub repository connection or Vercel account session.
- **Fix made**: Used current official Vercel monorepo and Vite deployment documentation as the fallback, and intentionally configured the project from the repository root so Vercel honors the committed root `package-lock.json` rather than performing an unpinned subdirectory installation.
- **Why this matters / what rule it earned**: A hosted frontend needs no private deployment credentials; NetSettle's public Sepolia address is safe to ship, but `SEPOLIA_PRIVATE_KEY` and wallet recovery material must never enter Vercel variables or build logs.

---

### 2026-07-31 — Deployed and verified NetSettle on Ethereum Sepolia
- **What was done/found**: The approved Ignition deployment succeeded at 0x9f10b266F90638fC058e0891901082Fe9eccD8EA in block 11388543 through transaction 0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee. A separate read-only RPC check confirmed deployed bytecode, official Circle test USDC, the 3,600-second timeout, and zero current rounds. The frontend now defaults to this public deployment and starts without a private environment file.
- **What broke (if anything)**: Formatting initially included Ignition's untracked public address file. Headless Chrome could render the live desktop/mobile empty-round state but cannot exercise a wallet connector without an injected wallet; the Browser plugin and regular Playwright are not available.
- **Fix made**: Formatted and retained the public deployment address/journal as evidence, ignored duplicate Ignition build-info/artifact output, added a read-only deployment verifier, public default config with test coverage, and updated the README/demo checklist. All formatting, type-check, lint, 8 contract/config tests, 10 frontend tests, and production build pass.
- **Why this matters / what rule it earned**: A public dApp must ship its verified public deployment configuration, not make a judge invent it locally. A real connected-wallet round remains a distinct evidence gate and must be tested with actual wallet injection rather than assumed from static rendering.

---

### 2026-07-31 — Passed the Sepolia deployer safety gate
- **What was done/found**: The no-transaction deployer check successfully derived public address `0xde67a35b322e5a31e8215b5245ca4e48d7977f71` on Ethereum Sepolia and reported a `0.04792394118394006 ETH` testnet balance.
- **What broke (if anything)**: Nothing failed, and no transaction was signed or sent. Live deployment remains gated on explicit approval because it will spend Sepolia test ETH.
- **Fix made**: Replaced the previously malformed private-key keystore value locally and validated only the resulting public identity and balance.
- **Why this matters / what rule it earned**: The deployer identity and funding must be proven before deployment, but passing a read-only check never implies permission to spend gas.

---

### 2026-07-31 — Added a no-transaction deployer identity check
- **What was done/found**: The corrected RPC value passed the live Sepolia preflight. The user identified that the Hardhat keystore password may also have been stored as `SEPOLIA_PRIVATE_KEY` instead of an Ethereum account private key.
- **What broke (if anything)**: The private-key entry is likely malformed, but retrieving it would unnecessarily expose sensitive material and is not an acceptable verification method.
- **Fix made**: Added `npm run check:deployer`, which resolves the configured account, verifies Sepolia chain ID, and prints only its public address and ETH balance. It never signs or sends a transaction. Formatting, type-check, lint, Solidity compilation, and the production frontend build pass.
- **Why this matters / what rule it earned**: Verify deployment identity by deriving the public address, never by displaying or sharing a private key. A password is not a wallet private key, and the deployer address must be confirmed before any gas-spending command.

---

### 2026-07-31 — Diagnosed the Sepolia preflight HHE8 failure
- **What was done/found**: Confirmed against the installed Hardhat 3.12.0 error descriptors that HHE8 means `Invalid URL`. `hardhat keystore list` also confirmed that both expected production-keystore key names exist.
- **What broke (if anything)**: The value stored under `SEPOLIA_RPC_URL` is not a URL Hardhat accepts, so the read-only preflight stops during network configuration before making an RPC request.
- **Fix made**: Prescribed overwriting only `SEPOLIA_RPC_URL` with a complete `https://` endpoint and no quotes, key-name prefix, or surrounding spaces. The private key remains untouched.
- **Why this matters / what rule it earned**: Diagnose Hardhat by its exact installed error code, not npm's trailing wrapper. HHE8 is a network-URL validation failure and must be resolved before any gas-spending command is attempted.

---

### 2026-07-31 — Confirmed secure Sepolia keystore setup
- **What was done/found**: The user completed Hardhat's interactive production-keystore flow for both `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`; Hardhat reported that both named keys were stored.
- **What broke (if anything)**: Nothing failed. The wallet's Sepolia ETH balance and the stored RPC still need to be checked before deployment.
- **Fix made**: No secret was requested, displayed, or written to the project. The next operation remains the read-only Sepolia preflight.
- **Why this matters / what rule it earned**: A successful `Key "…" set in the production keystore` message confirms encrypted storage, not deployment readiness or authority to spend gas; preflight and explicit deployment approval remain separate gates.

---

### 2026-07-31 — Made the Sepolia release path fail-closed and reproducible
- **What was done/found**: Pinned official Circle test USDC and the package-selected NoxCompute address for Ethereum Sepolia, chose a one-hour asynchronous recovery window, added secure Hardhat keystore network configuration, a resumable Ignition module, a read-only dependency preflight, two configuration tests, the public README, evidence-based `feedback.md`, and a demo-readiness checklist. The live preflight confirmed chain `11155111`, USDC bytecode/metadata, and NoxCompute bytecode. The deployment module succeeded on an in-process chain. All formatting, lint, type-check, 7 contract/config tests, 9 frontend tests, and production builds pass.
- **What broke (if anything)**: Context7 remained unreachable, and the first live preflight was blocked by sandbox DNS. No funded Sepolia deployer is configured, so the real deployment and three-wallet evidence remain intentionally incomplete.
- **Fix made**: Verified Hardhat 3 syntax against the installed official templates, retried the read-only RPC check with explicit network permission, and kept the private key entirely outside the repository through Hardhat's encrypted keystore. The deploy script cannot silently substitute another token or timeout.
- **Why this matters / what rule it earned**: Never spend even testnet gas before verifying the chain and dependency bytecode. NetSettle's final deployment is pinned to Circle test USDC `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`, NoxCompute `0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF`, and a 3,600-second recovery window; any change requires an explicit reviewed code change.

---

### 2026-07-31 — Built and browser-verified the Clearing Triangle frontend
- **What was done/found**: Built the contract-backed React/Wagmi interface for round creation, exact collateral approval/funding, two-value Nox encryption, staged public proof validation/finalization, withdrawal, expiry/refund, reload-safe polling, real event history, wrong-network handling, and explicit no-deployment/read-failure states. Added nine view-model/input tests. Root formatting, type-check, lint, unit tests, and production build pass. Playwright verified a real locally deployed two-of-three Funding round at 1536×1024 and 390×844, opened the activity disclosure, and found zero current console warnings/errors.
- **What broke (if anything)**: Context7 remained unreachable. The first rendered contract reads returned zero data because wagmi’s default client batching targeted Sepolia’s Multicall contract, which does not exist on the offline Hardhat fallback chain. The initial page also requested a missing favicon. React 19 lint rejected an impure render-time clock and effect-seeded form state. Root Hardhat gates again required the workspace cache because the sandbox home cache is read-only.
- **Fix made**: Used installed official wagmi/Handle sources, disabled automatic multicall batching for the small read set, added the favicon, moved deadline time updates into a timer callback, derived the creator address without an effect, and reran root gates with `XDG_CACHE_HOME=/home/ali/Desktop/wtf/.cache`. Also corrected failed-round lifecycle rendering so failure stops at Compute and replaced the inaccurate “local encryption” claim with trusted Nox gateway wording.
- **Why this matters / what rule it earned**: The shipped app never invents round data and must stay honest about the Handle SDK boundary: plaintext reaches the trusted Nox gateway over TLS for encryption before the transaction. Visual QA must use real chain state, even when that means the screenshot lifecycle differs from a static design reference.

---

### 2026-07-31 — Proved NetSettle against the real local Nox stack
- **What was done/found**: Implemented the fixed three-participant settlement state machine, encrypted obligation submission, Nox safe arithmetic, staged public decryption, deterministic conservation checks, exact withdrawals, expiry, and refunds. Added five deterministic unit tests and three Docker-backed Nox integration tests covering a valid conserved settlement, an over-collateral failure, and an encrypted `uint256` overflow. All eight tests pass.
- **What broke (if anything)**: The first Nox run rejected participant B's encrypted inputs with `Owner mismatch`. Hardhat's wallet clients expose every local account through `getAddresses()`, while the Handle SDK selected the first returned address as the encryption owner even when a different account signed.
- **Fix made**: Scoped each test Handle client so `getAddresses()` returns only its signing participant. The production ownership check stayed intact; no contract validation was weakened. Invalid rounds now prove only their Boolean failure flags, never expose net-position handles, and refund all funded participants.
- **Why this matters / what rule it earned**: A Handle client must have one unambiguous owner address. Test and production wallet adapters must bind encryption ownership to the same account that signs. This SDK behavior should be documented in `feedback.md`.

---

### 2026-07-31 — Pinned and verified the Phase 4 workspace
- **What was done/found**: Created npm workspaces for Hardhat/Nox contracts and the React/Vite app, pinned every direct dependency, generated the lockfile, added ESLint/Prettier/TypeScript gates, and validated Solidity 0.8.35 download/compilation plus both workspace type-checks and lints. The production dependency audit reports zero vulnerabilities.
- **What broke (if anything)**: Hardhat initially tried to write its compiler list to the read-only home cache. Vitest 3.2.7 fixed its disclosed critical issue but bundled an older Vite type system that conflicted with Vite 8. The full audit still reports 18 development-only findings through ESLint/Hardhat verification dependencies.
- **Fix made**: Redirected Hardhat's cache into the ignored workspace `.cache`, upgraded to Vitest 4.1.10 because it explicitly supports Vite 8, and rejected `npm audit fix --force`. Kept the remaining dev-only findings visible while confirming that shipped dependencies have a clean audit.
- **Why this matters / what rule it earned**: Do not suppress incompatible library types or blindly force security updates. Pin the compatible graph, keep production dependencies clean, and treat toolchain-only audit findings as tracked risk rather than product runtime exposure.

---

### 2026-07-31 — Started Phase 4 with approved build baseline
- **What was done/found**: The user approved the 90-second demo script, technical plan, and repository root. Initialized Git, generated and saved complete desktop/mobile Clearing Triangle implementation references, and wrote stack-specific quality and implementation-inventory documents before coding.
- **What broke (if anything)**: Context7 again failed at the network layer; the quality-profile helper script was absent; sandbox Docker access was denied; and Git initialization initially hit the sandbox's read-only `.git` rule.
- **Fix made**: Used the inspected official Nox/Vite/wagmi/Hardhat sources, derived the quality profile from real manifests, deferred Docker escalation until the integration-test phase, and initialized Git with the user's approved elevated permission.
- **Why this matters / what rule it earned**: Every implementation slice now has a rollback point and explicit gates. The raster concepts are fidelity references only—real UI stays code-native and contract-backed.

---

### 2026-07-31 — Completed Phase 3 with Clearing Triangle design
- **What was done/found**: The user selected Direction 1, Clearing Triangle. Replaced the design-task template with a binding `design.doc.md` covering the inspected references, exact privacy language, brand tokens, typography, desktop/mobile information hierarchy, six encrypted routes, three public net positions, lifecycle and recovery states, deterministic conservation proof, accessibility, and anti-patterns.
- **What broke (if anything)**: Context7 failed to resolve Vite, wagmi, and Hardhat because its fetch service was unreachable. The workspace remains outside a Git repository, so this phase cannot be committed yet.
- **Fix made**: Used current official Vite, wagmi, and Hardhat documentation plus the already cloned official Nox Hardhat starter and Handle SDK documentation to sanity-check the Phase 4 stack. No application code was written.
- **Why this matters / what rule it earned**: The build must remain dashboard-first and proof-first: three public identities, six uniformly encrypted routes, one named asynchronous clearing state, three public net results, and a visible conservation invariant. The triangle becomes a stacked clearing summary on small screens rather than an unreadable shrunken graph.

---

### 2026-07-31 — Researched Phase 3 interface references
- **What was done/found**: Inspected official Temporal Web UI, Stripe Dashboard, and Tailscale interface documentation and screenshots. Extracted only transferable patterns: Temporal's grouped asynchronous event states, Stripe's restrained financial hierarchy and contextual actions, and Tailscale's compact identity/readiness rows with details on demand.
- **What broke (if anything)**: Sandbox DNS initially blocked the official Tailscale screenshot downloads, and an attempted Argo Rollouts screenshot fetch failed with a TLS error. The workspace still is not a Git repository.
- **Fix made**: Retried the Tailscale downloads with approved network access and visually inspected both the roster and detail views. Omitted Argo rather than claiming an uninspected reference.
- **Why this matters / what rule it earned**: NetSettle's interface must make three things obvious before decoration: who the three participants are, where the asynchronous round is in its lifecycle, and how six confidential obligations become three public net positions. Color should communicate state, not act as generic “privacy” styling.

---

### 2026-07-31 — Completed Phase 2 with approved NetSettle scope
- **What was done/found**: The user approved NetSettle's twice-reduced scope. Saved the implementation-independent product specification to `.thoughts/specs/2026-07-31-netsettle.md`, covering objectives, users, goals, non-goals, requirements, acceptance criteria, constraints, stories, open questions, and source references.
- **What broke (if anything)**: No new technical failure occurred. The exact Sepolia token and Nox liveness timeout remain intentionally open until current deployment details are verified before implementation.
- **Fix made**: Kept those unstable implementation choices out of the approved product boundary while making the privacy, funding, validation, settlement, conservation, expiry, refund, and async-recovery requirements testable.
- **Why this matters / what rule it earned**: Phase 3 and Phase 4 must preserve one core story: exactly three public participants turn six confidential obligations into three verifiable net positions. Anything outside that proof is a non-goal unless the user explicitly expands scope.

---

### 2026-07-31 — Selected NetSettle and proposed the minimum product scope
- **What was done/found**: The user selected NetSettle. Reduced the broad confidential payment network first to a single-token, fixed-group netting product, then to a three-participant round with equal collateral, two encrypted obligations per participant, Nox-computed net positions, public final settlement, withdrawal, and deadline refund. Defined the minimum state flow and acceptance boundaries for user approval.
- **What broke (if anything)**: The broad version would have included multiple tokens, recurring rounds, organizations, Safe/Permit2 integrations, invoice documents, auditor disclosure, APIs, and arbitrary participant counts—too much surface to verify as one deep product. A naive private-invoice design could also reveal counterparties through variable-length submissions or fail settlement when a payer's balance changes.
- **Fix made**: Proposed a fixed three-person roster, complete encrypted obligation vectors, and equal pre-funded collateral. This hides which bilateral amount is non-zero, guarantees available settlement funds, and preserves a simple conservation invariant while keeping addresses and final net positions honestly public.
- **Why this matters / what rule it earned**: The core story is not “private payments”; it is “many confidential obligations become a few verifiable net positions.” Every retained feature must prove that story or provide a necessary safety/recovery path.

---

### 2026-07-31 — Narrowed Phase 2 to five original directions
- **What was done/found**: Generated more than ten raw directions internally, filtered them against the Phase 1 evidence, and developed five distinct finalists: NoxSentinel (privacy-invariant testing/monitoring), AttestGate (attestation-before-encryption SDK), NetSettle (confidential multilateral payment netting), ShadowRange (private Uniswap LP automation), and VeiledVote (sealed-ballot Governor module). Recorded objective feasibility, wow, judging-alignment, and demo scores; final totals await the user's required personal-excitement ratings.
- **What broke (if anything)**: Current GitHub collision checks found that a straightforward confidential Safe guard already exists as `danielamodu/Nox-safe`, while `Xconmax245/Skia` already occupies confidential Aave credit/liquidation. Sparse indexed search also required direct GitHub API checks.
- **Fix made**: Removed both colliding concepts and excluded the most obvious crowded answers—generic private swaps, payroll, vaults, escrow, auctions, and simple selective disclosure. Retained only directions with a distinct problem, clear Nox necessity, an honest privacy boundary, and a real end-to-end Sepolia proof path.
- **Why this matters / what rule it earned**: Originality must be checked against the current event, not only past winners. A different name is not a different project; any selected direction needs one precise mechanism and must openly state what remains public.

---

### 2026-07-30 — Completed Phase 1 research for the iExec Nox WTF Hackathon
- **What was done/found**: Read the full hackathon rules and judging criteria; confirmed that UX is scored, ETH Sepolia and real end-to-end behavior are required, and VIBE project reuse is disqualifying. Cloned and read nine official Nox repositories, all three prior VIBE winners, aligned projects from all five required reference builders, and the current Safe, Uniswap v4 Periphery, and Sablier Flow codebases. Researched current iExec strategy/funding, current WTF repository crowding, and public pain-point signals. Wrote the six required sections to `research/domain-knowledge.md` with verified facts, inferences, unknowns, sources, collision risks, and production-quality benchmarks.
- **What broke (if anything)**: Context7 resolved the Nox documentation library but all scoped queries failed at the network layer; the DoraHacks detail page was blocked by JavaScript/WAF behavior; ordinary web search returned no useful results; initial GitHub clones were blocked by sandbox DNS, and a few reference-builder clones left incomplete shallow repositories. The exact submission cut-off timestamp/timezone could not be verified. The workspace is not a Git repository, so no session commit could be made.
- **Fix made**: Fell back to official raw GitHub documentation and source code, used indexed Brave results and organizer-supplied primary text for the hackathon page, retried required clones with approved network access, and created clean `-scan` clone directories where incomplete clones could not safely be overwritten. Marked the deadline as unknown rather than guessing.
- **Why this matters / what rule it earned**: A competitive submission needs a specific, validated privacy failure and a clean integration with an unchanged public protocol—not merely an encrypted field. It must preserve authorization, replay, slippage/solvency, cancellation, and recovery invariants; handle Nox's asynchronous lifecycle and ACL correctly; use exact pinned versions; and prove the real flow on ETH Sepolia without mocks.

---

## Entry format (copy this block for each new entry)

### [Date] — [short title of what this session covered]
- **What was done/found**: ...
- **What broke (if anything)**: ...
- **Fix made**: ...
- **Why this matters / what rule it earned**: ...

---

### 2026-07-30 — Resolved Nox Remix compiler mismatch
- **What was done/found**: Verified with current Nox documentation that its setup uses Solidity `0.8.35`. The current `@iexec-nox/nox-protocol-contracts` imports declare `pragma solidity ^0.8.35`.
- **What broke (if anything)**: Remix had Solidity `0.8.34` selected, so it rejected the imported Nox files before compiling.
- **Fix made**: Instructed the user to select Solidity `0.8.35` (or a newer stable 0.8.x release) in Remix, then compile again.
- **Why this matters / what rule it earned**: The Hello World guide's `0.8.27+` wording is stale for the current imported Nox package; trust the pragma in the resolved dependency and use 0.8.35 as the safe baseline.

---

### 2026-07-30 — Verified iExec Nox Hello World registration requirement
- **What was done/found**: Read the live official Nox Hello World source and confirmed the journey deploys `ConfidentialPiggyBank` through Remix with Solidity 0.8.27+ on Ethereum Sepolia, then uses the same connected wallet in the Nox widget to encrypt/decrypt values.
- **What broke (if anything)**: Context7 and the normal web fetch could not retrieve the documentation because of network-layer failures.
- **Fix made**: Retrieved the official page and its Markdown source directly from the `iExec-Nox/documentation` repository after locating the source path through the GitHub API.
- **Why this matters / what rule it earned**: The DoraHacks field must contain the public `0x...` address of the wallet used for the journey—not the deployed contract address, a transaction hash, private key, or seed phrase. Keep the same wallet connected throughout and use Ethereum Sepolia.

---

<!-- New entries go above this line, newest first -->
