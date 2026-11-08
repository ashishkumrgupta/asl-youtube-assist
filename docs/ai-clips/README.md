# AI citation clips (ai-wave-1)

**Purpose:** First thin HF set of **labeled AI-generated** ASL citation prompts + capture/spec for Deaf disposition.  
**Not gold. Not an interpreter. Not production-bound.**

| Lock                        | Value                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| Wave                        | `ai-wave-1`                                                        |
| Source id (future ingest)   | `ai-hf-wave-1`                                                     |
| Language                    | **ASL (`ase`) only** — never under ISL (`ins`)                     |
| Provenance                  | always `ai_generated`                                              |
| Flag                        | `assist.ai_generated.v1` stays **OFF** until Deaf disposition      |
| Bind                        | **forbidden** until per-gloss Deaf pass (DUAL-6 / AC-DP0.10)       |
| Filename when media arrives | `<GLOSS>.ai-pending.webm` under `lexical/ase/clips/` — **unbound** |

## Thin HF allowlist (6)

| Gloss    | HF forms (examples)       | Prompt                                 |
| -------- | ------------------------- | -------------------------------------- |
| `HELLO`  | hello, hi, hey            | [prompts/HELLO.md](prompts/HELLO.md)   |
| `THANKS` | thanks, thank (thank-you) | [prompts/THANKS.md](prompts/THANKS.md) |
| `YES`    | yes, yeah                 | [prompts/YES.md](prompts/YES.md)       |
| `NO`     | no, nope                  | [prompts/NO.md](prompts/NO.md)         |
| `PLEASE` | please                    | [prompts/PLEASE.md](prompts/PLEASE.md) |
| `BAD`    | bad                       | [prompts/BAD.md](prompts/BAD.md)       |

Constants live in `@asl/lexical` (`AI_WAVE_1_GLOSSES`). Production allowlist helper returns **[]**.

## Spec

See [capture-spec.md](capture-spec.md) — citation form, front torso + face, ≤2–3 s, ASL only.

## Pipeline status (this wave)

| Step                                  | Status                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Prompts + capture spec                | **This folder**                                                                                                |
| QA log stubs (`disposition: pending`) | `apps/extension/assets/lexical/ase/qa/ai-qa-log.json`                                                          |
| Pack stub (unbound)                   | `apps/extension/assets/lexical/ase/qa/ai-wave-1-pack-stub.json`                                                |
| Real AI WebM/MP4                      | **Blocked** — no video-gen API/tool in agent environment (do **not** use ffmpeg black-frame fakes for Deaf QA) |
| `qaPass` / prod bind / flag ON        | **Not done** — Deaf disposition required                                                                       |

## Honesty (when a gloss later plays)

- Badge: `ASL assist`
- Line: `Partial · AI-generated · not an interpreter`
- Stage: `AI interim — not Deaf video`
- About: model id + “Replaced when real Deaf video is available”

Prefer-real: if volunteer/open_cc binds for the same gloss, demote AI.
