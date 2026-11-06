# Phases 1b–5 — CapEx-free scaffolding

Code: `@asl/roadmap-scaffold`. Product framing: Project `docs/product-roadmap.md` + `docs/asl-roadmap.md`.

**Scaffold ≠ shipped.** All later-phase marketing claims stay blocked.

| Phase  | Scaffold surfaces                                                                                               | Unblocked by                                          |
| ------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **1b** | Cohort protocol stub, Tier A ingest hook, dictionary growth plan, free companion stub, usefulness eval fixtures | CapEx: cohort + Tier A media (+ gold pack when bound) |
| **2**  | Entertainment/Study mode chrome, study-ready gate (locked false), comprehension protocol stub                   | Deaf-led comprehension + human-reviewed study packs   |
| **3**  | Latency/coverage stubs, mobile + creator placeholders                                                           | Scale eng + measured latency/coverage                 |
| **4**  | Language-pair registry (ASL active only)                                                                        | ASL Phase 2 eval solid + local Deaf ownership         |
| **5**  | Empty interpretation allow-list; north-star claim gate                                                          | Pre-registered Deaf-led parity evidence               |

## Honesty

- Assist stays **ASL assist / partial**
- No “better than captions,” study-ready, accuracy %, or interpreter-grade from scaffolds
- Feature flags for later phases default **off** in production (`@asl/flags`)

## Eval fixtures

See `evals/phases/` — wiring only; `notDeafLedProof: true`.
