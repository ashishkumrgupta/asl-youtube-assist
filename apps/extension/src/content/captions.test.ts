import { describe, expect, it } from "vitest";
import { sanitizeCaptionText } from "./captions.js";

describe("caption sanitize", () => {
  it("strips tags and truncates", () => {
    expect(sanitizeCaptionText("<c>Hello</c>  world")).toBe("Hello world");
    expect(sanitizeCaptionText("a".repeat(600)).length).toBe(500);
  });
});
