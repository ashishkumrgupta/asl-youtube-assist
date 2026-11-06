# Language pairs — how to add a new sign language

Single source of truth: `@asl/language-pairs` (`packages/language-pairs/src/registry.ts`).

## Codes

| ISO 639-3 | Product name                   | This ship                                                                 |
| --------- | ------------------------------ | ------------------------------------------------------------------------- |
| `ase`     | American Sign Language (ASL)   | **Live** habit shell (`en-ase`)                                           |
| `ins`     | **Indian** Sign Language (ISL) | **Pending** chrome (`en-ins`) — not live until pack + Deaf-led ISL eval   |
| `isg`     | Irish Sign Language            | **Out of scope** — do not add to registry or picker; never alias as “ISL” |

Product “ISL” **always** means Indian Sign Language (`ins`).

## Add a new pair (checklist)

1. Choose ISO 639-3 sign code + spoken locale; invent pair id `spoken-sign` (e.g. `en-bfi`).
2. Add a `LanguagePair` row in `LANGUAGE_PAIRS` with:
   - unique `assetNamespace` (never reuse `ase` / `ins` media)
   - `clipManifestHook` + `fingerspellAssetPrefix`
   - `uiStatus`: `pending` or `disabled` until Deaf-led ownership + eval
   - `liveAssistEnabled: false` until habit-shell path is honestly ready
3. Add `apps/extension/assets/lexical/<namespace>/CLIP_PACK.json` stub (`status: pending`, `syntheticPersona: false`).
4. Extend eval fixtures under `evals/` with `notDeafLedProof: true`.
5. Update this doc’s table; never claim multi-lang “live” or fluency without Deaf-led eval.

## Hard rules

- Do not play ASL clips / ASL gloss under another language’s label.
- CapEx gold packs are **per language** (ISL estimate ≠ ASL estimate).
- Captions floor + critical-domain gate stay on for every pair.
