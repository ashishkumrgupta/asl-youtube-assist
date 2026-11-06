import { describe, expect, it } from "vitest";
import {
  GLOSS_HONESTY,
  conservativeGloss,
  isEnglishWordOrderPreserved,
} from "./index.js";

describe("conservative gloss (AC-1.1)", () => {
  it("never claims fluent ASL", () => {
    const g = conservativeGloss("What do you want today?");
    expect(g.claimsFluentAsl).toBe(false);
    expect(g.honesty).toBe(GLOSS_HONESTY);
  });

  it("drops function words and prefers TIME then content then WH", () => {
    const g = conservativeGloss("What do you want today?");
    expect(g.glossLine).toBe("TODAY YOU WANT WHAT");
    expect(g.droppedCount).toBeGreaterThan(0);
  });

  it("does not present raw English word-order as the gloss when reordering applies", () => {
    const caption = "What do you want today?";
    const g = conservativeGloss(caption);
    expect(isEnglishWordOrderPreserved(caption, g)).toBe(false);
  });

  it("keeps honesty string for UI", () => {
    expect(GLOSS_HONESTY.toLowerCase()).toContain("not fluent");
    expect(GLOSS_HONESTY.toLowerCase()).toContain("not english-on-the-hands");
  });
});
