# Changelog

All notable changes to this project are documented in this file.

## [0.7.0] — 2026-11-07

### Added

- Local **YouTube-like theater** (`apps/demo-player`): library + watch pages with HTML5 video and always-on VTT; `npm run demo` → `http://127.0.0.1:4173/`
- Extension content script + host permission for documented theater origin only: `http://127.0.0.1:4173/*` (YouTube hosts unchanged)
- Theater smoke tests (`e2e/demo-videos/theater-smoke.test.ts`) — pages build and caption cues parse
- Docs: `docs/build-and-reload.md` splits **Test on local theater** vs **Test on YouTube**; permissions/security rationale for the pinned local host

### Changed

- Demo player is theater-first (extension injects overlay); embedded offline assist chrome removed from the page itself
- `npm run demo:player` aliases `npm run demo`
- `npm run demo` binds `tcp://127.0.0.1:4173` and prints that URL (not `localhost`) so the banner matches `host_permissions`

### Fixed

- Demo server listen address aligned with extension match pattern (`127.0.0.1` only) — opening `localhost` would skip content-script injection
- `pageCaptionsStillPresent` no longer falls back to generic `video`

### Honesty

- Still **ASL assist / partial** only; pack **pending**; theater does **not** claim signing video or replace real YouTube validation

### Security

- SEC-1: least-privilege local host pinned to `127.0.0.1:4173` (not wildcard ports, not `localhost`); static gate updated

## [0.6.0] — 2026-11-07

### Fixed

- Caption cue detection on YouTube: fall back to live DOM caption window when HTML5 `textTracks` are empty, so gloss cues advance while CC is on (no multi-minute “Waiting for caption window…” stall)

### Changed (UI)

- Popup + floating overlay redesigned: compact **badge + one honesty line**, atmospheric teal/ink chrome, expressive display/UI fonts (not Inter/Roboto/system defaults)
- Pack-pending / not-interpreter stay always visible; long copy moved to **About**
- Tier A empty / routing collapsed to short chips (`Assist · Tier B`, `Tier A empty · not human interpretation`)
- Status copy shortened (`Assist on · cues until pack binds`)

### Added

- Local demo videos + VTT under `fixtures/demo-videos/` (generated lavfi clips; not signing media) for **agents/CI** and **Deaf-user UAT** offline — not a replacement for owner YouTube sideload
- `apps/demo-player` offline player + `npm run demo:player`
- `@asl/assist-runtime` shared caption→gloss frame (extension + demo player)
- Automated tests drive caption→gloss / overlay state against local fixtures (`e2e/demo-videos/`, assist-runtime + DOM caption unit tests)

### Honesty

- Still **ASL assist / partial** only; pack **pending**; demos do **not** claim signing video works

## [0.5.1] — 2026-11-06

### CI

- GitHub Actions `pr.yml` runs `npm run security-check` (matches local `npm run ci`)

## [0.5.0] — 2026-11-06

### Security & scale (SC-1…4 / SEC-1…7)

- Client-local scale docs + ADR 0002; `@asl/perf-budget` tick/cache budgets
- Overlay clock: ~10 Hz ticks, cue-cached playlist, hidden-tab slowdown, debounced SPA observer
- `parseRuntimeMessage` + trusted-sender checks (SEC-7); CSP on extension pages (SEC-2)
- Caption sanitize hardened; session storage settings only (SEC-3/6)
- CI: `npm run security-check` + existing high-advisory audit (SEC-1/2/5/6/7)
- Docs: `docs/performance.md`, `docs/security.md`

### Permissions (SEC-1)

- Still: `storage` + YouTube host_permissions only (listed in changelog/docs)

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
