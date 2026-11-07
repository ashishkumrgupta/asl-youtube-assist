# Lexical clip pack — attribution & status

## Decision (real-video-0)

| Choice                                                     | Status                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| AI-persona / video-gen signer pack as default              | **Forbidden** (Deaf-user stop-ship)                                                            |
| WLASL / MS-ASL / ASL Citizen research dumps as product CDN | **No** without commercial license (mostly NC)                                                  |
| YouTube / creator bytes → our CDN                          | **Stop-ship** without written redistrib OK                                                     |
| **Volunteer Deaf clips**                                   | Preferred $0 path — written release + credits + Deaf QA before bind                            |
| **PopSign (CC BY 4.0)**                                    | Thin pack **only** after per-gloss Deaf QA; flag `assist.popsign.v1` default **off**; not gold |
| **Remote link-out**                                        | Creator-hosted URL with credit; provenance `remote_link`; no silent CDN mirror                 |
| Current binding                                            | **`pending`** — gloss / fingerspell fallback; pipeline ready for first donor                   |

Sources: Project `docs/zero-cost-clip-path.md`, `docs/asl-clip-sources.md`, Deaf `real-video-0-constraints.md`.

## What ships in the extension today

- Lexical **index** + caption→playlist (`@asl/lexical`) with Tier B **fail-closed ingest**
- Volunteer release form + capture guide (`docs/volunteer/`)
- Empty `CREDITS.json` + QA log schema under `lexical/ase/`
- Overlay **Open sign video** link-out chrome (allowlisted discovery URLs)
- **No** PopSign media bytes bound (QA list not yet disposed)
- **No** synthetic persona videos

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

## When a pack loads

1. Place rights-clear media under `lexical/ase/clips/` (never `ins/`).
2. Ingest via `bindPairClipPack` / `ingestOpenDemoPack` with QA/release fields.
3. Keep UI **ASL assist / partial**; never interpreter / fluent-discourse claims.
4. Gaps → “No clip for this sign” + gloss/fingerspell fallback.
