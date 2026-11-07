import { describe, expect, it } from "vitest";
import { ASSIST_LABEL, HUMAN_INTERPRETATION_LABEL } from "@asl/shared-types";
import {
  TIER_A_CATALOG,
  previewTierAIngest,
  routeTiers,
  youtubeVideoIdFromLocation,
} from "./index.js";

describe("Tier A/B routing (AC-1.2)", () => {
  it("exposes visible Tier B active + Tier A empty-state when catalog empty", () => {
    expect(TIER_A_CATALOG).toHaveLength(0);
    const route = routeTiers("dQw4w9WgXcQ");
    expect(route.activeTier).toBe("B");
    expect(route.tierBLabel).toBe(ASSIST_LABEL);
    expect(route.tierALabel).toBe(HUMAN_INTERPRETATION_LABEL);
    expect(route.routingLine).toBe("Assist · Tier B");
    expect(route.emptyState?.toLowerCase()).toContain("tier a empty");
    expect(route.emptyState?.toLowerCase()).toContain("not human interpretation");
  });

  it("parses youtube video ids", () => {
    expect(
      youtubeVideoIdFromLocation("https://www.youtube.com/watch?v=abc123&t=10"),
    ).toBe("abc123");
  });

  it("Phase 1b ingest preview accepts zero until CapEx gate", () => {
    const preview = previewTierAIngest([
      {
        youtubeVideoId: "example",
        title: "Example",
        assetRef: "pending://not-shipped",
      },
    ]);
    expect(preview.accepted).toBe(0);
    expect(preview.pendingReview).toHaveLength(1);
    expect(TIER_A_CATALOG).toHaveLength(0);
  });
});
