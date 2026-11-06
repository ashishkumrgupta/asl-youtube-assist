import { describe, expect, it } from "vitest";
import { lexicalPackSize } from "./dictionary.js";
import { buildAssistPlaylist, stepAtElapsed, tokenizeCaption } from "./playlist.js";

describe("lexical MVP", () => {
  it("ships a small pack under the 1–2k Phase 0 ceiling", () => {
    const n = lexicalPackSize();
    expect(n).toBeGreaterThanOrEqual(40);
    expect(n).toBeLessThan(200);
  });

  it("maps known words to lexical clips and OOV to fingerspell", () => {
    const result = buildAssistPlaylist("Hello Ada welcome to the demo");
    expect(result.lexicalHits).toBeGreaterThanOrEqual(3); // hello, welcome, demo
    expect(result.fingerspellTokens).toBe(1); // Ada
    expect(result.steps.some((s) => s.kind === "lexical" && s.gloss === "HELLO")).toBe(
      true,
    );
    expect(
      result.steps.filter((s) => s.kind === "fingerspell").map((s) => s.letter),
    ).toEqual(["A", "D", "A"]);
  });

  it("tokenizes captions conservatively", () => {
    expect(tokenizeCaption("Hello, friends!")).toEqual(["hello", "friends"]);
  });

  it("selects playlist step by elapsed time", () => {
    const { steps } = buildAssistPlaylist("Hello thanks");
    expect(steps.length).toBeGreaterThanOrEqual(2);
    const first = stepAtElapsed(steps, 10);
    expect(first?.kind).toBe("lexical");
    const later = stepAtElapsed(steps, (steps[0]?.durationMs ?? 0) + 10);
    expect(later?.kind).toBe("lexical");
  });
});
