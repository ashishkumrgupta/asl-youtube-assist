# AI clip capture / generation spec (ai-wave-1)

Aligned to Deaf dual-path gates + volunteer capture framing. **AI ≠ gold.**

## Hard requirements

| Requirement | Spec                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| Form        | **Citation-form** isolated lemma — one gloss per clip                       |
| Framing     | **Front** camera; **torso + face** visible; hands fully in frame            |
| Duration    | **≤ 2–3 seconds** (trim to citation; no discourse)                          |
| Language    | **ASL (`ase`) only** — no SEE-as-ASL; no ISL (`ins`) bytes under ASL labels |
| Background  | Plain / uncluttered; lighting on hands and face                             |
| Encode      | WebM (VP8/VP9) preferred, or MP4 H.264; ~720p enough                        |
| Filename    | `<GLOSS>.ai-pending.webm` while unbound (e.g. `HELLO.ai-pending.webm`)      |
| Path        | `apps/extension/assets/lexical/ase/clips/` only — **never** `ins/`          |
| Provenance  | Manifest must say `ai_generated` + `aiGenerated: true` + `generatorModelId` |
| Label       | Always-visible AI honesty when playing — never silent synthetic             |

## Linguistic bar (Deaf disposition)

Pass (interim only) needs a recognizable citation attempt for the HF gloss ID.

**Fail / stop-shipping** if:

- Wrong or misleading lemma
- English-on-the-hands / SEE-ish motion sold as ASL
- Unusable handshape / location / movement / orientation
- Misleading or missing NMMs for an isolated citation
- Uncanny / morphing limbs / flicker that breaks trust
- Looks like unlabeled real signer while provenance is AI
- Dialect overclaim as “universal ASL”

Pass ≠ gold ≠ permanent. Prefer-real replaces AI when volunteer/open media binds.

## Generation prompt shape

Each gloss prompt under `prompts/` must include:

1. Gloss ID + English forms
2. Citation-only instruction (no sentence discourse)
3. Front torso + face framing
4. Duration ≤2–3 s
5. Explicit “ASL citation, not interpreter, not English mouthing-as-sign”
6. Output: short WebM/MP4 suitable for overlay cue

## Drop-in checklist (when a real generator is available)

1. Generate / capture per prompt → `<GLOSS>.ai-pending.webm`
2. Place under `lexical/ase/clips/` **unbound**
3. Update QA log row (keep `disposition: pending` until Deaf reviews)
4. Do **not** set `qaPass: true` or flip `assist.ai_generated.v1` ON
5. Hand to Deaf disposition; only then allowlist + bind that gloss

## Forbidden shortcuts

- ffmpeg black frames / solid-color placeholders for Deaf QA
- Binding pending clips into `CLIP_PACK.json`
- Shipping under ISL labels
- Hiding “AI-generated” in chrome
