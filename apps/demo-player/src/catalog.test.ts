import { describe, expect, it } from "vitest";
import { ASSIST_HONESTY_LINE, ASSIST_LABEL } from "@asl/shared-types";
import {
  THEATER_DEMOS,
  THEATER_ORIGIN,
  brandCopy,
  demoById,
  watchHref,
} from "./catalog.js";

describe("local theater catalog", () => {
  it("lists 5–10 demos with media paths", () => {
    expect(THEATER_DEMOS.length).toBeGreaterThanOrEqual(5);
    expect(THEATER_DEMOS.length).toBeLessThanOrEqual(10);
    for (const demo of THEATER_DEMOS) {
      expect(demo.video).toMatch(/\.mp4$/);
      expect(demo.captions).toMatch(/\.vtt$/);
      expect(demo.id.length).toBeGreaterThan(0);
    }
  });

  it("resolves watch hrefs and brand honesty copy", () => {
    expect(demoById("01-hello")?.title).toBe("Hello");
    expect(watchHref("01-hello")).toBe("./watch?v=01-hello");
    expect(THEATER_ORIGIN).toBe("http://127.0.0.1:4173");
    const copy = brandCopy();
    expect(copy.label).toBe(ASSIST_LABEL);
    expect(copy.honesty).toBe(ASSIST_HONESTY_LINE);
    expect(copy.honesty.toLowerCase()).toContain("partial");
    expect(copy.label.toLowerCase()).not.toContain("interpreter");
  });
});
