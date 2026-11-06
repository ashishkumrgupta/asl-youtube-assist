# Lexical clip pack — Phase 0 status

## Decision (2026-11-06)

| Choice                                                     | Status                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| AI-persona / video-gen signer pack as default              | **Forbidden** (Deaf-user stop-ship / not fit)                                  |
| WLASL / MS-ASL / ASL Citizen research dumps as product CDN | **No** without commercial license (mostly NC)                                  |
| Phase 0 gold                                               | **Commissioned thin Deaf-produced pack** OR negotiated commercial license      |
| PopSign (CC BY 4.0)                                        | Optional **tiny** attributed scaffold only, after Deaf QA — not gold MVP alone |
| Current binding                                            | **`pending`** — gloss cues + fingerspell OOV only                              |

Sources: Project `docs/asl-clip-sources.md`, `internal/deaf-user-review/clip-source-stance.md`.

## What ships in the extension today

- Lexical **index** + caption→playlist (`@asl/lexical`)
- **Fingerspell OOV** letter steps (`@asl/fingerspell`) — assist chrome glyphs, not Deaf-produced signing video
- Overlay shows gloss / fingerspell **cues** with honest “clip pack pending” copy
- **No** synthetic persona videos generated or bundled

## When gold pack lands

1. Place licensed Deaf-produced (or cleared) media under this tree or a signed CDN.
2. Flip `CLIP_PACK_MANIFEST` to `loaded` with `sourceId`, `deafProduced: true`, provenance here.
3. Keep UI **ASL assist / partial**; never interpreter / fluent-discourse claims.
