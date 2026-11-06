import { describe, expect, it } from "vitest";
import { sanitizeCaptionText } from "./captions.js";

describe("sanitizeCaptionText (SEC caption XSS hygiene)", () => {
  it("strips tags and control chars; caps length", () => {
    expect(sanitizeCaptionText("<img src=x onerror=alert(1)>hi")).toBe("hi");
    expect(sanitizeCaptionText("a\u0000b\u0007c")).toBe("abc");
    expect(sanitizeCaptionText("x".repeat(600)).length).toBe(500);
  });
});
