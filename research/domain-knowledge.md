# iExec Nox WTF Hackathon — Domain Knowledge

Research snapshot: **2026-07-30**
Phase: **1 — Research only**
Hackathon: **WTF Hackathon Summer Edition (Write The Future), iExec Nox**

This document separates three levels of confidence:

- **Verified** — stated by the organizer, official documentation, or source code that was fetched and read.
- **Inference** — a conclusion drawn from multiple verified observations; it is not an organizer promise.
- **Unknown** — not established by the accessible primary sources and must not be guessed.

The DoraHacks detail page is JavaScript/WAF protected in this environment. The full rules supplied by the participant are therefore treated as the primary hackathon text and cross-checked against the indexed [DoraHacks event page](https://dorahacks.io/hackathon/wtf-hackathon/detail), official iExec documentation, official repositories, and the prior event's public winner records.

## 1. Judging criteria and track rules

### Published scoring criteria

The organizer's published criteria are preserved below without inventing weights for the two unstarred items.

| Published criterion | Displayed weight | What it requires in practice |
|---|---:|---|
| Project creativity | ⭐⭐⭐ | The privacy use case and integration must be original, not a recycled VIBE submission or a generic app with encryption attached. |
| Accessible and works end to end without mock data | ⭐⭐⭐ | A judge must be able to use the real application and complete the real flow; mock chain/data paths cannot stand in for the product. |
| Deployed on Ethereum Sepolia | ⭐⭐ | The submitted build must use **ETH Sepolia**, even though Nox also has Arbitrum Sepolia material and earlier VIBE projects used it. |
| `feedback.md` in the public GitHub repository | ⭐⭐ | The repository must contain concrete feedback about the iExec tools. |
| Demo video no longer than four minutes | ⭐⭐ | The public submission video has a strict four-minute maximum. |
| Technical implementation | Unstated | Scored on how well the confidential DeFi project leverages the iExec Nox Protocol. |
| UX | Unstated | Scored on whether the application is user-friendly and intuitive. |

**Verified design decision:** **Yes, UX is explicitly a scored dimension.** Phase 3 should therefore do more than make the interface merely functional, while still preserving the AGENTS.md rule that protocol depth takes priority over decorative polish.

### Challenge definition

**Verified:** The challenge asks builders to take a real, impactful open-source protocol and add privacy, or merge it with something genuinely innovative using Nox. The integration should be clean enough to become a deployable product. The underlying public protocol should not need to be modified; privacy should be layered or batched around it while preserving composability.

The organizer's suggested target families are:

- wallets such as MetaMask, Rabby, and Rainbow;
- DeFi protocols such as Aave, Uniswap, and Curve;
- treasury/payment protocols such as Safe, Sablier, and Superfluid.

These are examples, not mandatory choices.

**Verified:** The broader qualitative framing says projects will be judged on:

1. how cleanly Nox integrates into the app or protocol;
2. the privacy the integration adds; and
3. how close the result is to something a company could deploy.

### Required deliverables and participation rules

- Public GitHub repository with complete, viewable, open-source code.
- Clear README installation and usage instructions.
- Comprehensive setup, deployment, and dApp usage documentation.
- Functional frontend.
- Real end-to-end behavior with no mock data.
- Deployment on Ethereum Sepolia.
- `feedback.md` about iExec tooling.
- Public demo video of at most four minutes.
- Public X post with a short description, demo video, working public GitHub link, and tag `@iEx_ec`.
- Original work and disclosure of pre-existing work when iExec tools are integrated into an existing project.
- Teams may contain up to five participants.
- Total prize pool: USD 1,500 — USD 750 / 500 / 250 for first / second / third.
- Participants must join the iExec Discord and the hackathon channel for support and announcements.
- **A project reused from the previous VIBE Coding Hackathon is disqualified.** Organizers say ideas may be validated with them in advance.

**Unknown:** The pasted event text does not expose an unambiguous closing timestamp and timezone. An indexed announcement says the 25-day challenge closes on August 1, but the exact cut-off should be read from the live DoraHacks countdown before planning submission. Do not infer midnight or a timezone.

**Potential source inconsistency:** The support paragraph refers to a dedicated “Vibe Coding Challenge” channel although this event is WTF. Treat the current WTF Discord channel and live announcements as authoritative.

### Evaluation map to retain for later phases

Every later feature should map to at least one row below. A feature that maps to none is lower priority.

| Dimension | Evidence a judge should be able to see |
|---|---|
| Creativity | A specific privacy failure in a real public protocol and a Nox-native mechanism that resolves it. |
| End-to-end, no mocks | Real wallet, real Sepolia transactions, real Nox handles/results, and the real target protocol or a real deployed integration boundary. |
| ETH Sepolia | Verified contract addresses, transaction links, and a reproducible deployment path. |
| Nox implementation | Encrypted inputs, confidential computation, correct ACL/persistence, and a clear explanation of what remains public. |
| Deployability | Failure recovery, replay protection, authorization, monitoring, tests, and usable setup documentation. |
| UX | Plain-language privacy boundaries, visible async progress/retry states, safe errors, and a short path through the core task. |
| Submission compliance | Public repo, README, documentation, `feedback.md`, video ≤4 minutes, and tagged X post. |

Primary sources: [WTF Hackathon on DoraHacks](https://dorahacks.io/hackathon/wtf-hackathon/detail), [iExec Nox developer resources](https://docs.iex.ec/nox-protocol/getting-started/welcome), [iExec Discord invitation](https://discord.gg/RXYHBJceMe).

## 2. Chain/protocol domain knowledge

### What Nox actually protects

**Verified:** Nox is a confidential-computing protocol based on off-chain Trusted Execution Environments, specifically Intel TDX in the current architecture. It is not an FHE execution environment. A normal Solidity contract requests operations over encrypted values; an off-chain runner decrypts and computes inside the TEE, then returns an encrypted result represented on-chain by a handle.

**Verified privacy boundary:** A handle is a 32-byte opaque pointer, not the ciphertext or plaintext. Ciphertext is stored off-chain through the Handle Gateway/object storage. The chain still exposes ordinary blockchain metadata, including contract addresses, caller addresses, transaction timing, called functions, and emitted public events. Nox can hide selected values such as amounts, balances, bids, thresholds, or results; it does **not** automatically provide wallet anonymity or hide interaction graphs.

This distinction must be explained honestly in the product. “Private amount” is defensible; “private transaction” or “anonymous user” is not unless another mechanism actually supplies those properties.

### End-to-end architecture

The fetched official architecture describes this sequence:

1. A client encrypts an input through the Handle SDK and Handle Gateway.
2. The Key Management Service protects the encryption material and creates a handle/proof bound to the intended owner and application.
3. The on-chain contract validates the external input with `Nox.fromExternal` and requests confidential operations through `NoxCompute`.
4. The on-chain request emits an event. An ingestor observes it and sends work through NATS.
5. A runner executes the requested operation inside an Intel TDX environment.
6. The encrypted result is stored off-chain and the on-chain result handle resolves when computation completes.
7. An authorized viewer can privately decrypt; a public result can be revealed only through the public-decryption proof flow.

**Product consequence:** computation is asynchronous. The transaction that requests a result may finish before that result is available. A production frontend needs explicit pending, polling, timeout, retry, already-completed, and recovery states. Treating an unresolved handle as a zero or an error would be incorrect.

Official sources read locally: [welcome](repos/official/documentation/src/getting-started/welcome.md), [Hello World](repos/official/documentation/src/getting-started/hello-world.md), and the [global architecture overview](repos/official/documentation/src/protocol/global-architecture-overview.md).

### Handles, access control, and persistence

The ACL vocabulary found in the official contracts and SDK is:

- **admin** — manages access;
- **viewer** — may decrypt the value privately;
- **transient** — temporary protocol/application access for the active computation;
- **public** — permits public decryption through the proof mechanism.

**Verified important behavior:** operation results are transient by default. If a contract needs to reuse a result later, it must persist access for itself with `Nox.allowThis`. If a person or service must decrypt, the application must explicitly add/allow that viewer. Missing ACL persistence is therefore a functional bug, not merely a UX issue.

`wrapAsPublicHandle` exists for public values, but those values are intentionally visible. It should not be presented as a privacy feature.

### Contract API and arithmetic safety

The current Solidity package exposes Nox operations over encrypted handles, including arithmetic, comparisons, conditionals, ACL operations, external-input conversion, and decryption workflows.

**Verified safety distinction in current source:** basic `Nox.add`, `Nox.sub`, and related low-level arithmetic can wrap on overflow or underflow. The package also provides safe operations such as `safeAdd`, `safeSub`, `safeMul`, and `safeDiv`, using confidential selection/revert-compatible patterns. Financial products should default to the safe variants and test boundary values.

Encrypted user inputs should be produced by the SDK's `encryptInput`, validated on-chain with `Nox.fromExternal`, and bound to the correct contract/application and owner. The application must still supply its own business-state guards—nonces, one-shot flags, expiries, cancellation rules, or state transitions—where replay or repeated execution would be harmful.

Official source read: [Nox Solidity SDK](repos/official/nox-protocol-contracts/contracts/sdk/Nox.sol), [NoxCompute interface](repos/official/nox-protocol-contracts/contracts/interfaces/INoxCompute.sol), [Handle SDK](repos/official/nox-handle-sdk/README.md).

### Networks and current deployment targets

The current official documentation contains configurations for:

| Network | Chain ID | Documented `NoxCompute` address |
|---|---:|---|
| Ethereum Sepolia | 11155111 | `0x24ef36ec5b626d7dcd09a98f3083c2758f0f77bf` |
| Arbitrum Sepolia | 421614 | `0xd464b198f06756a1d00be223634b85e0a731c229` |

**Hackathon override:** the WTF submission must be deployed on **Ethereum Sepolia**. Prior VIBE winners and some current repository examples use Arbitrum Sepolia; those addresses and deployment instructions must not be copied into this build.

### Current package snapshot and version risk

Versions observed in the fetched repositories on 2026-07-30:

| Component | Observed version / constraint | Practical note |
|---|---|---|
| `@iexec-nox/nox-protocol-contracts` | `0.2.4` | Contracts require Solidity `^0.8.35`; this caused the participant's Remix 0.8.34 parser error. |
| `@iexec-nox/handle` | `0.1.0-beta.13` | Beta SDK surface; pin the exact tested version. |
| Nox Hardhat plugin | repository package `0.2.0` | Current repo depends on an earlier Handle beta than the docs package. |
| Nox Hardhat starter | `1.0.0` | Uses contracts `^0.2.4`, confidential contracts `^0.2.0`, and a plugin beta dependency; verify the resolved lockfile rather than assuming all examples align. |
| Hardhat generation | `3.x` in current contract/starter setup | Reuse the official starter and plugin rather than assembling services from memory. |
| OpenZeppelin | `5.6.1` in current protocol-contract package | Pin and test with the package's actual compiler baseline. |

**Inference:** the documentation, starter, plugin, and SDK are moving at different beta/release cadences. The safest implementation policy is to copy the official starter's current structure, pin a single known-good dependency set, commit the lockfile, record exact versions in `feedback.md`, and run a clean-install test.

### Official starters and reusable infrastructure

The following official resources were cloned and read; they should be reused where relevant:

- [Nox documentation](https://github.com/iExec-Nox/documentation) — concepts, guides, network configuration, and Hello World.
- [Nox protocol contracts](https://github.com/iExec-Nox/nox-protocol-contracts) — Solidity interfaces and SDK.
- [Nox Handle SDK](https://github.com/iExec-Nox/nox-handle-sdk) — Viem/Ethers client creation, encryption, private/public decryption, and ACL inspection.
- [Nox Hardhat plugin](https://github.com/iExec-Nox/nox-hardhat-plugin) — local Nox services and Hardhat integration; its local flow uses Docker.
- [Nox Hardhat starter](https://github.com/iExec-Nox/nox-hardhat-starter) — official contract/test layout with piggy-bank, auction, and token integration tests.
- [Nox product POC](https://github.com/iExec-Nox/nox-product-poc) — cToken/cVault examples and frontend handling of asynchronous computations.
- [Nox Observer](https://github.com/iExec-Nox/nox-observer) — Rust/Postgres service exposing health, metrics, unresolved handle counts, and grace-period behavior.
- [Nox Subgraph](https://github.com/iExec-Nox/nox-subgraph) — indexing for ACL, arithmetic, and confidential-token operation events.
- [Nox Attestation Portal](https://github.com/iExec-Nox/nox-attestation-portal) — a six-stage TDX quote verification flow: DCAP signature, challenge freshness, RTMR values, RTMR3 replay check, OS image hash, and Compose hash. Its repository states a proprietary license, so it is a reference, not an automatically reusable OSS dependency.

The official product POC contains real engineering patterns worth retaining: explicit operation state machines, polling/retry, invariant checks, integration tests, and real testnet traces. It also calls cToken a demo, while the broader docs use “production-ready” language. The current public infrastructure is testnet-focused and the Handle SDK remains beta, so a hackathon README must not imply audited mainnet readiness.

### Verification and test requirements earned from the protocol scan

For any later chosen build, the minimum Nox-specific QA should include:

- wrong owner and wrong contract/application input proofs;
- reused or stale external inputs where business logic demands one-shot behavior;
- unauthorized decryption and authorized selective disclosure;
- result ACL persistence across a second operation;
- unresolved/pending result, delayed result, timeout, retry, and reload recovery;
- safe arithmetic boundary cases and division-by-zero behavior;
- cancellation/expiry after confidential work has been requested;
- real Ethereum Sepolia deployment and transaction evidence;
- a clear display of which fields remain publicly observable.

### Documentation-access note

The required Context7 resolution identified `/iexec-nox/documentation`, but all three scoped documentation queries failed at the network layer. The research therefore fell back to the official GitHub repositories and read their raw Markdown, Solidity, TypeScript, Rust, configuration, and test files. No API shape in this section was inferred only from a URL title.

## 3. What's trending, and where real problems surface

### Sponsor and ecosystem direction in 2026

The strongest current signal is iExec's own [2026 Privacy Roadmap](https://www.iex.ec/news/2026-privacy-roadmap): the organization is concentrating on confidential DeFi and RWA composability, interoperability, auditability, and a production-grade TDX chain of trust. The roadmap and ecosystem material name active relationships or explorations with Aethir, AR.IO/Arweave, ChainGPT, DeXe, Otomato, and ApeBond, and point to privacy-focused builder activity at ETHRome, ETHGlobal Buenos Aires, and Hack4Privacy.

The [iExec Ecosystem Fund](https://www.iex.ec/ecosystem-fund) and roadmap describe a 1,000,000 RLC funding allocation across AI, DeFi, RWA, and the privacy stack, with both dilutive and non-dilutive support. Selection language emphasizes technical foundation, market potential, fit with iExec verticals, and EVM compatibility.

The official [Confidential Token article](https://www.iex.ec/academy/confidential-token-by-iexec) describes cToken as a 2026 demo on Arbitrum Sepolia that wraps ERC-20s with encrypted balances, transfers, and selective disclosure; it also says a mainnet protocol is planned later. This reinforces a sponsor thesis of **controlled disclosure for financial workflows**, not blanket anonymity.

**Inference:** Judges are likely to distinguish between “an encrypted value exists” and a complete confidential workflow that remains composable with an unchanged public protocol and can explain its trust/attestation boundary.

### Current WTF repository landscape

A GitHub repository search snapshot on 2026-07-30 found **105 public repositories** matching recent iExec/Nox terms, with the first 100 inspected. This is a lower-bound landscape scan, not proof that every repository is an eligible submission. Many repositories had no description, so keyword categories undercount ambiguous projects.

Approximate overlaps among the first 100 inspected results:

| Lane | Repositories with matching names/descriptions |
|---|---:|
| Payments / escrow | 21 |
| Safe / treasury | 20 |
| Swaps / trading | 15 |
| Payroll / streaming | 13 |
| Vault / yield / lending | 6 |
| Decisions / governance | 3 |
| Prediction markets | 2 |
| Explicit RWA label | 1 |

Examples included confidential Aave credit/liquidation, Safe treasury movement, swap shielding, confidential limit orders, Curve batch auctions, quadratic funding, payroll, Aave vaults, Uniswap routing, and private procurement.

**Inference:** The organizer's suggested categories are already crowded. A project cannot rely on “private swap,” “private payroll,” “private Safe,” or “selective disclosure” as its entire originality claim. The specific failure mode, integration boundary, recovery behavior, and deployable user need must be sharper.

Collision checks to retain:

- [DarkOdds](https://github.com/winsznx/darkodds) already won the prior VIBE event with encrypted bet sizes and confidential payout computation. Reusing that project is disallowed.
- [NoxLimit](https://github.com/Blockchain-Oracle/NoxLimit) is a current ETH Sepolia confidential limit-order integration for prediction-market FPMMs with real testnet evidence. A substantially similar product would be a current-event collision even though it is not a past winner.

Search source: [current GitHub repository search](https://github.com/search?q=iexec+nox+created%3A%3E%3D2026-07-01&type=repositories).

### Direct pain-point signals

Public discussion searches produced these recurring problems:

- **Public strategy leakage and MEV:** DeFi users and agent builders discuss positions, orders, and routing intentions being visible before settlement; solver/batch systems such as CoW-style auctions are discussed as ways to reduce harmful ordering and reveal less intent.
- **Opaque automation is not automatically trustworthy:** Agent/solver discussions pair privacy concerns with the need to prove fair execution. Hiding inputs without a deterministic settlement rule or verifiable outcome merely moves trust off-chain.
- **On-chain identity can create a doxxing graph:** KYC/attestation discussions object to globally visible attributes and linkage; revocation, scope, and selective proof are part of the real problem.
- **Wallet authorization remains unsafe:** Blind signing, broad permissions, origin confusion, and replay are recurring wallet-security complaints. Confidentiality must not weaken explicit authorization.
- **Generic payroll is not validated merely by adding privacy:** A stablecoin gig-economy discussion emphasized taxes, regulation, payroll compliance, liquidity, and off-ramping as harder blockers than the transfer rail itself. This weakens a generic “private payroll” thesis unless it targets a more precise deployable pain.

The r/hackathon and r/sideproject searches yielded mostly event announcements and general hackathon discussion rather than strong Nox-specific user demand. That is recorded as **weak signal**, not converted into a pain-point claim.

Representative search surfaces: [r/defi privacy search](https://www.reddit.com/r/defi/search/?q=privacy&restrict_sr=1&sort=new), [r/defi MEV search](https://www.reddit.com/r/defi/search/?q=MEV&restrict_sr=1&sort=new), [r/hackathon search](https://www.reddit.com/r/hackathon/search/?q=blockchain%20privacy&restrict_sr=1&sort=new), [r/SideProject search](https://www.reddit.com/r/SideProject/search/?q=web3%20privacy&restrict_sr=1&sort=new).

### X, Product Hunt, and Google Trends checks

- **X:** Indexed search for current iExec/Nox posts was sparse. The official roadmap links to iExec's Aethir, AR.IO, ChainGPT, and DeXe announcements, so those first-party links are more reliable than inferring demand from search-result counts. No unverified “judge hint” is recorded.
- **Product Hunt:** Adjacent popular launches emphasize wallet safety/onboarding and business-payment friction—examples surfaced around scam protection, simpler wallet UX, and off-ramping. Search did not provide strong evidence of demand for Nox-style confidential smart-contract infrastructure itself. **Inference:** the product-facing explanation must start from the user's financial or operational risk, not the TEE.
- **Google Trends:** Indexed results exposed generic crypto/privacy terms but not a reliable current comparison series for “confidential computing,” “MEV protection,” and Nox. The check was inconclusive and is not used as evidence that a keyword is growing.

Search surfaces: [Product Hunt wallet security search](https://www.producthunt.com/search?q=wallet%20security), [Product Hunt stablecoin payments search](https://www.producthunt.com/search?q=stablecoin%20payments), [Google Trends exploration](https://trends.google.com/trends/explore).

### Data availability

No idea has been selected in Phase 1, so no external dataset has been chosen. For a protocol integration, the strongest non-mock evidence is likely real Ethereum Sepolia contract state, Nox operation state, and target-protocol transactions rather than a synthetic dataset.

If Phase 2 produces an idea that makes a score, judgment, anomaly verdict, or recommendation, a relevant public dataset must then be located and the verdict rule made deterministic and rerunnable. Data.gov/Kaggle should not be searched merely to decorate a product that does not need outside data.

## 4. Past winners (this hackathon or similar ones on this chain)

The closest verified precedent is the prior iExec **VIBE Coding Hackathon**. Its three winners were cloned and their repositories, architecture/security notes, contracts, tests, and UI/setup material were read. Official winner list: [VIBE winners on DoraHacks](https://dorahacks.io/hackathon/vibe-coding-iexec/winner).

### 1st — Diam

- Project: [DoraHacks entry](https://dorahacks.io/buidl/43636), [GitHub](https://github.com/PugarHuda/diam)
- What it built: confidential OTC/RFQ settlement with hidden amounts, sealed Vickrey bidding, ERC-7984-style confidential assets, and agent/MCP interaction paths.
- Why it likely won: the product starts from a recognizable financial failure—OTC size and bidder intent leak on public chains—and makes confidential computation central to settlement. It had a broad live flow and real testnet work rather than a static privacy claim.
- What could improve: its scope is very wide, setup requires several external pieces, and its own security notes identify a maker-selected winning bidder because encrypted addresses cannot be indexed/compared directly. Some receipt/mint guarantees rely partly on UI/event workflow and economic honesty rather than a completely enforced on-chain mechanism.
- Lesson, not a template: judges rewarded a concrete market workflow and deep Nox usage, but breadth and off-chain trust gaps should not be copied.

### 2nd — RWAOS

- Project: [DoraHacks entry](https://dorahacks.io/buidl/43431), [GitHub](https://github.com/pandu926/rwaOS-mvp)
- What it built: a confidential RWA operating system covering issuance, transfers, private cap tables/balances, selective disclosure, tenant bundles, audit anchors, and settlement controls.
- Why it likely won: it presented an institution-oriented architecture and a comprehensive multi-role product rather than a single isolated contract call.
- What could improve: it is extremely broad. Local tests include a mock controller token and the code contains a localhost path that directly wraps handles. The settlement vault comments state that equality between a public transfer amount and its encrypted amount is enforced by product flow pending a proof circuit, leaving a trust gap.
- Lesson, not a template: architecture and operational completeness matter, but “wide dashboard” does not equal production assurance and RWA/legal dependencies are rejected by this project's feasibility rules.

### 3rd — DarkOdds

- Project: [DoraHacks entry](https://dorahacks.io/buidl/43656), [GitHub](https://github.com/winsznx/darkodds)
- What it built: public odds/outcomes with encrypted bet sizes, proportional payout computed by Nox, and selective-disclosure receipts. Its repository reports 45/45 verifier tests and real Arbitrum Sepolia runs.
- Why it likely won: it delivered an understandable end-to-end confidential financial flow, real contracts, strong QA evidence, and a visually demonstrable before/after privacy story.
- What could improve: the surface is broad; judging used temporary EOA ownership; resolution includes admin/pre-resolved paths because Chainlink was unavailable on Arbitrum Sepolia; the repository notes dust/minimum-bet and indexing limitations.
- Disqualification guardrail: this is a prior VIBE project. It must not be reused, forked, or lightly reskinned for WTF.

### Winner pattern and split

| Pattern | Observation |
|---|---|
| Consumer/protocol applications | 3 of 3 winners |
| Pure infrastructure/tooling | 0 of 3 winners |
| Confidential financial state | 3 of 3 winners |
| Selective disclosure | 3 of 3 winners |
| Live testnet evidence | Present across the winning submissions |

Diam includes agent/MCP tooling, but its winning product is still an OTC application. This means infrastructure is underrepresented among prior winners, not that judges reject it.

**Inference:** What judges rewarded was not encryption alone. Each winner attached hidden financial state to an understandable transaction lifecycle and supplied enough live behavior to demonstrate that Nox was indispensable. Conversely, the repositories show that a prize result is not proof of audit-level production readiness.

### Broader exact-protocol scan

The current WTF scan shows many submissions converge on the organizer examples: private Safe operations, swaps, vaults, payroll, escrow, lending, and prediction markets. This makes two originality checks mandatory before committing in Phase 2:

1. search the current public repository cohort again using the exact proposed mechanism and target protocol;
2. ask the organizer in Discord to validate the concept if it is adjacent to a current or prior entry.

## 5. Reference builders — deep scan for alignment with THIS protocol

Five required profiles were scanned through their public repositories. Closest relevant projects were cloned and read. The useful output is mechanics and risk patterns, not reusable product surfaces.

### winsznx

Profile: [github.com/winsznx](https://github.com/winsznx)

Aligned projects:

- [DarkOdds](https://github.com/winsznx/darkodds) — exact prior iExec Nox VIBE winner; encrypted wager sizes, confidential payout computation, selective-disclosure receipts, testnet verification.
- `vellum` — a Zama FHE structured-notes project using confidential token mechanics, lifecycle/security documentation, and adversarial testing.

Adaptable mechanics:

- keep public market facts separate from genuinely confidential user state;
- design disclosure as a scoped user action rather than a blanket reveal;
- publish an explicit security/adversarial model and real-verifier matrix.

Missing or improvable for WTF:

- DarkOdds has known admin/oracle and scope limitations and is an exact disqualification risk;
- FHE-specific ERC-7984 patterns cannot be assumed to map directly to Nox's asynchronous TEE/handle model;
- a new build needs a different user problem, target protocol, and settlement mechanism.

**Guardrail:** no DarkOdds fork, surface adaptation, prediction-market reskin, or “same flow with one extra feature.” Any borrowed principle must be substantially reinterpreted.

### Timidan

Profile: [github.com/Timidan](https://github.com/Timidan)

Aligned project:

- `nyx` — sealed-bid batch-auction architecture with an on-chain auction, matcher/agent, policy logic, and tests.

Adaptable mechanics:

- collect intent during a bounded round, then settle once through a deterministic clearing step;
- isolate the matcher/policy layer from asset settlement;
- test order independence, round transitions, invalid bids, and finalization.

Missing or improvable for WTF:

- it is not a Nox implementation;
- the frontend contains `mockChain.ts`, which is incompatible with WTF's “end to end without mock data” criterion;
- a Nox version would need real handle lifecycle, ACL, asynchronous completion, and real ETH Sepolia integration.

**Guardrail:** adapt only the batch/round mechanics. Do not reuse its UI, matcher implementation, branding, or mock path.

### Blockchain-Oracle

Profile: [github.com/Blockchain-Oracle](https://github.com/Blockchain-Oracle)

Aligned project:

- [NoxLimit](https://github.com/Blockchain-Oracle/NoxLimit) — a current WTF-era ETH Sepolia confidential limit-order integration for Gnosis/FPMM prediction markets. The repo includes local tests and a recorded live Gate C trace, hard binding to a real market contract, private candidate evaluation, public proof finalization, one-shot settlement, cancellation/expiry/refund, and gas budgets.

Adaptable mechanics:

- bind confidential intent to the exact target contract and market parameters;
- make finalization one-shot and independently verifiable;
- treat cancel, expire, refund, and failed-finalization paths as core product behavior;
- separate private eligibility computation from public settlement proof.

Missing or improvable for WTF:

- it is already a close current-event implementation, so the limit-order/prediction-market surface is collision territory;
- its worker/service trust and liveness model should be explained and monitored as explicitly as the contracts;
- any different build still needs its own target-protocol invariants and threat model.

**Guardrail:** avoid the same user story and target. NoxLimit is evidence of the quality bar, not a base repository.

### mrnetwork0001

Profile: [github.com/mrnetwork0001](https://github.com/mrnetwork0001)

Aligned project:

- `VeilPay` — a Zama FHE confidential salary-matching/hiring workflow with encrypted threshold matching and a user-facing confidential process.

Adaptable mechanics:

- compare private values and disclose only the match/no-match result;
- make the disclosure boundary understandable to non-technical users;
- keep confidential comparison logic deterministic.

Missing or improvable for WTF:

- it does not use Nox and therefore lacks handle ACL/persistence and asynchronous runner behavior;
- salary/hiring can introduce employment, discrimination, and compliance concerns beyond a hackathon's trustworthy product scope;
- payroll is already a crowded WTF lane and direct user research suggests transfer privacy is not its only serious blocker.

**Guardrail:** threshold comparison is a mechanic, not permission to recreate the product.

### Enoch208

Profile: [github.com/Enoch208](https://github.com/Enoch208)

Aligned project:

- `Clasp` — scoped and revocable wallet sessions with explicit permission vocabulary, origin binding, replay protection, timestamp freshness, per-session/payment caps, atomic reserve/settle/refund, delegation attenuation, and cascading revocation. It distinguishes real testnet behavior from a fake gateway in its documentation.

Adaptable mechanics:

- permissions should state exactly what an app may do and what is never exposed;
- bind authorization to origin, scope, value caps, and fresh nonces;
- reserve before async work and settle/refund atomically;
- design revocation and recovery before convenience flows.

Missing or improvable for WTF:

- Clasp is Fiber-specific, not Nox;
- confidential values would add asynchronous and ACL failure states that its session model does not solve automatically;
- a wallet integration must use a real existing wallet boundary and Sepolia deployment, not merely imitate a wallet UI.

**Guardrail:** the permission/recovery model is valuable; the implementation and product surface remain the builder's work.

### Cross-builder conclusion

The recurring professional mechanics are deterministic settlement, strict binding of authorization to context, replay protection, explicit cancellation/refund, adversarial tests, and honest documentation of mock versus real paths. Nox adds another axis—handle ACL and async computation—that none of the non-Nox projects solves automatically.

Originality test for Phase 2: if a proposed direction can be described as “one of these projects, but on Nox,” reject it. It must start from a distinct Nox-specific integration problem and substantially reinterpret any mechanism borrowed from the scan.

## 6. Existing production tools in this ecosystem

No mature third-party Nox mainnet product was verified: current Nox materials are testnet-focused and the official cToken is described as a demo. To establish a professional benchmark, three popular open-source protocols explicitly named by the WTF organizer were cloned and their current main branches, core contracts, security docs, tests, and packaging were read.

Local clones are under `research/repos/production/`.

### Safe Smart Account

- Repository: [safe-global/safe-smart-account](https://github.com/safe-global/safe-smart-account)
- Snapshot read: main commit `77901a5a1ad835b74ad3b72f73a8412cfe491c57` (2026-06-05); README identifies audited release `v1.5.0` at a separate pinned commit.
- Professional structure observed:
  - EIP-712 transaction hashes bind chain ID and Safe address;
  - a nonce provides replay protection;
  - owners and a threshold authorize execution;
  - modules extend write capability, transaction/module guards add pre/post checks, and fallback handlers isolate storage with `CALL`;
  - deterministic deployments and local on-chain bytecode verification are documented;
  - release-specific audits, formal-verification specifications, migration tests, integration tests, and security warnings are in-repo.
- Integration lesson: Safe modules have unlimited execution power and a bad guard can permanently deny service. A Nox integration cannot ask a treasury to install a powerful extension without a recovery path, least privilege, exact release pin, and an explanation of new liveness/trust assumptions.
- Product-quality lesson: Safe explicitly warns that `main` is under development and tells integrators to use an audited tagged commit. “Official repo” is not sufficient dependency control.

Code read: [overview](repos/production/safe-smart-account/docs/overview.md), [Safe.sol](repos/production/safe-smart-account/contracts/Safe.sol), [ModuleManager.sol](repos/production/safe-smart-account/contracts/base/ModuleManager.sol), [GuardManager.sol](repos/production/safe-smart-account/contracts/base/GuardManager.sol), tests and Certora specifications.

### Uniswap v4 Periphery

- Repository: [Uniswap/v4-periphery](https://github.com/Uniswap/v4-periphery)
- Snapshot read: main commit `3245c3cb99c48fa1dc2459c3b60abc37d4294aba` (2026-07-13).
- Professional structure observed:
  - core pool logic is separated from periphery integration logic;
  - routers decode ordered action/parameter bundles and reject length mismatches or unsupported actions;
  - exact-input paths enforce minimum output and exact-output paths enforce maximum input;
  - current code can enforce minimum prices per hop, reducing hidden adverse execution inside a multi-hop route;
  - settlement/take operations distinguish debt and credit, payer and recipient mapping, and open deltas;
  - Permit2/EIP-712 and unordered nonces support scoped authorization and replay protection;
  - the repository includes fuzz, invariant, gas, fork, reentrancy, slippage, callback, permit, and hook tests plus audit reports.
- Integration lesson: hiding swap intent is not enough. Final execution must still be bounded by public/verifiable slippage, token direction, route/market binding, nonce, deadline, and recipient controls. Hooks and callbacks widen the attack surface and require hostile-token/reentrancy testing.
- Product-quality lesson: the README calls the periphery branch under development. Use deployed, documented addresses and pinned artifacts where a real integration requires them; do not deploy an arbitrary mutable main snapshot and call it the protocol.

Code read: [README](repos/production/uniswap-v4-periphery/README.md), [V4Router.sol](repos/production/uniswap-v4-periphery/src/V4Router.sol), [BaseActionsRouter.sol](repos/production/uniswap-v4-periphery/src/base/BaseActionsRouter.sol), [SlippageCheck.sol](repos/production/uniswap-v4-periphery/src/libraries/SlippageCheck.sol), router/nonce/fuzz tests and audits.

### Sablier Flow

- Repository: [sablier-labs/evm-monorepo](https://github.com/sablier-labs/evm-monorepo), `flow/` package
- Snapshot read: main commit `7c93837621cdf8f7db2ff67c9b8a64a98d7ed9b6` (2026-07-30); Flow package `v3.0.1`.
- Professional structure observed:
  - an open-ended stream is debt tracking: `amount owed = rate per second × elapsed time`;
  - covered debt, uncovered debt, refundable balance, and depletion time are separate concepts;
  - the lifecycle includes create/deposit, rate adjustment, pause/restart, refund, withdraw, and irreversible void;
  - the contract rejects delegate-call execution on state-changing entry points and uses precise role/recipient requirements;
  - stream state is represented by an ERC-721 ownership surface;
  - the repository contains concrete, fuzz, invariant, fork-token, batch, fee, and recovery tests, documented audits, reproducible packages, and deployment references;
  - the source is kept byte-for-byte verifiable against deployments, even refusing comment-only pull requests on main.
- Integration lesson: concealing a stream's amount or rate cannot erase solvency. A confidential layer needs deterministic definitions for what may be withdrawn/refunded, how underfunding is exposed or handled, and what happens on pause/void while a Nox result is pending.
- Product-quality lesson: operational states and recoverability are first-class. A single “start private stream” button without pause, refund, depletion, reload, and failure behavior would fall far below the target protocol's standard.

Code read: [Flow README](repos/production/sablier-evm-monorepo/flow/README.md), [SablierFlow.sol](repos/production/sablier-evm-monorepo/flow/src/SablierFlow.sol), [ISablierFlow.sol](repos/production/sablier-evm-monorepo/flow/src/interfaces/ISablierFlow.sol), concrete/fuzz/invariant/fork tests.

### Professional benchmark distilled

A credible WTF integration should match the underlying production tool's habits:

1. pin a deployed/audited target version rather than mutable `main`;
2. preserve the target protocol's existing authorization, slippage/solvency, and replay invariants;
3. add Nox without modifying the target protocol or pretending public metadata is private;
4. define every state transition, including pending, cancellation, expiry, failure, refund, reload, and retry;
5. test hostile and boundary cases as well as the happy path;
6. expose contract addresses, transactions, exact dependency versions, and deterministic reproduction steps;
7. document the new TEE, gateway, runner, ACL, and liveness assumptions introduced by confidentiality.

That is the standard implied by “product, not demo.” It is also the clearest gap between the hackathon's minimum deliverables and a protocol integration a company could plausibly evaluate for deployment.
