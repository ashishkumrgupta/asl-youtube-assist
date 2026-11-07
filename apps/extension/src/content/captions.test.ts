import { describe, expect, it } from "vitest";
import {
  captionTextId,
  collectCaptionCues,
  domCaptionAsLiveCue,
  readDomCaptionText,
  sanitizeCaptionText,
} from "./captions.js";

describe("caption sanitize", () => {
  it("strips tags and truncates", () => {
    expect(sanitizeCaptionText("<c>Hello</c>  world")).toBe("Hello world");
    expect(sanitizeCaptionText("a".repeat(600)).length).toBe(500);
  });
});

describe("DOM caption → live cue (YouTube CC fallback)", () => {
  it("stable ids change when caption text changes", () => {
    expect(captionTextId("Hello")).toBe(captionTextId("Hello"));
    expect(captionTextId("Hello")).not.toBe(captionTextId("Welcome"));
  });

  it("sliding live cue covers current media time", () => {
    const cue = domCaptionAsLiveCue("Hello friends", 1500, 3000);
    expect(cue.text).toBe("Hello friends");
    expect(cue.startMs).toBeLessThanOrEqual(1500);
    expect(cue.endMs).toBeGreaterThan(1500);
    expect(cue.id).toBe(captionTextId("Hello friends"));
  });

  it("collectCaptionCues falls back to DOM when tracks empty", () => {
    const segment = { textContent: "Hello friends" };
    const root = {
      querySelectorAll(selector: string) {
        if (selector.includes("ytp-caption-segment")) {
          return [segment] as unknown as NodeListOf<Element>;
        }
        return [] as unknown as NodeListOf<Element>;
      },
    } as unknown as ParentNode;

    const video = {
      currentTime: 1.25,
      textTracks: { length: 0 },
    } as unknown as HTMLVideoElement;

    expect(readDomCaptionText(root)).toBe("Hello friends");
    const collected = collectCaptionCues(video, {
      root,
      mediaTimeMs: 1250,
    });
    expect(collected.source).toBe("dom_live");
    expect(collected.cues).toHaveLength(1);
    expect(collected.cues[0]?.text).toBe("Hello friends");
    expect(collected.cues[0]?.startMs).toBeLessThanOrEqual(1250);
    expect(collected.cues[0]?.endMs).toBeGreaterThan(1250);
  });
});
