import { describe, expect, it } from "vitest";
import {
  ASSIST_BADGE,
  ASSIST_CAPTIONS_FLOOR,
  ASSIST_DETAILS,
  ASSIST_DISCLAIMER,
  ASSIST_HONESTY_LINE,
  ASSIST_LABEL,
  ASSIST_LABEL_COPY,
  ASSIST_STATUS_ON,
  GLOSS_UI_NOTE,
  assistOverlayDefaults,
} from "./index.js";

describe("honesty labels", () => {
  it("uses ASL assist / partial as the assist claim string", () => {
    expect(ASSIST_LABEL).toBe("ASL assist / partial");
    expect(ASSIST_LABEL_COPY.claimTier).toBe("assist_partial");
    expect(ASSIST_LABEL_COPY.badge).toBe(ASSIST_BADGE);
  });

  it("compact honesty line keeps pack-pending + not interpreter", () => {
    const lower = ASSIST_HONESTY_LINE.toLowerCase();
    expect(lower).toContain("partial");
    expect(lower).toContain("pack pending");
    expect(lower).toContain("not an interpreter");
    expect(ASSIST_DISCLAIMER).toBe(ASSIST_HONESTY_LINE);
  });

  it("About details keep lexical / fingerspell / fluent-discourse honesty", () => {
    const lower = ASSIST_DETAILS.toLowerCase();
    expect(lower).toContain("lexical");
    expect(lower).toContain("fingerspell");
    expect(lower).toContain("pending");
    expect(lower).toContain("not fluent asl discourse");
    expect(lower).toContain("not a human interpreter");
    expect(lower).not.toMatch(/\d+\s*%/);
  });

  it("popup floor + on-status stay compact and honest", () => {
    expect(ASSIST_CAPTIONS_FLOOR.toLowerCase()).toContain("captions stay on");
    expect(ASSIST_STATUS_ON.toLowerCase()).toContain("cues until pack binds");
  });

  it("default overlay state is assist-only with captions floor intact", () => {
    const state = assistOverlayDefaults();
    expect(state.label).toBe(ASSIST_LABEL);
    expect(state.claimTier).toBe("assist_partial");
    expect(state.captionsFloorIntact).toBe(true);
    expect(state.placeholderMode).toBe(true);
    expect(state.languagePairId).toBe("en-ase");
    expect(state.liveAssistEnabled).toBe(true);
  });

  it("gloss UI note refuses English-on-the-hands / fluent ASL framing (AC-1.1)", () => {
    const lower = GLOSS_UI_NOTE.toLowerCase();
    expect(lower).toContain("not fluent asl");
    expect(lower).toContain("not english-on-the-hands");
    expect(lower).not.toMatch(/better than captions/);
  });
});
