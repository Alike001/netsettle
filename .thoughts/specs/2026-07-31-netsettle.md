# Spec: NetSettle

## Objective

Build a real Ethereum Sepolia product in which exactly three participants submit six confidential bilateral payment obligations, iExec Nox computes the net position of each participant, and only the final pay/receive positions become public and settle through one real ERC-20 contract.

The 10-second story is: **Many private obligations become a few verifiable settlements without publishing the underlying payment amounts.**

## Background And Current Reality

Public EVM transactions expose amounts, addresses, timing, called functions, and events. Nox can protect selected values through encrypted handles and confidential TEE computation, but it does not make participant addresses or final settlement transactions anonymous.

Multilateral netting is a real payment-infrastructure mechanism: it reduces many obligations to one net position per participant and reduces the number and value of payments required for settlement. Current public WTF submissions are crowded around generic private payments, payroll, swaps, escrow, and vaults, but the Phase 1 scan found no direct current Nox multilateral-netting collision.

Nox computation is asynchronous. Results are transient by default unless contract access is persisted, and financial arithmetic must use safe variants. The product must therefore treat pending computation, ACL persistence, validation, finalization, expiry, and refunds as core behavior.

## Users

- A round creator who selects the three participant wallets and opens a settlement round.
- Three wallet users who pre-fund collateral and confidentially submit what they owe the other two participants.
- Any caller who finalizes a valid round after Nox computation completes.

## Goals

- Keep all six bilateral obligation amounts confidential.
- Make the participant roster and final net positions explicit and verifiable.
- Settle with a real pinned ERC-20 on Ethereum Sepolia without mock balances or mock chain data.
- Guarantee conservation: total net payments equal total net receipts.
- Guarantee settlement funding through equal pre-funded collateral.
- Provide deterministic failure and refund paths.
- Make Nox's asynchronous state understandable and recoverable after a reload.

## Non-goals

- Supporting any participant count other than three.
- Supporting multiple tokens, cross-chain settlement, subscriptions, or recurring rounds.
- Hiding participant wallet addresses, round timing, contract calls, or final net withdrawals.
- Invoice documents, descriptions, attachments, disputes, or legal enforcement of obligations.
- Organizations, roles, team administration, credit, lending, or reputation.
- Safe, Sablier, Superfluid, Permit2, accounting-system, API, or SDK integrations.
- Selective auditor disclosure of individual obligations in the first product.
- Claims of anonymity, audit completion, mainnet readiness, or production custody readiness.

## Requirements

### Round definition

- A round has exactly three distinct, non-zero participant addresses.
- A round uses one pinned, real Ethereum Sepolia ERC-20.
- A round defines one equal public collateral cap and one submission deadline.
- The creator may be a participant but does not receive special settlement power.

### Funding

- Only listed participants may fund the round.
- Each participant deposits the same collateral cap.
- Duplicate funding is rejected.
- Confidential computation cannot begin until all three deposits exist.

### Confidential obligation submission

- Each participant submits exactly two encrypted amounts, one position for each other participant.
- Encrypted zero must be submitted when no obligation exists, so calldata shape does not reveal whether a bilateral obligation is present.
- External inputs are bound to the correct participant and NetSettle round/contract.
- Duplicate submissions, wrong-owner proofs, wrong-contract proofs, and late submissions are rejected.
- Individual obligation handles are not publicly decryptable and are not emitted as plaintext.

### Validation and computation

- Nox validates that each participant's outgoing total does not exceed the collateral cap.
- Nox calculates confidential incoming and outgoing totals for all three participants.
- Nox derives each participant's non-negative `netPay` and `netReceive` using safe arithmetic and confidential comparisons/selections.
- The contract persists every result handle required for later computation or finalization.
- Only final net positions may enter the public-decryption flow.
- If any outgoing total exceeds collateral, the round fails without partial settlement and all participants become refundable.

### Finalization and withdrawal

- Finalization is permissionless after all submissions are valid and all required Nox results have resolved.
- Each participant's withdrawal entitlement is `collateral - netPay + netReceive`.
- The sum of all withdrawal entitlements equals the contract's funded token balance.
- Each participant can withdraw once; duplicate withdrawal is rejected.
- Public events describe round status and final net positions but never plaintext bilateral obligations.

### Expiry and recovery

- If funding or submission is incomplete at the deadline, funded participants can reclaim their full collateral.
- No participant can unilaterally cancel after valid confidential computation begins.
- A reload reconstructs round state from real on-chain and Nox state.
- The UI distinguishes awaiting funding, awaiting submissions, validating, computing, ready to finalize, finalized, failed/refundable, expired, and withdrawn.
- A delayed or unresolved handle is shown as pending and can be polled/retried without resubmitting the financial action.

### Product surface

- A judge can create or open a round, connect one of the three wallets, fund, encrypt/submit obligations, observe state, finalize, and withdraw.
- The UI states what is private and what remains public before a user submits.
- Contract addresses, transaction links, token, chain, and current round status are visible.

## Acceptance Criteria

- Three real wallets complete a full Ethereum Sepolia round using real encrypted Nox inputs and a real ERC-20.
- Six entered obligation amounts never appear in plaintext calldata, contract storage, events, logs, or frontend persistence.
- A non-participant cannot fund or submit.
- A participant cannot fund, submit, or withdraw twice.
- Inputs bound to the wrong owner or contract fail.
- Unauthorized users cannot privately decrypt obligation handles.
- An outgoing total equal to collateral succeeds; a total greater than collateral produces a safe refundable failure.
- Nox results remain usable after the originating transaction and page reload.
- Public final net positions match a separately rerunnable deterministic netting calculation.
- `sum(netPay) == sum(netReceive)` for all successful rounds.
- `sum(withdrawalEntitlements) == totalFundedCollateral` for all successful rounds.
- Incomplete rounds expire and return every funded participant's full collateral.
- Delayed computation, failed computation, reload, and retry states are tested.
- The public README provides a 30-second explanation and reproducible installation, deployment, and usage instructions.
- The repository includes unit, edge-case, local Nox integration, and real Sepolia end-to-end evidence with no mock data presented as product behavior.

## Constraints

- Hackathon deployment target is Ethereum Sepolia.
- Current Nox contracts require Solidity `^0.8.35`.
- Dependency versions must be pinned and the lockfile committed because the docs, starter, plugin, and beta Handle SDK have version drift.
- Nox is TEE-based and asynchronous; it is not FHE and does not hide normal blockchain metadata.
- UX is an explicit judging dimension.
- Required submission artifacts include a public repository, functional frontend, README/setup documentation, `feedback.md`, a demo video of at most four minutes, and a tagged X post.
- Previous VIBE projects cannot be reused.
- The workspace is not currently a Git repository, so no rollback commit can be created until the correct repository root exists or Git is initialized.

## Stories Needed

- Creator defines a valid three-party settlement round.
- Participant funds and submits two encrypted obligations.
- Observer understands private versus public data.
- Any caller finalizes a valid computed round.
- Participant withdraws the correct final entitlement.
- Funded participant recovers collateral from an expired or invalid round.
- Developer verifies privacy, authorization, conservation, and async recovery invariants.

## Open Questions

- Which existing Sepolia ERC-20 has the most reliable faucet and official deployment for the final pinned token?
- Does the current public Nox deployment support every required safe comparison/selection operation at the pinned package versions, or should the net calculation use a smaller equivalent operation graph?
- What exact liveness timeout should distinguish a still-pending Nox result from a failed/refundable round?
- Should the first deployed contract support one round per contract or multiple three-party rounds while preserving the same product surface?

## Source References

- `research/domain-knowledge.md`
- iExec Nox documentation: https://docs.iex.ec/nox-protocol/getting-started/welcome
- Nox protocol contracts: https://github.com/iExec-Nox/nox-protocol-contracts
- Nox Handle SDK: https://github.com/iExec-Nox/nox-handle-sdk
- Nox Hardhat starter: https://github.com/iExec-Nox/nox-hardhat-starter
- BIS final report on payment-versus-payment and netting: https://www.bis.org/cpmi/publ/d216.pdf
- WTF Hackathon detail page: https://dorahacks.io/hackathon/wtf-hackathon/detail
