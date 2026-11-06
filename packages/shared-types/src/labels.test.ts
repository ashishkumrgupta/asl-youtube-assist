import { describe, expect, it } from "vitest";
import {
  ASSIST_BADGE,
  ASSIST_DISCLAIMER,
  ASSIST_LABEL,
  ASSIST_LABEL_COPY,
  assistOverlayDefaults,
} from "./index.js";

describe("honesty labels", () => {
  it("uses ASL assist / partial as the assist claim string", () => {
    expect(ASSIST_LABEL).toBe("ASL assist / partial");
    expect(ASSIST_LABEL_COPY.claimTier).toBe("assist_partial");
    expect(ASSIST_LABEL_COPY.badge).toBe(ASSIST_BADGE);
  });

  it("disclaimer never claims interpreter or accuracy percent", () => {
    const lower = ASSIST_DISCLAIMER.toLowerCase();
    expect(lower).toContain("not a human interpreter");
    expect(lower).not.toMatch(/\d+\s*%/);
    expect(lower).not.toContain("ai interpreter");
    expect(lower).not.toContain("100%");
  });

  it("default overlay state is assist-only with captions floor intact", () => {
    const state = assistOverlayDefaults();
    expect(state.label).toBe(ASSIST_LABEL);
    expect(state.claimTier).toBe("assist_partial");
    expect(state.captionsFloorIntact).toBe(true);
    expect(state.placeholderMode).toBe(true);
  });
});
