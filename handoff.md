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
- The exact DoraHacks submission closing timestamp and timezone were not exposed by the accessible page. An indexed announcement says August 1, but the live DoraHacks countdown/Discord announcement must be checked before submission.
- ETH Sepolia deployment and evidence are still pending; a funded deployment wallet and current Nox Sepolia addresses/RPC configuration are required before that gate can pass.

## Next actions (in order)

1. Build the approved Clearing Triangle frontend only against real contract/Nox state and test reload, retry, wrong-network, rejected wallet actions, responsive layout, and accessibility.
2. Deploy and exercise the full path on ETH Sepolia, then capture addresses, transaction evidence, and any remaining test gaps.
3. Finish README, `feedback.md`, demo-day fallbacks, submission assets, and the four-minute video.

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
- In Hardhat tests, scope each Handle wallet client's `getAddresses()` result to its signing account. The SDK otherwise selects the first RPC account as the encryption owner and valid proofs from later accounts fail with `Owner mismatch`.
- Never weaken Nox owner/application proof checks to make a test pass. Fix the wallet adapter so encryption and transaction signatures identify the same account.
- Preserve the target protocol's authorization, replay, slippage/solvency, cancellation, and recovery invariants; privacy does not replace them.
- Use audited/deployed tagged releases of target protocols, not mutable `main` branches.
- Current collision checks found `danielamodu/Nox-safe`, a confidential Safe transaction guard, and `Xconmax245/Skia`, an Aave confidential-credit/liquidation project. Do not propose simple Safe guards or Aave credit/liquidation products.
- Generic private swaps, payroll, vaults, escrow, auctions, and selective-disclosure wrappers were treated as the obvious crowded answers and excluded from the Phase 2 shortlist.
