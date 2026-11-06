import { describe, expect, it } from "vitest";
import { computeLagMs, findActiveCue, parseSimpleVtt, syncToCaptions } from "./index.js";
import type { CaptionCue } from "@asl/shared-types";

const FIXTURE: CaptionCue[] = [
  { id: "1", startMs: 0, endMs: 2000, text: "Hello" },
  { id: "2", startMs: 2000, endMs: 4000, text: "world" },
];

describe("caption sync", () => {
  it("finds the active cue by media time", () => {
    expect(findActiveCue(FIXTURE, 500)?.id).toBe("1");
    expect(findActiveCue(FIXTURE, 2500)?.id).toBe("2");
    expect(findActiveCue(FIXTURE, 9000)).toBeNull();
  });

  it("computes lag (positive when overlay behind)", () => {
    expect(computeLagMs(1000, 800)).toBe(200);
    expect(computeLagMs(1000, 1200)).toBe(-200);
  });

  it("reports withinWindow against max lag", () => {
    const ok = syncToCaptions(FIXTURE, 1000, 900, 500);
    expect(ok.withinWindow).toBe(true);
    expect(ok.activeCue?.text).toBe("Hello");

    const late = syncToCaptions(FIXTURE, 1000, 100, 500);
    expect(late.withinWindow).toBe(false);
  });

  it("parses simple VTT fixtures", () => {
    const vtt = `WEBVTT

00:00.000 --> 00:02.000
Hello friends

00:02.000 --> 00:04.500
Welcome
`;
    const cues = parseSimpleVtt(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0]?.text).toBe("Hello friends");
    expect(cues[1]?.endMs).toBe(4500);
  });
});
