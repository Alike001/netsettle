# Codex Prompts — Hackathon Workflow

Sol at Extra High for research/ideation/design, High for pre-submission review.
Terra at Medium for the build phase once direction is locked.

---

## THE MASTER KICKOFF PROMPT — the only thing you paste to start

This runs your entire pre-build workflow (research → ideas → design → build)
in one continuous session. Paste it first, with the hackathon's raw resources
right below it in the same message. Everything else in this file is either
folded into this prompt already, or used standalone at specific separate
moments — see the notes under each section below.

```
Read AGENTS.md fully — those rules apply to everything below and override
any default instinct you have. This includes the log.md/handoff.md session
discipline — check handoff.md first if it already has content, and add a
log.md entry after each phase completes.

We are going through 4 phases in strict order. Do not skip ahead to a later
phase until I explicitly approve moving on, even if you feel ready.

PHASE 1 — RESEARCH: Follow research-intake.md exactly, including finding and
saving this hackathon's published judging criteria, whether design/UX is a
scored dimension, and the deep scan of the reference builders' repos for
past projects aligned with [PROTOCOL/HACKATHON NAME]'s specific tools and
problem space (not just general chain patterns). Pull and actually read the
raw resources given below — don't guess at API shapes or conventions from
general knowledge. Web-search current trends, past hackathon winners on
this chain, and other public repos built specifically for this protocol.
Write /research/domain-knowledge.md, then summarize your findings to me in
plain, non-technical language and STOP. Wait for my go-ahead before Phase 2.

PHASE 2 — IDEAS: Only after I approve Phase 1. First, brainstorm at least 10
raw directions internally before narrowing — quantity forces you past the
first, most obvious answer. From those, present 5 distinct project
directions, and make sure at least one is an infrastructure/tooling angle
(indexer, SDK, dev tool, monitoring, primitive) rather than only
consumer-facing apps. For each: the specific problem it solves for THIS
chain (not generic), whether this is a real, validated pain point rather
than just a cool technology looking for a use case, which of the chain's own
tools it uses, why it passes the feasibility filter in AGENTS.md, whether it
passes the 10-second story test (problem + solution as one obvious pair),
and one sentence on why it's NOT the obvious/generic answer to this brief.
Explicitly do not give me your first instinct as the primary suggestion —
treat that as the "everyone else will build this" option and generate
around it instead. For each of the 5, score 1-5 on: personal excitement (ask
me), feasibility, wow factor, judging-criteria alignment, and demo quality —
show the totals. Present them and STOP. Wait for me to pick one. Once I
pick, help me cut its scope in half, then cut that in half again — we want
the smallest version that still tells the full story, not the most
features.

PHASE 3 — DESIGN: Only after I pick an idea. First confirm: does this
track's judging criteria mention design/UX as a scored dimension (check
/research/domain-knowledge.md)? If not, keep this phase lean — a clean,
non-embarrassing UI is enough; don't over-invest polish time that's better
spent on Phase 4 depth. If design IS a judged dimension, follow
design.doc.md exactly — research real reference UIs (web-search, don't
guess from memory), propose brand/layout directions. Give me 3 distinct
layout/visual directions, each differing in layout pattern and information
hierarchy. Do not default to a standard SaaS hero + feature-grid + CTA
layout unless it genuinely fits — treat that as the anti-pattern to avoid.
Explain in one sentence what makes each direction distinct, present them,
and STOP. Wait for me to pick one before writing design.doc.md or any
frontend code.

PHASE 4 — BUILD: Only after I approve a design direction. BEFORE writing any
code, draft a rough demo script — the 90-second version: what will be shown,
in what order, and the core moment that proves the value. If this can't be
explained clearly in 90 seconds, say so and tell me which part needs
cutting before we start building — this is a scope check, not the final
polished pitch (that comes later, in standalone prompt B). Once that's
sanity-checked, begin building per my idea + approved design.doc.md. Confirm
the tech plan with me before writing code for anything non-trivial. Follow
AGENTS.md's QA testing discipline throughout — test each nontrivial piece
(edge cases, bad inputs, and real testnet/local-chain runs for anything
onchain) as you build it, not only at the end. Log test results and any
untestable gaps in handoff.md.

This hackathon/protocol is: [PROTOCOL/HACKATHON NAME]

Here are the hackathon's raw resources:
[paste links, docs, GitHub URLs, starter templates here]
```
---

## Standalone prompt A — new resource mid-project

Use this in a fresh message any time you get a new resource AFTER Phase 1
already finished (a mentor sends a doc, you find a new reference repo
mid-build). Don't restart the master prompt for this — just paste this one.

```
I'm giving you [docs link / repo / transcript]. Read it directly — don't guess
at API shapes or conventions from general knowledge.

Summarize in plain, non-technical language:
1. What this tool/chain is actually for
2. What makes it different from similar tools
3. What a "good" project using this looks like, based on how it's documented
4. Any starter templates, SDKs, or patterns I should reuse rather than reinvent

Add this to /research/domain-knowledge.md under a new dated entry, don't
overwrite what's already there.
```

---

## Standalone prompt B — demo script + pitch, mapped to judging criteria

Use this once the build is stable, before the pre-submission review (prompt C).
Sol, High effort — this needs judgment about what to emphasize, not just writing.

```
Read /research/domain-knowledge.md for this hackathon's published judging
criteria (if we didn't save them, find them now — check the hackathon's
website/docs).

Map our project's features to those criteria explicitly: which feature
demonstrates which scored dimension (e.g. insight value, data quality,
utility, scalability, verifiability, ecosystem fit). Flag any criterion
we're currently weak on.

Then draft:
1. A demo script where each beat ties to a specific criterion, not just
   "cool stuff" — prioritize showing something that can be verified live
   over something we just claim.
2. A 4-sentence pitch in this shape: problem (something judges already
   feel/recognize), product (what it is), solution (how it works,
   specifically), why (the stakes/market reason this matters). If the
   pitch needs more than 4-5 sentences to land, tell me the product
   isn't clear enough yet, don't just pad it.

I'll practice this out loud separately — your job here is just the script
and the mapping.
```

---

## Standalone prompt C — pre-submission review

Always used on its own, near the deadline, as a separate message (ideally
switch Sol's effort to High or Extra High for this one specifically — it's
your last check before a judge sees it).

```
Review this project against AGENTS.md's 3 rules:
1. Can a judge understand and run this in 30 seconds? Check for any setup
   friction, missing env vars, or mock data pretending to be real.
2. Is this genuinely using [chain]'s own tools to solve a problem specific
   to them, or could this exist on any chain?
3. Is this a product or a demo? Flag anything scripted/faked for the demo
   that isn't actually functional.
4. QA check: are there actual tests for the core logic, and do they pass?
   Actually run them, don't just read the code and assume. Flag any
   untested edge case or any onchain interaction that hasn't been run
   against a real testnet/local chain.

Be harsh — I'd rather you catch this than a judge.
```

---

## Standalone prompt D — post-hackathon wrap-up

Use this after submitting, win or not. Submitting and publishing matters
regardless of outcome — recruiters and future-you care more about shipped,
documented work than an unfinished idea.

```
The hackathon is over. Help me close this out:

1. Add a final entry to log.md summarizing: what we actually built, what
   didn't work or got cut, and what I learned from this specific hackathon
   (research approach, idea choice, design, build, demo — be honest about
   weak points, not just wins).
2. Draft a short public writeup (for GitHub README / Devpost / X) covering:
   what the project does, what problem it solves, the tech stack, and one
   honest line about what we'd improve with more time.
3. Confirm the repo is actually public and the README lets someone
   understand and run it without extra explanation from me.
```
