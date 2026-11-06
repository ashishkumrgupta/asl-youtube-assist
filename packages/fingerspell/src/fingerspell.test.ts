import { describe, expect, it } from "vitest";
import { fingerspellLabel, fingerspellToken } from "./index.js";

describe("fingerspell OOV", () => {
  it("expands letters into sequential steps (no media while pack pending)", () => {
    const steps = fingerspellToken("Ada");
    expect(steps).toHaveLength(3);
    expect(fingerspellLabel(steps)).toBe("A-D-A");
    expect(steps[0]?.assetPath).toBeNull();
  });

  it("binds letter media paths only when packLoaded", () => {
    const steps = fingerspellToken("Ada", 450, true);
    expect(steps[0]?.assetPath).toBe("lexical/fingerspell/A.webm");
  });

  it("skips non-letters", () => {
    expect(fingerspellToken("A1!")).toHaveLength(1);
  });
});
