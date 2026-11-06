# Changelog

All notable changes to this project are documented in this file.

## [0.4.0] — 2026-11-06

### Added (Indian ISL + multi-lang architecture)

- `@asl/language-pairs` registry SSOT: **ASL (`ase`)** live habit shell; **Indian Sign Language ISL (`ins`)** pending chrome; Irish (`isg`) **out of scope**
- Popup language picker (ASL selectable live; ISL selectable pending; others disabled)
- Per-pair clip-pack hooks (`lexical/ase`, `lexical/ins`); fail-closed `pairs.ins.live` flag
- `docs/languages.md` — how to add a pair without ISO collisions

### Honesty

- No ISL production quality / fluency / multi-lang-live claims
- ASL assets never play under ISL label
- Gold packs still CapEx-deferred per language

## [0.3.0] — 2026-11-06

### Added (Phases 1b–5 CapEx-free scaffolding)

- `@asl/roadmap-scaffold` — typed stubs for Phase **1b** (cohort/ingest/companion), **2** (modes/study gate), **3** (latency/coverage), **4** (language pairs), **5** (empty interpretation allow-list)
- Feature flags for later phases (default **off** in production)
- `docs/phases/`, `evals/phases/`, free static `apps/companion/` stub
- Catalog `previewTierAIngest` hook (accepts **0** until CapEx)

### Notes

- Scaffold ≠ shipped capability. No usefulness / study-ready / accuracy % / multi-language / north-star claims.
- CapEx still required for cohort, Tier A media, gold pack, study packs, scale eng.

## [0.2.0] — 2026-11-06

### Added (Phase 1 Slice A — no new CapEx)

- **AC-1.1** Conservative gloss (`@asl/gloss`) — TIME/content/WH heuristic; UI note that gloss is not fluent ASL / not English-on-the-hands.
- **AC-1.2** Tier A/B routing UI (`@asl/catalog`) with honest empty Tier A (“human catalog unavailable… Not playing assist as human interpretation”).
- Stitch/timing fit into caption cue windows (`@asl/stitch`) — thin eng improvement, no gold clips.
- **AC-1.5** Eval harness scaffolding under `evals/` (fixture manifest + protocol stub; **not** Deaf-led proof).
- Copy lint blocks usefulness-vs-captions / “useful entertainment assist” until AC-1.3/1.4.

### Notes

- Claim tier still **ASL assist / partial** + pack-pending. No usefulness-vs-captions marketing.
- Gold clips, paid Deaf/HH cohort, Tier A catalog content, companion: deferred / cut-unless-free.

## [0.1.0] — 2026-11-06

### Added

- Phase 0 habit skeleton: MV3 sideload extension for YouTube watch pages.
- Toggleable **ASL assist / partial** overlay; caption floor; caption-timestamp sync.
- Draggable overlay (Move handle + keyboard arrows).
- Critical-domain hard gate stub with keyword-heuristic disclosure.
- Lexical index + fingerspell OOV scaffolding (`@asl/lexical`, `@asl/fingerspell`).
- Clip media pack **pending** coordinator pick (no AI-persona default; see ATTRIBUTION).
- Named caption fixtures + fixture smoke + manual sideload checklist.
- Unit tests + GitHub Actions PR workflow; `npm run audit` in CI.

### Notes

- Claim tier is assist only — not a human interpreter; no accuracy percentages.
- Gloss/fingerspell cues only until an approved Deaf-produced / attributed pack is bound.
