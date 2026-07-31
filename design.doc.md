Note to AI agent: this is a different product from the reference UIs above. Copy only visual direction — not their content, features, or copy.

# References

## Temporal Web UI

- Official references: https://docs.temporal.io/web-ui and https://temporal.io/blog/the-dark-magic-of-workflow-exploration
- Borrow its state-first treatment of asynchronous work: grouped events, explicit pending/retrying/failed/completed states, and details that expand only when requested.
- Borrow the practice of reserving strong color for semantic state instead of decoration.
- Apply this to NetSettle's `Fund → Submit → Compute → Settle → Withdraw` lifecycle and its retry, timeout, reload, expiry, and refund paths.

## Stripe Dashboard

- Official reference: https://stripe.com/blog/dashboard-updates-oct-2020
- Borrow its restrained financial hierarchy: an immediately useful summary, compact status labels, copyable identifiers, and actions placed beside the state they affect.
- Borrow its use of neutral surfaces and thin dividers so amounts, settlement status, and the primary action remain visually dominant.
- Apply this to round summaries, collateral, public net positions, transaction links, withdrawal entitlement, and recovery actions.

## Tailscale

- Official reference: https://tailscale.com/blog/reimagining-tailscale-for-ios
- Borrow its compact identity rows, quiet online/readiness indicators, secondary identifiers, and details-on-selection behaviour.
- Apply this to the exactly three public participant wallets without turning wallet connection into the visual focus of the product.

# Brand basics

## Concept and tone

- Direction name: **Clearing Triangle**.
- Tone: serious, calm, precise, and proof-oriented. NetSettle should feel like a trustworthy clearing instrument, not a speculative trading product or a privacy-themed concept page.
- Core visual idea: six confidential bilateral obligations enter one clearing process and resolve into three public net positions.
- Product sentence: **Six private obligations. Three verifiable net positions.**
- Privacy language must be exact: obligation amounts are confidential; participant addresses, transaction timing, contract calls, and final net positions remain public.

## Color tokens

- Canvas: warm ivory `#F6F4EE`.
- Primary surface: paper white `#FFFEFB`.
- Raised/selected surface: soft cobalt tint `#EEF1FF`.
- Primary text: ink `#171817`.
- Secondary text: slate `#626660`.
- Borders and inactive routes: stone `#D9D7CF`.
- Primary action and active computation: cobalt `#3155E7`.
- Confidential/encrypted state: deep violet `#6E56CF`.
- Completed/success state: mint `#138A68` with a pale mint background.
- Waiting/expiring state: amber `#B66A0B` with a pale amber background.
- Failed/destructive state: brick red `#B44335` with a pale red background.
- Do not use success, warning, or error colors decoratively. Every colored state also needs an icon and text label.
- Meet WCAG AA contrast for normal text, controls, focus indicators, and status labels.

## Typography

- Use a geometric sans-serif such as Geist or Inter for interface copy. Headings should be confident but compact, not oversized marketing typography.
- Use Geist Mono, IBM Plex Mono, or an equivalent tabular monospace for wallet addresses, token amounts, transaction hashes, round identifiers, and invariant values.
- Use tabular numerals wherever financial values can change or align vertically.
- Keep labels plain-language first; protocol terminology may appear as supporting detail.

## Shape, borders, and iconography

- Use 12–16px corner radii on major cards and 8–10px on controls and status labels.
- Prefer one-pixel borders and small tonal elevation changes over heavy drop shadows.
- Use simple outlined interface icons. Do not use padlocks or shields as the main privacy metaphor.
- Represent encryption through masked amount capsules and violet route styling labelled `Encrypted`, not through mystery imagery.

# Layout

## Overall pattern

- Build a dashboard-first application with no separate marketing homepage and no hero/feature-grid/CTA structure.
- The connected wallet lands directly in the current round. If no round exists, the same shell explains the three-participant requirement and presents the one valid round-creation action.
- Desktop uses a three-zone composition: compact round header, central clearing workspace, and contextual action/inspection panel. Mobile reorders these into one guided column without shrinking the triangle into an unreadable diagram.

## Round header

- Keep the header compact and sticky.
- Show the NetSettle wordmark, current lifecycle state, round identifier, Ethereum Sepolia badge, pinned token, deadline, connected wallet, and a copyable contract address or explorer link.
- The network badge must make a wrong-network condition unmistakable and provide the corrective action.
- Do not place large marketing copy above the product state.

## Central clearing workspace

- The dominant visual is a triangle formed by three participant cards around a central **Confidential Clearing** node.
- Participant A occupies the top position; Participants B and C occupy the lower-left and lower-right positions. All are public wallet identities with shortened addresses and readiness states.
- Draw all six directed routes between participants. Because every participant submits a complete two-recipient vector, every route exists even when its hidden value is zero.
- Before finalization, route labels show `Encrypted` rather than amounts. Do not reveal which confidential obligation is non-zero.
- The central node shows the computation state with explicit copy such as `Waiting for 1 submission`, `Computing in Nox`, `Retry available`, or `Net positions verified`.
- After successful computation, keep the triangle visible but visually subordinate the six encrypted routes. Place three public net-position cards around or beneath the participants: `Pays`, `Receives`, or `Even`, including public amounts.
- Show the conservation proof beside the final result: total paid equals total received. This is a deterministic invariant, not an AI-generated score.

## Contextual action panel

- Place a sticky panel to the right of the clearing workspace on desktop and immediately below the current state on mobile.
- Present exactly one primary action for the connected participant's current stage: approve/fund, submit encrypted obligations, retry computation, settle, withdraw, or claim refund.
- Explain why an action is unavailable instead of merely disabling it.
- For obligation entry, show exactly two recipient rows with public recipient identities and amount inputs. Before submission, state that both values will be encrypted locally and that a zero amount remains indistinguishable onchain from another submitted encrypted value.
- After submission, replace editable values with a submitted confirmation; never redisplay confidential plaintext after reload unless the wallet can legitimately decrypt and the user explicitly requests it.
- Put pending transaction, retry, timeout, expiry, and refund controls in this panel beside the state they affect.

## Lifecycle rail and history

- Place a horizontal lifecycle rail below the central workspace on desktop: `Fund → Submit → Compute → Settle → Withdraw`.
- Each stage needs icon, label, semantic state, and short status text. Pending and failed states must remain distinguishable without color.
- On mobile, render the lifecycle as a vertical step list.
- Add a collapsed `Round activity` section below the rail for transaction hashes, timestamps, Nox operation identifiers, retries, settlement, withdrawals, and refunds. Keep implementation detail available for judges without forcing it on ordinary users.

## Responsive and loading behaviour

- Above approximately 900px, retain the spatial triangle and side panel.
- Below that breakpoint, convert the triangle to a compact clearing summary: three participant rows, a six-encrypted-obligations statement, the central computation state, and three result rows. Preserve the same information hierarchy rather than using horizontal scrolling.
- Use skeletons only for initial chain reads. For submitted transactions and Nox operations, use persistent named states with reload-safe progress instead of indefinite spinners.
- Every asynchronous state must survive refresh and reconstruct itself from real contract/operation data.

# Anti-patterns

- No generic gradient-purple SaaS hero, feature grid, testimonial strip, or repeated CTA sections.
- No neon cyberpunk styling, glassmorphism, glowing coins, shields, padlocks, 3D blobs, or AI-generated privacy artwork.
- No fake TVL, volume, savings, activity, participant, transaction, or analytics data.
- No mock settlement path disguised as a real Nox or Sepolia transaction.
- No claim that wallet addresses, transaction timing, called functions, or final net positions are private.
- No variable participant count, multi-token selector, invoice documents, recurring rounds, team administration, or unrelated dashboard pages in the approved scope.
- No unexplained spinner for computation. Show the named state, elapsed context when useful, retry/reload behaviour, and expiry/refund path.
- No color-only status communication and no low-contrast gray financial data.
- No decorative charts. The triangle, lifecycle, net positions, and conservation proof are the only visualizations justified by the product.
- No wallet-connect modal or branding that overwhelms the clearing task.
- No hiding the network, contract, transaction, or operation identifiers needed to verify the real Sepolia flow.
- No irreversible action without plain-language consequences and visible eligibility checks.
