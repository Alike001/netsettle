# Demo Readiness

This file tracks evidence. An unchecked item must not be described as complete.

## 90-second proof

1. Open a real three-wallet Sepolia round and identify the public participants, test USDC collateral, and six encrypted routes.
2. Connect the remaining participant, fund the exact collateral, and submit two obligations through Nox.
3. Reload while computation is pending to prove that the lifecycle comes from chain state.
4. Retrieve the public safety and net-position proofs.
5. Show the core moment: six hidden obligations become three public net positions and `sum(pay) = sum(receive)`.
6. Withdraw once and show the exact onchain entitlement.

## Evidence still required

- [ ] Public NetSettle Sepolia address and deployment transaction
- [ ] Public deployment block configured in the frontend
- [ ] Three participant wallets funded with Sepolia ETH and Circle test USDC
- [ ] Successful six-obligation round and transaction links
- [ ] Reload and retry during an asynchronous state
- [ ] Wrong-network recovery
- [ ] Rejected non-participant or rejected duplicate action
- [ ] Expired or invalid round refund evidence
- [ ] Hosted frontend URL tested in a fresh browser
- [ ] Final desktop and mobile screenshots from the hosted Sepolia app
- [ ] Four-minute-or-shorter recorded demo
- [ ] Local copy of the video and screenshots for offline presentation
- [ ] Public repository clone/install check on a clean machine
- [ ] Tagged X post with description, video, and public repository

## Failure-proofing

The live product must use real Sepolia/Nox data. Presentation backup assets may show a prerecorded successful Sepolia run and screenshots, but must never be presented as live state. Keep these locally before demo day:

- the final video file;
- screenshots of funding, encrypted submission, pending computation, verified conservation, and withdrawal;
- transaction links and a plain-text list of deployed addresses;
- a tested Docker-backed local Nox run for technical questions;
- a clean production build of the frontend.

Do not depend on venue Wi-Fi, a faucet, or a newly created round during the judged presentation.
