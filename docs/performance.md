# Performance & client-side scale

**Business bars:** Project `internal/business/scale-security-scope.md` **SC-1…SC-4**.  
Constants: `@asl/perf-budget`.

## SC-1 — Scale model (honest)

| Today                                                                                     | Not today                                    |
| ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Per-client MV3**: each user’s browser runs overlay + caption sync locally               | Shared interpret backend / multi-region SaaS |
| **N users ≈ N independent clients** — no Project-operated server required for habit shell | “Scales to millions” capacity claims         |
| Bottlenecks: YouTube DOM/captions, device CPU, (later) clip CDN                           | Our monolith queue                           |

**Allowed claim:** “Runs locally in your browser on YouTube; designed for many independent users without our servers.”

## SC-2 — Offline-of-us habit shell

Toggle + sync on captioned YouTube / fixtures works **without** a Project backend. Clip media, when bound, is packaged or HTTPS static — not a live inference API.

## SC-3 — Cache growth

Clip packs are CapEx-deferred. When packs land: per-language namespaces, pinned assets, **eviction / size policy required** before unbounded disk cache. Shell today stores **settings only** (`chrome.storage.session`).

## SC-4 — Perf smoke budgets (client)

| Budget                     | Value                                                     | Enforcement              |
| -------------------------- | --------------------------------------------------------- | ------------------------ |
| Overlay tick while visible | `OVERLAY_TICK_MS` = **100ms** (~10 Hz), not raw 60 Hz rAF | content-script           |
| Overlay tick while hidden  | `OVERLAY_HIDDEN_TICK_MS` = **1000ms**                     | content-script           |
| Playlist rebuild (soft)    | `PLAYLIST_REBUILD_BUDGET_MS` = **8ms** avg on fixture     | `@asl/perf-budget` tests |
| Sync lookup (soft)         | `SYNC_LOOKUP_BUDGET_MS` = **2ms** avg on small list       | tests                    |
| SPA nav observer           | Debounced `NAV_OBSERVER_DEBOUNCE_MS` = **200ms**          | content-script           |
| Render                     | Skip DOM write when cue/step/gloss key unchanged          | content-script           |

**Hot path (live ASL only):** read cues → sync active cue → **rebuild playlist only on cue id change** → stitch once → pick step by elapsed → render if dirty.

ISL pending / overlay off: **no tick loop**.

## Future infra (explicit non-goals now)

CDN capacity, API rate limits, multi-tenant auth, load tests for “millions WAU” — **new CapEx phase** with cost + security review. Do not invent a backend in this repo for habit-shell scale.
