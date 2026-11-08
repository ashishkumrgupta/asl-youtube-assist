import { describe, expect, it } from "vitest";
import {
  defaultsForEnv,
  experimentalSigningOffInProd,
  isEnabled,
  laterPhaseFlagsOffInProd,
  realVideoMediaFlagsOffInProd,
} from "./index.js";

describe("feature flags", () => {
  it("enables Slice A overlay + lexical + gloss + stitch in local", () => {
    expect(isEnabled("local", "assist.overlay.v1")).toBe(true);
    expect(isEnabled("local", "assist.lexical.v1")).toBe(true);
    expect(isEnabled("local", "assist.gloss.v1")).toBe(true);
    expect(isEnabled("local", "assist.stitching.v2")).toBe(true);
  });

  it("keeps neural / study / ISL-live / interpretation allow-list off in production", () => {
    expect(isEnabled("production", "avatar.neural")).toBe(false);
    expect(isEnabled("production", "mode.study")).toBe(false);
    expect(isEnabled("production", "pairs.ins.live")).toBe(false);
    expect(isEnabled("production", "i18n.sign_pairs")).toBe(true);
    expect(isEnabled("production", "claim.interpretation_allowlist")).toBe(false);
    expect(experimentalSigningOffInProd("production")).toBe(true);
    expect(laterPhaseFlagsOffInProd("production")).toBe(true);
  });

  it("real-video-0 / dual-path-0: PopSign + volunteer + AI media flags off; link-out on (no CDN)", () => {
    expect(isEnabled("production", "assist.popsign.v1")).toBe(false);
    expect(isEnabled("production", "assist.volunteer.v1")).toBe(false);
    expect(isEnabled("production", "assist.ai_generated.v1")).toBe(false);
    expect(isEnabled("local", "assist.popsign.v1")).toBe(false);
    expect(isEnabled("local", "assist.volunteer.v1")).toBe(false);
    expect(isEnabled("local", "assist.ai_generated.v1")).toBe(false);
    expect(isEnabled("production", "assist.remote_link.v1")).toBe(true);
    expect(realVideoMediaFlagsOffInProd("production")).toBe(true);
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
