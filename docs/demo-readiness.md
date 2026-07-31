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

- [x] Public NetSettle Sepolia address and deployment transaction: 0x9f10b266F90638fC058e0891901082Fe9eccD8EA; transaction 0x5b469443b39dd92c8085128bccdd63de08f077c75c42eeffc3c25e3f55c810ee
- [x] Public deployment block configured in the frontend: 11388543
- [x] Three participant wallets funded with Sepolia ETH and Circle test USDC
- [x] Successful six-obligation round and transaction links: [round creation](https://sepolia.etherscan.io/tx/0x86889a1f449ba98da40621e235145129f7c905fc5ce20261b6a13254b2edc358), [fund A](https://sepolia.etherscan.io/tx/0xeb39fbd6e786cdce4cab264a45ffa58dd927ec9f1e468c20baa1f0e09b1f98d5), [fund B](https://sepolia.etherscan.io/tx/0xfea9b9ac842f36e5ceb94edef27a9ba9c9394662e95d739adddcb6f464077043), [fund C](https://sepolia.etherscan.io/tx/0xdf9686eed4d3bd3192edab33dd9f0fdfb6f2e7dfa9c20c02a4a6e15d54e6eba8), [submit C](https://sepolia.etherscan.io/tx/0x1631ff400617e784a92a4e5d47cb1f982e8132c1f916e19691fcfed0f85d230f), [submit B](https://sepolia.etherscan.io/tx/0xb43329e38d6638c13684af3e9314f5231a04f93fb2ef72f9a15b634742afa836), [submit A and compute](https://sepolia.etherscan.io/tx/0xc9a3b1f63179218842822a6922d7a476020eb68368dd35660d8e1af673e30b25), [validate](https://sepolia.etherscan.io/tx/0xc363b253adf3fb1dd3c627bda19a713bd71d8c011bfe45ef39a938288f0bd118), [finalize](https://sepolia.etherscan.io/tx/0xfa99a082d369781b0b5cecfc19aafcb3e3a61846c67e99ab258d3a01aa8348e3), [withdraw A](https://sepolia.etherscan.io/tx/0x2e31bdf13483ac16330aeaf9eeb8b68e942dbc080e05443209d225bd62241197), [withdraw B](https://sepolia.etherscan.io/tx/0xfecae276a722c2b235d9e3d5f6563e65f5066565c3cac880f2bfb1450e55da36), and [withdraw C](https://sepolia.etherscan.io/tx/0xf23c2fff2c1ca5ce9ed713ed6cc3d81ecd97052e8a8b7b73ce22adca79acf14b)
- [x] Reload and retry during an asynchronous state (Round #1 was reloaded during Computing; the safety-proof retry then reached Ready to settle)
- [ ] Wrong-network recovery
- [ ] Rejected non-participant or rejected duplicate action
- [ ] Expired or invalid round refund evidence
- [x] Hosted frontend URL tested in a fresh browser: https://netsettle-alike001s-projects.vercel.app
- [x] Final desktop and mobile screenshots from the hosted Sepolia app (empty-round, unauthenticated Vercel renders verified on 2026-07-31)
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
