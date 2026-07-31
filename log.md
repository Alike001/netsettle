# Project Log (append-only — newest entry at top)

Tell Codex to add a new entry here after every meaningful session. Never edit or delete past entries — only add new ones above them.

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
