import { describe, expect, it } from "vitest";
import { conservativeGloss } from "@asl/gloss";
import { buildPlaylistFromGloss } from "@asl/lexical";
import { syncToCaptions } from "@asl/sync";
import {
  OVERLAY_TICK_MS,
  PERF_BUDGET,
  PLAYLIST_REBUILD_BUDGET_MS,
  SYNC_LOOKUP_BUDGET_MS,
} from "./index.js";

describe("perf budgets (SC-1 / SC-4)", () => {
  it("documents client-local scale-out (no shared backend)", () => {
    expect(PERF_BUDGET.scalingModel).toBe("per_client_mv3_no_shared_backend");
    expect(OVERLAY_TICK_MS).toBeGreaterThanOrEqual(50);
    expect(OVERLAY_TICK_MS).toBeLessThanOrEqual(250);
  });

  it("playlist rebuild on fixture caption stays under soft budget", () => {
    const t0 = performance.now();
    for (let i = 0; i < 50; i += 1) {
      const gloss = conservativeGloss("What do you want today?");
      buildPlaylistFromGloss(gloss);
    }
    const elapsed = performance.now() - t0;
    // 50 rebuilds; average should be well under budget (CI variance slack).
    expect(elapsed / 50).toBeLessThanOrEqual(PLAYLIST_REBUILD_BUDGET_MS * 3);
  });

  it("sync lookup on small fixture cue list stays under soft budget", () => {
    const cues = Array.from({ length: 40 }, (_, i) => ({
      id: `c${i}`,
      startMs: i * 2000,
      endMs: i * 2000 + 1800,
      text: `cue ${i}`,
    }));
    const t0 = performance.now();
    for (let i = 0; i < 200; i += 1) {
      syncToCaptions(cues, 15_000, 15_000, 500);
    }
    const elapsed = performance.now() - t0;
    expect(elapsed / 200).toBeLessThanOrEqual(SYNC_LOOKUP_BUDGET_MS * 5);
  });
});
