# Lexical ase QA logs

## Volunteer / open_cc

`volunteer-qa-log.json` — no volunteer or PopSign gloss ships without a pass row (+ `releaseOnFile` for volunteer).

PopSign (`assist.popsign.v1`, default **off**): do not bind media bytes until every shipped gloss has a Deaf QA pass row here.

## AI-generated interim (dual-path-0)

`ai-qa-log.json` — Deaf disposition log for labeled AI interim clips.

- Provenance must be `ai_generated` with explicit `aiGenerated: true` (never silent synthetic).
- Flag `assist.ai_generated.v1` **default off** until a thin HF allowlist clears Deaf review.
- **Prefer-real:** when a real clip binds for gloss G, AI for G is demoted automatically.
- Fail / not-good-enough → stop shipping that gloss/wave (remove bind).
- CI may dry-run `ai-hf-test-fixture` + `*.ai-test-only.webm` — **not gold**, not marketed.

**Current:** zero AI clips approved for production bind.
