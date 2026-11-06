import { describe, expect, it } from "vitest";
import {
  ASSIST_BADGE,
  ASSIST_DISCLAIMER,
  ASSIST_LABEL,
  ASSIST_LABEL_COPY,
  GLOSS_UI_NOTE,
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

  it("Phase 0 disclaimer is lexical-assist honest (pack pending; not fluent / not interpreter)", () => {
    const lower = ASSIST_DISCLAIMER.toLowerCase();
    expect(lower).toContain("lexical");
    expect(lower).toContain("fingerspell");
    expect(lower).toContain("pending");
    expect(lower).toContain("not fluent asl discourse");
    expect(lower).toContain("not a human interpreter");
    expect(lower).not.toMatch(/\d+\s*%/);
  });

  it("default overlay state is assist-only with captions floor intact", () => {
    const state = assistOverlayDefaults();
    expect(state.label).toBe(ASSIST_LABEL);
    expect(state.claimTier).toBe("assist_partial");
    expect(state.captionsFloorIntact).toBe(true);
    expect(state.placeholderMode).toBe(true); // defaults helper still placeholder until callers override
  });

  it("assist disclaimer passes copy lint", () => {
    expect(ASSIST_DISCLAIMER.toLowerCase()).toContain("captions stay on");
  });

  it("gloss UI note refuses English-on-the-hands / fluent ASL framing (AC-1.1)", () => {
    const lower = GLOSS_UI_NOTE.toLowerCase();
    expect(lower).toContain("not fluent asl");
    expect(lower).toContain("not english-on-the-hands");
    expect(lower).not.toMatch(/better than captions/);
  });
});
