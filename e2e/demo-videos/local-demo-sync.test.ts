/**
 * Local demo-video fixtures — caption sync / overlay state without live YouTube.
 * Signing video is NOT claimed; pack remains pending. These prove cue→gloss UI.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { conservativeGloss } from "@asl/gloss";
import { CLIP_PACK_MANIFEST, buildAssistPlaylist } from "@asl/lexical";
import { parseSimpleVtt, syncToCaptions } from "@asl/sync";
import { advanceAssistFrame, emptyAssistClock } from "@asl/assist-runtime";

const demoDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/demo-videos",
);

function loadDemo(id: string): { vtt: string; videoPath: string } {
  const vtt = readFileSync(join(demoDir, `${id}.vtt`), "utf8");
  return { vtt, videoPath: join(demoDir, `${id}.mp4`) };
}

describe("local demo videos (no live YouTube)", () => {
  it("manifest lists generated demos and pack stays pending", () => {
    const manifest = JSON.parse(readFileSync(join(demoDir, "manifest.json"), "utf8")) as {
      demos: Array<{ id: string }>;
      purpose: string;
    };
    expect(manifest.demos.length).toBeGreaterThanOrEqual(5);
    expect(manifest.purpose.toLowerCase()).toContain("not signing-video");
    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
    for (const demo of manifest.demos) {
      const { videoPath } = loadDemo(demo.id);
      expect(readFileSync(videoPath).byteLength).toBeGreaterThan(1000);
    }
  });

  it("01-hello: cues advance and assist frame leaves waiting state", () => {
    const { vtt } = loadDemo("01-hello");
    const cues = parseSimpleVtt(vtt);
    expect(cues.length).toBeGreaterThanOrEqual(2);

    const atHello = syncToCaptions(cues, 500, 500, 500);
    expect(atHello.withinWindow).toBe(true);
    expect(atHello.activeCue?.text.toLowerCase()).toContain("hello");

    let clock = emptyAssistClock();
    const frame1 = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 500,
      routingLine: "Assist · Tier B",
      tierAEmptyState: "Tier A empty · not human interpretation",
      clock,
    });
    clock = frame1.clock;
    expect(frame1.renderKey).not.toBe("idle");
    expect(frame1.viewModel.activeCaption?.toLowerCase()).toContain("hello");

    const frame2 = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 3000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: "Tier A empty · not human interpretation",
      clock,
    });
    expect(frame2.viewModel.activeCaption?.toLowerCase()).toContain("welcome");
  });

  it("03-oov: playlist includes fingerspell path", () => {
    const { vtt } = loadDemo("03-oov");
    const cues = parseSimpleVtt(vtt);
    const cue = syncToCaptions(cues, 800, 800, 500).activeCue;
    expect(cue).toBeTruthy();
    const playlist = buildAssistPlaylist(cue!.text);
    expect(playlist.clipPackPending).toBe(true);
    expect(
      playlist.steps.some((s) => s.kind === "fingerspell") ||
        playlist.fingerspellTokens > 0,
    ).toBe(true);
  });

  it("04-wh-time: gloss contains TIME/WH style tokens", () => {
    const { vtt } = loadDemo("04-wh-time");
    const cues = parseSimpleVtt(vtt);
    const cue = syncToCaptions(cues, 800, 800, 500).activeCue;
    expect(cue?.text.toLowerCase()).toContain("what");
    const gloss = conservativeGloss(cue!.text);
    expect(gloss.claimsFluentAsl).toBe(false);
    expect(gloss.glossLine.length).toBeGreaterThan(0);
  });

  it("05-gaps: idle between cue windows (waiting state)", () => {
    const { vtt } = loadDemo("05-gaps");
    const cues = parseSimpleVtt(vtt);
    const midGap = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 3000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock: emptyAssistClock(),
    });
    expect(midGap.renderKey).toBe("idle");
    expect(midGap.viewModel.activeStep).toBeNull();

    const onCue = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 1000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock: emptyAssistClock(),
    });
    expect(onCue.renderKey).not.toBe("idle");
    expect(onCue.viewModel.activeCaption?.toLowerCase()).toContain("hello");
  });
});
