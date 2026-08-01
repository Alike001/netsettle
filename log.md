# Project Log (append-only — newest entry at top)

Tell Codex to add a new entry here after every meaningful session. Never edit or delete past entries — only add new ones above them.

---

### 2026-08-01 — Proved real expired-round recovery and all refunds
- **What was done/found**: Round #2 was created with a 5-USDC collateral cap for the same three wallets, all three deposits arrived, and no encrypted obligations were submitted. After its deadline, participant C marked the round expired. Participants C, A, and B each claimed the full 5-USDC refund; the hosted app shows “Refund claimed” for all three and “Claim complete” for the connected wallet.
- **What broke (if anything)**: Nothing failed. The contract’s recovery path kept confidential handles closed and returned only the exact deposited collateral, as designed.
- **Fix made**: Queried Sepolia to verify 26 total NetSettle event logs across both rounds, added public expiry/refund transaction links to `docs/demo-readiness.md`, and updated README/handoff status. Every functional evidence item is now checked; video, local backup, clean-clone verification, and the tagged X post remain pending.
- **Why this matters / what rule it earned**: Financial privacy products need a real timeout exit, not only a happy settlement path. Recovery must be demonstrated with actual collateral return and public transaction evidence before it is claimed as complete.

---

### 2026-08-01 — Added a real next-round creation path for recovery testing and continued use
- **What was done/found**: The approved expiry/refund test requires a second onchain round, but the interface previously exposed creation only when the contract had zero rounds. A completed clearing product needs a way to open its next fixed group after the first group has withdrawn.
- **What broke (if anything)**: There was no contract issue; the UI simply hid its existing creation flow after Round #1, blocking the approved recovery test from being performed through the product.
- **Fix made**: After all three participants claim a finalized round, the action panel now offers “Create next round.” It opens the existing three-address, equal-collateral, deadline form and returns to the newly created current round after the real contract confirmation. No Solidity or Nox logic changed. Type-check, lint, all 10 frontend tests, and a clean production build pass.
- **Why this matters / what rule it earned**: A completed round should not make a clearing product a dead end. Reuse the tested contract path for another real round rather than adding a separate test-only escape hatch.

---

### 2026-08-01 — Captured non-participant action rejection
- **What was done/found**: A fourth real Ethereum Sepolia wallet (`0xE0c3…A248`) opened finalized Round #1. The deployed interface identified it as outside the three public participants and presented “Round is view-only” with “No action available.”
- **What broke (if anything)**: Nothing failed. No contract call was offered or sent, so this is safe evidence that an unlisted wallet cannot initiate any round action through the product.
- **Fix made**: Marked the non-participant rejection requirement complete in the demo-readiness checklist. The only remaining functional-path evidence is refund/expiry or invalid-round recovery.
- **Why this matters / what rule it earned**: Participant authorization should be visible before a wallet attempts a transaction. A read-only state is stronger UX than permitting a predictable revert and spending a user’s gas.

---

### 2026-08-01 — Captured wrong-network recovery and full onchain activity evidence
- **What was done/found**: A real connected MetaMask wallet was switched away from Ethereum Sepolia. NetSettle showed its explicit “Wrong network / Switch to Sepolia” state and requested no transaction. The wallet then returned to Sepolia successfully. The Round activity panel now displays all 16 verified Round #1 events, including three withdrawals, finalization, validation state changes, and encrypted submissions, each with an explorer link.
- **What broke (if anything)**: Nothing failed in the recovery flow. This confirms the archive-capable RPC fallback repair is working in the deployed browser application, not merely through a command-line check.
- **Fix made**: Marked wrong-network recovery complete in the evidence checklist and updated handoff actions to focus on the remaining rejection/refund, video, backup, clean-install, and X-post evidence.
- **Why this matters / what rule it earned**: A network guard must be demonstrated as a safe recovery flow—block cross-network actions, request an explicit switch, and reconstruct verified history after return—not merely represented by a badge.

---

### 2026-08-01 — Published real Round #1 transaction evidence
- **What was done/found**: Queried the archive-capable Sepolia RPC for the deployed NetSettle contract and verified 16 Round #1 events. The complete chain record covers round creation, all three deposits, all three encrypted submissions, computation/validation state transitions, finalization, and all three withdrawals.
- **What broke (if anything)**: The public README and demo checklist still described the required three-wallet Sepolia evidence as pending even after the successful live run.
- **Fix made**: Updated `docs/demo-readiness.md` with the real Etherscan links for creation, funding, submissions, validation, finalization, and all withdrawals; marked only the genuinely proven funding, full-round, and reload/retry evidence complete. Updated the README’s current status to describe the real completed Sepolia round. Wrong-network, rejection, refund, video, offline backup, clean clone, and X-post requirements remain intentionally unchecked.
- **Why this matters / what rule it earned**: Submission claims must be backed by public transaction evidence, while untested requirements must remain visibly incomplete rather than being inferred from the happy path.

---

### 2026-08-01 — Corrected the lifecycle-badge fix to target the actual requested icons
- **What was done/found**: The user clarified with screenshots that “lifecycle symbols” meant the Fund, Submit, Compute, Settle, and Withdraw icons in the Lifecycle rail—not the separate central clearing node. The previous release incorrectly repositioned the clearing node and made its status text overlap.
- **What broke (if anything)**: The central clearing core layout was changed beyond the user’s request, producing a visibly broken node. This was a scope error, not an on-chain or data error.
- **Fix made**: Restored the clearing core’s original flex layout and radial alignment. Applied baseline-free grid centering only to `.lifecycle-icon` and its SVG, which targets precisely the five requested circular lifecycle badges. App lint, all 10 frontend tests, and a clean production build pass.
- **Why this matters / what rule it earned**: When a visual reference names a specific UI region, modify that region only. Do not infer a broader redesign from an ambiguous phrase; use the screenshot to identify the exact surface first.

---

### 2026-08-01 — Restored real activity history and refined the final clearing visualization
- **What was done/found**: The completed Round #1 screen made `Encrypted` route labels too faint because finalized state applied 28% opacity to both the routes and their labels. The user also confirmed the central lifecycle symbol still needed to sit in the actual center of the clearing circle. Separately, Round activity displayed zero events despite real transactions.
- **What broke (if anything)**: PublicNode rejects the historical `eth_getLogs` query from the deployment block as an archive request, so the app had an empty event list even though the contract emitted 16 logs. The center icon was part of a vertically centered icon-and-text stack, not fixed to the core’s geometric center.
- **Fix made**: Kept dashed final routes subordinate at 40% opacity but increased `Encrypted` label weight and opacity to preserve legibility. Positioned the core icon at the exact 50%/50% center and placed status copy independently below it. Replaced the single PublicNode transport with the documented Wagmi/Viem fallback of `sepolia.drpc.org` then Tenderly’s Sepolia gateway. A read-only live query through dRPC returned 16 genuine NetSettle logs through `eth_getLogs`, and its response permits browser origins. Type-check, lint, all 10 frontend tests, and clean Vite build pass.
- **Why this matters / what rule it earned**: Privacy routes must remain visible and clearly labelled after settlement, and an activity panel must fail over to an archive-capable RPC rather than silently showing zero history. The primary computation icon must have a fixed geometric anchor, independent of variable-length state text.

---

### 2026-08-01 — Completed the real Sepolia round and corrected lifecycle icon centering
- **What was done/found**: Round #1 completed end to end with three real MetaMask wallets: funding, all six encrypted obligation routes, Nox safety-proof validation, public net-position finalization, and all three withdrawals. The final conserved result was A pays 1 USDC and withdraws 9; B receives 2 and withdraws 12; C pays 1 and withdraws 9. The user then identified a small visual defect: the central lifecycle SVG looked optically off-center in its circular icon badge.
- **What broke (if anything)**: The SVG inherited inline layout behaviour inside the grid-centered orbit, leaving baseline layout room that could make the glyph appear misaligned even though the wrapper itself was centered.
- **Fix made**: Made the lifecycle SVG a block-level 18px element and removed line-height/baseline influence from its 34px grid-centered circular container. App lint, all 10 frontend tests, and a clean Vite production build pass. Browser-plugin and Playwright visual automation are unavailable here; a hosted hard-refresh remains the visual confirmation.
- **Why this matters / what rule it earned**: The completed real round proves the product’s full confidential settlement path, while UI details in the primary state visualization must be corrected visibly rather than dismissed as cosmetic—UX is a scored hackathon dimension.

---

### 2026-08-01 — Fixed detached Nox public-decryption method during live validation
- **What was done/found**: After every participant sealed a real encrypted obligation vector in Sepolia Round #1, Account A selected “Verify safety proofs.” The app stopped before MetaMask with `Cannot read properties of undefined (reading 'apiService')`; no validation transaction was signed or sent.
- **What broke (if anything)**: The frontend passed `client.publicDecrypt` as a bare callback to a helper. JavaScript therefore removed the Handle client's `this` context, and the SDK could not access its internally initialized API service.
- **Fix made**: Wrapped every public-decryption invocation in an arrow function that calls `client.publicDecrypt(handle)`, retaining the initialized Handle client for both validation and finalization. Context7 confirms this uses Nox's supported Viem Handle client and public-decryption API. App type-check, lint, all 10 frontend tests, and a clean Vite production build pass.
- **Why this matters / what rule it earned**: SDK instance methods with internal services must never be detached as callbacks. A pre-wallet error means no on-chain action occurred; repair and deploy the client boundary before asking a participant to retry.

---

### 2026-08-01 — Proved the repaired Nox browser wallet flow with Account C
- **What was done/found**: After the Vercel deployment of the adapter repair, Account C successfully submitted its confidential `4` USDC obligation to A and `1` USDC obligation to B in the real Round #1. The UI changed to “Obligations sealed,” reported “Confirmed onchain,” and the clearing core correctly showed two submissions remaining.
- **What broke (if anything)**: No error recurred. The prior failed attempt had not sent a transaction, so no duplicate action or financial state cleanup was needed.
- **Fix made**: The deployed adapter now creates Nox's required Viem wallet client directly from the active MetaMask provider and address. The live result verifies that the runtime boundary works, not merely its TypeScript types.
- **Why this matters / what rule it earned**: Browser-wallet encryption must be proven through a real Nox submission before it is claimed as working. A successful sealed-vector state is the correct evidence; plaintext remains absent after confirmation.

---

### 2026-08-01 — Fixed the clean-build declaration gap in the wallet repair
- **What was done/found**: The Nox browser-wallet repair passed locally but its first Vercel deployment failed before bundling: the clean TypeScript build did not know `Window.ethereum`, even though the local incremental build had passed.
- **What broke (if anything)**: The project relied on a transitive browser-provider declaration that was not included under the app's explicit TypeScript `types` configuration. This made local incremental validation insufficiently representative of Vercel's clean checkout.
- **Fix made**: Added the explicit EIP-1193 `Window.ethereum` declaration in `app/src/vite-env.d.ts`, cleared generated TypeScript build metadata, and reran the clean Vite build, app lint, and all ten app tests successfully. The repaired Vercel deployment and real MetaMask/Nox submission remain pending.
- **Why this matters / what rule it earned**: When production TypeScript uses browser-provider globals, declare them in the application boundary and test from a clean build state. Cached builds cannot be treated as deployment proof.

---

### 2026-08-01 — Repaired the Nox browser-wallet adapter during live Round #1
- **What was done/found**: With all three participants funded, Account C attempted its first encrypted submission and the hosted app displayed `Unsupported client. Expected a viem WalletClient instance connected to an account.` The entered values were not submitted and no transaction was sent.
- **What broke (if anything)**: The app passed Wagmi's generic connector client, extended with a TypeScript-only cast, into `createViemHandleClient`. The Nox SDK validates the runtime client shape and rejected it because it lacks the full Viem wallet-client action surface.
- **Fix made**: Replaced that adapter with the Nox-documented `createWalletClient({ account, chain, transport: custom(window.ethereum) })` construction, pinned to the active Wagmi address. App type-check, lint, all ten unit tests, and the Vite production build pass. The correction requires a real MetaMask/Nox submission retest after Vercel deploys it.
- **Why this matters / what rule it earned**: A TypeScript cast cannot create runtime protocol compatibility. When bridging Wagmi to Nox, construct the exact Viem wallet-client boundary the Nox SDK documents and validate it with a real injected-wallet flow.

---

### 2026-08-01 — Started the real three-wallet Sepolia round and identified activity-log gap
- **What was done/found**: The participant funded three MetaMask Sepolia accounts, created NetSettle Round #1, and participant A (`0xdE67…7F71`) completed its collateral deposit. The deployed interface correctly shows Funding and the onchain-funded state.
- **What broke (if anything)**: The Round activity panel is empty after real RoundCreated and RoundFunded actions. A direct read-only `eth_getLogs` request against the frontend's default PublicNode Sepolia RPC endpoint returned HTTP 403, while contract reads/writes still work.
- **Fix made**: No code change was made during diagnosis. Recorded the event-history provider issue as a production gap; the live group can continue using confirmed state and wallet/Etherscan transaction hashes, but the activity surface must be fixed and retested before final submission evidence.
- **Why this matters / what rule it earned**: A successful write is not sufficient product proof if the evidence UI cannot retrieve its corresponding events. Test every production RPC method the frontend depends on, especially `eth_getLogs`, rather than assuming read-contract success covers historical-event access.

---

### 2026-07-31 — Released NetSettle’s public Vercel frontend
- **What was done/found**: The Vite frontend is live at `https://netsettle-alike001s-projects.vercel.app`; the stable alias returns NetSettle HTML and rendered correctly in unauthenticated desktop (1440×1000) and mobile (390×844) headless Chrome checks. The deployed frontend points to the verified public Sepolia contract and requires no environment variables or wallet secrets.
- **What broke (if anything)**: The first Vercel project was accidentally configured as the `services` framework after it detected a local cloned Next.js reference app. The next build correctly found NetSettle but was rejected by that persisted project-level framework setting. The successful build initially displayed Vercel's SSO login page to unauthenticated visitors.
- **Fix made**: Excluded the reference clones with `.vercelignore`, restored the Vite workspace build configuration, changed the Vercel project framework from `services` to `vite`, and disabled only Vercel SSO deployment protection. The final Vercel logs show `npm ci`, `npm run build --workspace app`, Vite’s successful 2,033-module production build, and `Deployment completed`.
- **Why this matters / what rule it earned**: A hackathon frontend is not deployed until an unauthenticated visitor sees the product itself. Hosting checks must test the stable public alias in a clean browser, not merely rely on a successful build record.

---

### 2026-07-31 — Connected the public repository and corrected Vercel framework detection
- **What was done/found**: Created and pushed the public repository at `https://github.com/Alike001/netsettle`; local `main` now tracks `origin/main`. Linked Vercel project `alike001s-projects/netsettle` to that repository. The initial production deploy failed after Vercel detected an unrelated Next.js reference clone under `research/repos/reference-builders/winsznx-vellum/web` and built it instead of NetSettle.
- **What broke (if anything)**: Vercel CLI auto-added an incorrect experimental service entry to `vercel.json`; the failed deployment built the cloned reference app, not the configured Vite workspace. Context7 was unavailable during the deployment configuration check.
- **Fix made**: Restored the root `npm ci` / `npm run build --workspace app` / `app/dist` configuration, added `.vercelignore` to exclude only unshipped research clones and visual QA references, and ignored local `.vercel` link metadata. `vercel.json` validates and the Vite production build passes locally. A clean production redeploy remains pending.
- **Why this matters / what rule it earned**: Research material may live beside a product workspace, but it must never influence framework detection or deploy. Vercel source uploads must contain only the product's intended build inputs.

---

### 2026-07-31 — Identified the GitHub publishing blocker
- **What was done/found**: Confirmed the local Vercel hosting commit is on a clean `main` branch and GitHub CLI 2.96.0 is installed. The saved active GitHub account is `Alike001`, but its token is invalid; the repository has no remote yet.
- **What broke (if anything)**: `gh auth status` fails before repository creation because the saved GitHub credential is no longer valid.
- **Fix made**: No credential was inspected, displayed, replaced, or bypassed. Recorded the required interactive `gh auth login -h github.com` recovery step, after which the approved public repository creation/push and Vercel import can proceed.
- **Why this matters / what rule it earned**: GitHub authentication is personal account authority. A failed token cannot be worked around by asking for a token in chat; the user must authenticate locally through GitHub's normal browser/device flow.

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
