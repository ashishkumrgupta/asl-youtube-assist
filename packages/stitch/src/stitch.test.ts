import { describe, expect, it } from "vitest";
import type { AssistPlaylistStep } from "@asl/lexical";
import { stitchIntoCue, stepAtElapsedStitched } from "./index.js";

function lex(gloss: string, durationMs: number): AssistPlaylistStep {
  return {
    kind: "lexical",
    gloss,
    assetPath: null,
    durationMs,
    surface: gloss.toLowerCase(),
  };
}

describe("stitch/timing (Phase 1 vs Phase 0 overrun)", () => {
  it("fits long playlists into a short cue without exceeding duration", () => {
    const steps = [lex("A", 900), lex("B", 900), lex("C", 900), lex("D", 900)];
    const stitched = stitchIntoCue(steps, 1500);
    const total = stitched.steps.reduce((s, x) => s + x.durationMs, 0);
    expect(total).toBeLessThanOrEqual(1500);
    expect(stitched.truncated || stitched.scale < 1).toBe(true);
  });

  it("selects active step by elapsed time after stitch", () => {
    const stitched = stitchIntoCue([lex("HELLO", 800), lex("FRIEND", 800)], 2000);
    expect(stepAtElapsedStitched(stitched.steps, 10)?.kind).toBe("lexical");
    if (stitched.steps[0]) {
      const second = stepAtElapsedStitched(
        stitched.steps,
        stitched.steps[0].durationMs + 10,
      );
      expect(second?.kind).toBe("lexical");
    }
  });
});
