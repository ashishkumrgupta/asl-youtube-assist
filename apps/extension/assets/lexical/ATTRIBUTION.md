# Lexical clip pack — attribution & status

## Decision (real-video-0 + dual-path-0)

| Choice                                                     | Status                                                                                                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silent AI-persona / unlabeled video-gen as default         | **Forbidden** (Deaf-user stop-ship)                                                                                                                       |
| **Labeled AI interim** (`ai_generated`)                    | Scaffold only — flag `assist.ai_generated.v1` **OFF**; zero production binds until Deaf disposition; always `Partial · AI-generated · not an interpreter` |
| WLASL / MS-ASL / ASL Citizen research dumps as product CDN | **No** without commercial license (mostly NC)                                                                                                             |
| YouTube / creator bytes → our CDN                          | **Stop-ship** without written redistrib OK                                                                                                                |
| **Volunteer Deaf clips**                                   | **Preferred** over AI — written release + credits + Deaf QA before bind                                                                                   |
| **PopSign (CC BY 4.0)**                                    | Thin pack **only** after per-gloss Deaf QA; flag `assist.popsign.v1` default **off**; not gold                                                            |
| **Remote link-out**                                        | Creator-hosted URL with credit; provenance `remote_link`; after AI in fallback chain                                                                      |
| Current binding                                            | **`pending`** — gloss / fingerspell fallback; pipeline ready for first donor                                                                              |

**Resolver:** real → AI (flag + disposition) → remote_link → cues. Real bind for gloss G **demotes AI** for G.

Sources: Project `docs/zero-cost-clip-path.md`, `docs/asl-clip-sources.md`, Deaf dual-path + real-video-0 constraints.

## What ships in the extension today

- Lexical **index** + caption→playlist (`@asl/lexical`) with Tier B **fail-closed ingest** + dual-path prefer-real resolver
- Volunteer release form + capture guide (`docs/volunteer/`)
- Empty `CREDITS.json` + QA log schemas under `lexical/ase/qa/` (volunteer + AI)
- Overlay **Open sign video** link-out chrome (allowlisted discovery URLs)
- **No** PopSign media bytes bound (QA list not yet disposed)
- **No** production AI media bound (AC-DP0.10 — gates only)
- CI may dry-run `*.ai-test-only.webm` / `ai-hf-test-fixture` — **not gold**

## Volunteer

When donors bind:

1. Release on file (`docs/volunteer/clip-release.md`)
2. Deaf QA pass per gloss (`lexical/ase/qa/volunteer-qa-log.json`)
3. Credits as consented (`lexical/ase/CREDITS.json`)
4. Provenance `volunteer` · flag `assist.volunteer.v1`
5. Honesty: “Volunteer Deaf-produced clips — assist only; dialect/scope may be limited.”

## PopSign / GT–NTID (CC BY 4.0)

- Flag `assist.popsign.v1` **default off**
- Bind **only** glosses with Deaf QA pass + attribution UI
- Honesty when active: “Limited open lexicon (PopSign, CC BY) — phone-quality citation clips; **not** a complete ASL dictionary.”
- Attribution: PopSign / Georgia Tech – NTID · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · project: https://www.popsign.org/
- **Do not** bind under ISL (`ins`)

Until Deaf QA disposition on a named gloss list: attribution scaffold only — **no** PopSign WebMs in the bound pack.

## Remote link-out

- Provenance `remote_link`
- Show host + creator credit; “Opening creator-hosted media — not our pack · not an interpreter”
- Static allowlist only (see `@asl/lexical` `REMOTE_LINK_ALLOWLIST`)

## AI interim (dual-path-0 + ai-wave-1)

- Provenance `ai_generated` + `aiGenerated: true` + `generatorModelId` (About disclosure)
- Flag `assist.ai_generated.v1` **default off** until thin HF allowlist clears Deaf review
- Compact honesty: `Partial · AI-generated · not an interpreter`
- Stage hint: `AI interim — not Deaf video`
- Never gold / interpreter / silent synthetic; never under ISL (`ins`)
- QA log: `lexical/ase/qa/ai-qa-log.json` — **ai-wave-1** six glosses stubbed `disposition: pending` (not pass)
- Pack stub: `lexical/ase/qa/ai-wave-1-pack-stub.json` (unbound; not loaded)
- Prompts / capture: `docs/ai-clips/`
- Intended unbound media: `*.ai-pending.webm` — **not present** until a real video-gen path drops files (no black-frame fakes)

## When a pack loads

1. Place rights-clear media under `lexical/ase/clips/` (never `ins/`).
2. Ingest via `bindPairClipPack` / `ingestOpenDemoPack` with QA/release/disposition fields.
3. Keep UI **ASL assist / partial**; never interpreter / fluent-discourse claims.
4. Gaps → “No clip for this sign” + gloss/fingerspell fallback.
5. Prefer-real: real ingest automatically demotes AI for the same gloss.
