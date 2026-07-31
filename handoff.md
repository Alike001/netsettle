# Handoff Notes

Read this FIRST at the start of every session, before doing anything else. This is how a past session tells the next one (or tells the human) what's already been decided — don't re-decide it.

## Current blockers

(What's stuck, waiting on a decision, or broken right now)

- Phase 2 is complete: NetSettle and its twice-reduced three-participant scope are approved and saved in `.thoughts/specs/2026-07-31-netsettle.md`.
- Phase 3 is complete. The user selected Direction 1, Clearing Triangle, and the binding design is saved in `design.doc.md`.
- Phase 4 is approved. The demo script and technical plan are accepted, and `/home/ali/Desktop/wtf` is now the intended Git root.
- The approved desktop/mobile implementation references are saved under `assets/design/`; build against them and verify with browser screenshots plus `view_image`.
- The pinned npm workspace is installed and type-checks. Production `npm audit --omit=dev` is clean; 18 development-only audit findings remain in ESLint/Hardhat verification dependency paths and must not be hidden with `--force`.
- The contract slice is implemented. Five unit tests and three real Docker-backed Nox integration tests pass, including valid conservation/withdrawal, over-cap privacy/refund, and encrypted-overflow privacy/refund.
- The Clearing Triangle frontend is implemented against real Wagmi/Nox state. Nine app tests, root lint/type-check/build, and desktop/mobile Playwright QA pass. The activity interaction showed four real local-chain events and the final browser session had zero warnings/errors.
- The exact DoraHacks submission closing timestamp and timezone were not exposed by the accessible page. An indexed announcement says August 1, but the live DoraHacks countdown/Discord announcement must be checked before submission.
- NetSettle is deployed and independently verified on Ethereum Sepolia: contract 0x9f10b266F90638fC058e0891901082Fe9eccD8EA, deployment transaction 0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee, block 11388543, Circle test USDC, 3,600-second timeout, and zero rounds. The frontend defaults to this public configuration with no environment file required.
- The configured deployer is public address 0xde67a35b322e5a31e8215b5245ca4e48d7977f71; its balance was 0.04792394118394006 ETH immediately before deployment. No secret may enter chat, Git, or a project environment file.
- Desktop/mobile headless Chrome QA passed for the deployed empty-round surface. Connected-wallet interaction still needs a real browser wallet; Browser plugin and Playwright were unavailable, so no connector behavior was claimed as retested.
- The public repository is https://github.com/Alike001/netsettle and its `main` branch tracks `origin/main`. The public frontend is live at https://netsettle-alike001s-projects.vercel.app. Vercel built the Vite workspace successfully after `.vercelignore` excluded local research clones. Project-level Vercel SSO deployment protection was disabled because its login wall prevented unauthenticated judges from viewing the app. Hosted desktop and mobile empty-round renders passed; connected-wallet interaction still requires actual wallet evidence.
- The first real Sepolia round is live: Round #1 is in Funding and participant A (`0xdE67…7F71`) has confirmed collateral. The Activity panel is currently empty even though those events were emitted. A direct `eth_getLogs` request to the frontend's default PublicNode Sepolia endpoint returned HTTP 403; treat event-history retrieval as a production bug to fix before final evidence capture. Contract reads and write confirmations continue to work.
- README, `feedback.md`, and the demo-readiness/evidence checklist now exist. Their deployment fields are honestly marked pending rather than populated with local or mock data.

## Next actions (in order)

1. Continue Round #1: fund B and C, submit all six obligations, reload/retry during Nox computation, validate, finalize, and withdraw with transaction evidence.
2. Diagnose and fix the production activity-log RPC path, then retest it against Round #1 before recording final evidence.
3. Exercise the wrong-network, rejected-action, and refund paths, then replace every unchecked item in docs/demo-readiness.md with captured evidence, record the four-minute-or-shorter video, and prepare the tagged X post.

## Standing rules this project has earned

(Things learned the hard way — don't repeat the mistake)

- Never provide a private key or seed phrase in a form, chat, website, or project file; wallet verification only requires the public address.
- Use the same Ethereum Sepolia wallet for deployment and the Nox widget so the on-chain activity can be verified.
- The current Nox package requires Solidity 0.8.35 or newer; Remix 0.8.34 cannot compile its `^0.8.35` imports.
- The approved UI direction is Clearing Triangle in `design.doc.md`; do not substitute a generic SaaS layout or a dense matrix console.
- The accepted visual references are `assets/design/clearing-triangle-desktop.png` and `assets/design/clearing-triangle-mobile.png`; use them for fidelity QA, not as shipped UI.
- The participant completed the Nox Hello World registration requirement on 2026-07-30; do not repeat that onboarding work.
- UX is explicitly scored, but protocol depth and end-to-end reliability remain higher-priority than decorative polish.
- The submission must work end to end without mock data and must deploy on Ethereum Sepolia.
- Required submission artifacts include a public repo, functional frontend, setup/usage docs, `feedback.md`, a demo video no longer than four minutes, and the tagged X post.
- Reusing any previous VIBE project is disqualifying. DarkOdds is a prior winner; NoxLimit is a close current-project collision. Mechanics may inform original work, but neither may be forked/reskinned.
- Nox hides selected values, not wallet addresses, transaction timing, called functions, or all on-chain metadata. Never claim anonymity unless separately implemented and proven.
- Nox computation is asynchronous. Every product flow needs pending, polling, retry, reload, timeout, and recovery behavior.
- Operation results are transient by default; persist contract access with `Nox.allowThis` and grant viewer access deliberately.
- Prefer Nox safe arithmetic variants for financial logic and test overflow, underflow, and division boundaries.
- Pin and commit one tested dependency set: current packages have version drift across docs, starter, plugin, and beta Handle SDK releases.
- In this sandbox, run Hardhat with `XDG_CACHE_HOME=/home/ali/Desktop/wtf/.cache`; the normal home cache is read-only.
- The final settlement token is official Circle test USDC at `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`; it has 6 decimals and no financial value. Do not deploy a new mock token on Sepolia.
- The public production-default contract is NetSettle Sepolia 0x9f10b266F90638fC058e0891901082Fe9eccD8EA, deployed in block 11388543. It is linked by default in app/src/config.ts; only override it intentionally for a custom deployment.
- The pinned Ethereum Sepolia NoxCompute address is `0x24Ef36Ec5b626D7DCD09a98F3083c2758F0F77bF`, and the live preflight must pass before any deployment.
- The compute recovery window is 3,600 seconds. Changing it or the pinned token requires explicit review; do not override either at deployment time.
- Store `SEPOLIA_PRIVATE_KEY` only through Hardhat's interactive encrypted keystore. Never put it in shell history, a `.env`, documentation, Git, chat, or frontend variables.
- Never use `hardhat keystore get` to validate a wallet key. Use `npm run check:deployer`, which prints only the derived public address and Sepolia ETH balance and sends no transaction.
- Hardhat 3.12.0 HHE8 means `Invalid URL`. Store only the raw complete RPC URL as the keystore value—no `SEPOLIA_RPC_URL=` prefix, quotes, or surrounding spaces.
- In Hardhat tests, scope each Handle wallet client's `getAddresses()` result to its signing account. The SDK otherwise selects the first RPC account as the encryption owner and valid proofs from later accounts fail with `Owner mismatch`.
- Never weaken Nox owner/application proof checks to make a test pass. Fix the wallet adapter so encryption and transaction signatures identify the same account.
- The Handle SDK currently sends plaintext to the trusted Nox gateway over TLS for encryption. Never claim that current browser inputs are encrypted locally or that the gateway cannot see plaintext.
- NetSettle disables wagmi client-level Multicall batching because it has a small read set and the offline Hardhat fallback does not deploy Sepolia’s standard Multicall contract.
- Preserve the target protocol's authorization, replay, slippage/solvency, cancellation, and recovery invariants; privacy does not replace them.
- Use audited/deployed tagged releases of target protocols, not mutable `main` branches.
- Current collision checks found `danielamodu/Nox-safe`, a confidential Safe transaction guard, and `Xconmax245/Skia`, an Aave confidential-credit/liquidation project. Do not propose simple Safe guards or Aave credit/liquidation products.
- Generic private swaps, payroll, vaults, escrow, auctions, and selective-disclosure wrappers were treated as the obvious crowded answers and excluded from the Phase 2 shortlist.
