import { describe, expect, it } from "vitest";
import { advanceAssistFrame, emptyAssistClock } from "@asl/assist-runtime";
import {
  DOM_CAPTION_EMPTY_HOLD_TICKS,
  DomCaptionTracker,
  captionTextId,
  collectCaptionCues,
  domCaptionAsLiveCue,
  getVideoElement,
  isSameCaptionWindow,
  readDomCaptionText,
  resetDomCaptionTracker,
  sanitizeCaptionText,
} from "./captions.js";

function mockRootWithWindow(segmentTexts: string[]): ParentNode {
  const segments = segmentTexts.map((textContent) => ({
    textContent,
    hidden: false,
    getAttribute: () => null,
    style: { cssText: "" },
  }));
  const win = {
    hidden: false,
    getAttribute: () => null,
    style: { cssText: "" },
    querySelectorAll(sel: string) {
      if (sel.includes("ytp-caption-segment") || sel.includes("data-asl-demo")) {
        return segments as unknown as NodeListOf<Element>;
      }
      return [] as unknown as NodeListOf<Element>;
    },
  };
  return {
    querySelectorAll(selector: string) {
      if (selector.includes("ytp-caption-window-container")) {
        return [win] as unknown as NodeListOf<Element>;
      }
      if (selector.includes("ytp-caption-segment")) {
        return segments as unknown as NodeListOf<Element>;
      }
      return [] as unknown as NodeListOf<Element>;
    },
    querySelector() {
      return null;
    },
  } as unknown as ParentNode;
}

function emptyTracksVideo(currentTime = 1): HTMLVideoElement {
  return {
    currentTime,
    textTracks: { length: 0 },
  } as unknown as HTMLVideoElement;
}

describe("caption sanitize", () => {
  it("strips tags and truncates", () => {
    expect(sanitizeCaptionText("<c>Hello</c>  world")).toBe("Hello world");
    expect(sanitizeCaptionText("a".repeat(600)).length).toBe(500);
  });
});

describe("getVideoElement (no generic video fallback)", () => {
  it("returns html5-main-video when present", () => {
    const main = { id: "main" };
    const root = {
      querySelector(sel: string) {
        if (sel === "video.html5-main-video") return main;
        return null;
      },
    } as unknown as ParentNode;
    expect(getVideoElement(root)).toBe(main);
  });

  it("returns demo selector when no YT main video", () => {
    const demo = { id: "demo" };
    const root = {
      querySelector(sel: string) {
        if (sel.includes("data-asl-demo-video")) return demo;
        return null;
      },
    } as unknown as ParentNode;
    expect(getVideoElement(root)).toBe(demo);
  });

  it("does not bind a generic video (ads/endscreens)", () => {
    const random = { id: "ad" };
    const root = {
      querySelector(sel: string) {
        if (sel === "video") return random;
        return null;
      },
    } as unknown as ParentNode;
    expect(getVideoElement(root)).toBeNull();
  });
});

describe("DOM caption window identity", () => {
  it("treats prefix growth as the same visual window", () => {
    expect(isSameCaptionWindow("Hello", "Hello friends")).toBe(true);
    expect(isSameCaptionWindow("Hello friends", "Hello")).toBe(true);
    expect(isSameCaptionWindow("Hello", "Welcome")).toBe(false);
  });

  it("hash helper stays deterministic", () => {
    expect(captionTextId("Hello")).toBe(captionTextId("Hello"));
    expect(captionTextId("Hello")).not.toBe(captionTextId("Welcome"));
  });

  it("sliding live cue covers current media time with stable explicit id", () => {
    const cue = domCaptionAsLiveCue("Hello friends", 1500, 3000, "dom-live-1");
    expect(cue.text).toBe("Hello friends");
    expect(cue.id).toBe("dom-live-1");
    expect(cue.startMs).toBeLessThanOrEqual(1500);
    expect(cue.endMs).toBeGreaterThan(1500);
  });
});

describe("YouTube DOM multi-tick fallback (senior review)", () => {
  it("collectCaptionCues falls back to DOM when tracks empty", () => {
    resetDomCaptionTracker();
    const root = mockRootWithWindow(["Hello friends"]);
    const video = emptyTracksVideo(1.25);
    expect(readDomCaptionText(root)).toBe("Hello friends");
    const collected = collectCaptionCues(video, {
      root,
      mediaTimeMs: 1250,
    });
    expect(collected.source).toBe("dom_live");
    expect(collected.cues).toHaveLength(1);
    expect(collected.cues[0]?.text).toBe("Hello friends");
  });

  it("progressive caption text keeps the same live cue id (no thrash)", () => {
    const tracker = new DomCaptionTracker();
    const root1 = mockRootWithWindow(["Hello"]);
    const root2 = mockRootWithWindow(["Hello friends"]);
    const video = emptyTracksVideo();

    const a = collectCaptionCues(video, {
      root: root1,
      mediaTimeMs: 500,
      tracker,
    });
    const b = collectCaptionCues(video, {
      root: root2,
      mediaTimeMs: 800,
      tracker,
    });
    expect(a.cues[0]?.id).toBe(b.cues[0]?.id);
    expect(b.cues[0]?.text).toBe("Hello friends");

    let clock = emptyAssistClock();
    const f1 = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues: a.cues,
      mediaMs: 500,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    clock = f1.clock;
    const f2 = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues: b.cues,
      mediaMs: 800,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    expect(f2.clock.lastCueId).toBe(f1.clock.lastCueId);
    expect(f2.viewModel.activeCaption).toBe("Hello friends");
  });

  it("same DOM text across ticks with advancing mediaTime stays active", () => {
    const tracker = new DomCaptionTracker();
    const root = mockRootWithWindow(["Hello friends"]);
    const video = emptyTracksVideo();

    let clock = emptyAssistClock();
    const times = [1000, 1100, 1200, 1300];
    for (const mediaMs of times) {
      const collected = collectCaptionCues(video, {
        root,
        mediaTimeMs: mediaMs,
        tracker,
      });
      expect(collected.source).toBe("dom_live");
      const frame = advanceAssistFrame({
        enabled: true,
        languagePairId: "en-ase",
        cues: collected.cues,
        mediaMs,
        routingLine: "Assist · Tier B",
        tierAEmptyState: null,
        clock,
      });
      clock = frame.clock;
      expect(frame.renderKey).not.toBe("idle");
      expect(frame.viewModel.activeCaption).toBe("Hello friends");
    }
    expect(clock.lastCueId).toBeTruthy();
  });

  it("brief empty DOM ticks hold the last cue; then idle", () => {
    const tracker = new DomCaptionTracker();
    const withText = mockRootWithWindow(["Hello"]);
    const emptyRoot = mockRootWithWindow([]);
    const video = emptyTracksVideo();

    const first = collectCaptionCues(video, {
      root: withText,
      mediaTimeMs: 500,
      tracker,
    });
    expect(first.source).toBe("dom_live");
    const heldId = first.cues[0]?.id;

    for (let i = 0; i < DOM_CAPTION_EMPTY_HOLD_TICKS; i += 1) {
      const held = collectCaptionCues(video, {
        root: emptyRoot,
        mediaTimeMs: 600 + i * 100,
        tracker,
      });
      expect(held.source).toBe("dom_live");
      expect(held.cues[0]?.id).toBe(heldId);
    }

    const gone = collectCaptionCues(video, {
      root: emptyRoot,
      mediaTimeMs: 2000,
      tracker,
    });
    expect(gone.source).toBe("none");
    expect(gone.cues).toHaveLength(0);
  });

  it("new non-prefix caption opens a new live id (playlist can rebuild)", () => {
    const tracker = new DomCaptionTracker();
    const video = emptyTracksVideo();
    const a = collectCaptionCues(video, {
      root: mockRootWithWindow(["Hello friends"]),
      mediaTimeMs: 500,
      tracker,
    });
    const b = collectCaptionCues(video, {
      root: mockRootWithWindow(["Welcome everyone"]),
      mediaTimeMs: 2000,
      tracker,
    });
    expect(a.cues[0]?.id).not.toBe(b.cues[0]?.id);
  });

  it("de-dupes identical segment text within the active window", () => {
    const root = mockRootWithWindow(["Hello", "Hello", "friends"]);
    expect(readDomCaptionText(root)).toBe("Hello friends");
  });
});
