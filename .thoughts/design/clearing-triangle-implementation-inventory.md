# Clearing Triangle Implementation Inventory

## Accepted concept references

- Desktop finalized round: `assets/design/clearing-triangle-desktop.png` (1536 × 1024).
- Mobile submission state: `assets/design/clearing-triangle-mobile.png` (853 × 1853).
- The original visual direction is implemented in the public app components and styles; private session planning files are intentionally not part of this repository.

The generated references render the already approved Direction 1. They do not expand product scope and must never be shipped as static UI.

## Color lock

- Canvas is warm ivory `#F6F4EE`, not white or cool gray.
- Surfaces are paper white `#FFFEFB`.
- Ink `#171817`, muted slate `#626660`, stone borders `#D9D7CF`.
- Cobalt `#3155E7` is reserved for the primary action/current computation.
- Violet `#6E56CF` means encrypted/confidential.
- Mint `#138A68`, amber `#B66A0B`, and brick `#B44335` are semantic success/waiting/failure colors only.

## Typography

- Geist or Inter for product copy; compact headings and deliberately sized control labels.
- Geist Mono or IBM Plex Mono with tabular numerals for addresses, hashes, round IDs, and amounts.
- No oversized marketing headline and no browser-default button/input typography.

## Allowed first-viewport copy

- `NetSettle`
- `Six private obligations. Three verifiable net positions.` only when explanatory context is needed for an empty round.
- Dynamic round identifier and named lifecycle state.
- `Ethereum Sepolia`, dynamic token symbol, connected wallet, contract/explorer actions.
- `Confidential clearing`, `Encrypted`, participant labels/addresses/readiness.
- Dynamic `Pays`, `Receives`, `Even`, collateral, entitlement, and conservation values.
- One stage-appropriate primary action.
- `Obligation amounts are private. Participants and final net positions are public.`

No marketing eyebrow, metrics, navigation sections, feature labels, or unverified claims are allowed above the fold.

## Component ownership

- `AppShell`: network/contract/wallet header and responsive page frame.
- `RoundWorkspace`: contract-backed round loading, empty state, and stage composition.
- `ClearingTriangle`: desktop-only spatial relationship with six directed encrypted routes.
- `ClearingSummary`: mobile participant stack and encrypted-obligation summary.
- `ParticipantNode`: public identity, readiness, and final net position.
- `ClearingCore`: named Nox status and verified/failure state.
- `ActionPanel`: exactly one current action plus eligibility/recovery explanation.
- `LifecycleRail`: horizontal desktop and vertical mobile stage state.
- `ConservationProof`: deterministic paid/received equality.
- `RoundActivity`: collapsed event/transaction details from real chain data.
- Shared primitives: button, status mark, address, amount, field, notice, transaction link.

`App` remains composition glue; chain reads, derived state, and writes belong in focused hooks/modules.

## Container and responsive model

- Desktop: compact header; clearing canvas left; sticky action inspector right; lifecycle and activity below.
- Mobile: header; round state; three participant rows; confidential-state summary; action form; privacy strip; vertical lifecycle.
- Below roughly 900px, do not draw or horizontally scroll the triangle.
- Major surfaces use 12–16px radii, one-pixel borders, and minimal shadow.

## Icon inventory

- Brand: simple three-node clearing mark.
- Status: check, clock, retry, warning, failure; always paired with text.
- Utility: copy, external-link, chevron/disclosure.
- Lifecycle: fund, submit, compute, settle, withdraw.
- SVG icons use consistent 1.75–2px rounded strokes and `currentColor`; no padlock/shield/coin metaphors.

## Motion

- Route activity may use a restrained directional dash/opacity motion during computation.
- The finalized transition may fade routes back while net-position labels and conservation proof resolve in sequence.
- No perpetual decorative animation. Respect `prefers-reduced-motion`.

## Core interaction inventory

- Connect or switch an injected wallet.
- Create/open a real round.
- Approve and fund pinned ERC-20 collateral.
- Encrypt exactly two amounts and submit both handles/proofs.
- Reconstruct named pending state after reload and retry polling safely.
- Obtain public decryption proofs and finalize a valid or refundable-invalid round.
- Withdraw or reclaim exactly once.
- Copy/open real contract, transaction, and operation identifiers.
