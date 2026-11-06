import { describe, expect, it } from "vitest";
import { defaultsForEnv, experimentalSigningOffInProd, isEnabled } from "./index.js";

describe("feature flags", () => {
  it("enables Slice A overlay + lexical assist in local", () => {
    expect(isEnabled("local", "assist.overlay.v1")).toBe(true);
    expect(isEnabled("local", "assist.lexical.v1")).toBe(true);
  });

  it("keeps neural avatar and stitching off in production", () => {
    expect(isEnabled("production", "avatar.neural")).toBe(false);
    expect(isEnabled("production", "assist.stitching.v2")).toBe(false);
    expect(experimentalSigningOffInProd("production")).toBe(true);
  });

  it("honors explicit overrides", () => {
    expect(isEnabled("production", "avatar.neural", { "avatar.neural": true })).toBe(
      true,
    );
  });

  it("exposes interpreter_domains gate flag as on (critical-domain UX)", () => {
    expect(defaultsForEnv("production")["label.interpreter_domains"]).toBe(true);
  });
});
