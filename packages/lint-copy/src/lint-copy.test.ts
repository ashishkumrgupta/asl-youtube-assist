import { describe, expect, it } from "vitest";
import { assertAssistCopyClean, lintAssistCopy } from "./index.js";

describe("lint-copy", () => {
  it("allows honest Phase 0 assist language", () => {
    const ok =
      "ASL assist (partial) — signing clips not loaded yet (placeholder); not a human interpreter.";
    expect(lintAssistCopy(ok, "assist")).toEqual([]);
    expect(() => assertAssistCopyClean(ok)).not.toThrow();
  });

  it("flags AI interpreter and accuracy percent", () => {
    const bad = "Our AI interpreter is 95% accurate ASL captions.";
    const v = lintAssistCopy(bad, "assist");
    expect(v.map((x) => x.term)).toEqual(
      expect.arrayContaining(["AI interpreter", "accuracy %", "ASL captions"]),
    );
  });

  it("flags interpreter-grade claims", () => {
    const v = lintAssistCopy("interpreter-grade overlay", "assist");
    expect(v.some((x) => x.term === "interpreter-grade")).toBe(true);
  });

  it("allows human interpretation phrasing on Tier A surface", () => {
    const text = "Human interpretation available when a catalog recording exists.";
    expect(lintAssistCopy(text, "human_tier_a")).toEqual([]);
  });

  it("flags usefulness-vs-captions marketing before AC-1.3/1.4", () => {
    const v = lintAssistCopy("Helps follow better than captions alone.", "assist");
    expect(v.some((x) => /captions/i.test(x.term))).toBe(true);
  });

  it("flags dual-path forbidden AI marketing claims", () => {
    expect(
      lintAssistCopy("Our AI is as good as a person at ASL.", "assist").some(
        (x) => x.term === "as good as a person",
      ),
    ).toBe(true);
    expect(
      lintAssistCopy("AI replaces volunteers for outreach.", "assist").some(
        (x) => x.term === "AI replaces outreach",
      ),
    ).toBe(true);
  });
});
