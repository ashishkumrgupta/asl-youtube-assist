/**
 * Client-side performance budgets for the MV3 extension.
 * Scaling model today: **per browser profile / tab** — no shared backend.
 */

/** Overlay sync tick interval when enabled (ms). Prefer ≤10 Hz over raw rAF. */
export const OVERLAY_TICK_MS = 100;

/** Slow tick when tab is hidden (ms). */
export const OVERLAY_HIDDEN_TICK_MS = 1000;

/** Soft budget: cue→playlist rebuild should stay under this on fixtures (ms). */
export const PLAYLIST_REBUILD_BUDGET_MS = 8;

/** Soft budget: single sync lookup on a fixture cue list (ms). */
export const SYNC_LOOKUP_BUDGET_MS = 2;

/** Max caption text retained after sanitize (chars). */
export const CAPTION_TEXT_MAX_CHARS = 500;

/** Debounce for SPA pathname checks from MutationObserver (ms). */
export const NAV_OBSERVER_DEBOUNCE_MS = 200;

export interface PerfBudgetSnapshot {
  readonly overlayTickMs: typeof OVERLAY_TICK_MS;
  readonly playlistRebuildBudgetMs: typeof PLAYLIST_REBUILD_BUDGET_MS;
  readonly syncLookupBudgetMs: typeof SYNC_LOOKUP_BUDGET_MS;
  readonly scalingModel: "per_client_mv3_no_shared_backend";
  readonly note: string;
}

export const PERF_BUDGET: PerfBudgetSnapshot = {
  overlayTickMs: OVERLAY_TICK_MS,
  playlistRebuildBudgetMs: PLAYLIST_REBUILD_BUDGET_MS,
  syncLookupBudgetMs: SYNC_LOOKUP_BUDGET_MS,
  scalingModel: "per_client_mv3_no_shared_backend",
  note: "Many users ⇒ many independent clients. Latency/CPU cost is local to each watch tab; no central queue yet.",
};
