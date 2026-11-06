/**
 * Fixture-based Phase 0 smoke (no live YouTube).
 * Covers AC-0.2 sync path + AC-0.5 lexical/fingerspell scaffolding + honesty constants.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { evaluateCriticalGate } from "@asl/critical-gate";
import { CLIP_PACK_MANIFEST, buildAssistPlaylist } from "@asl/lexical";
import { lintAssistCopy } from "@asl/lint-copy";
import { ASSIST_DISCLAIMER, ASSIST_LABEL } from "@asl/shared-types";
import { parseSimpleVtt, syncToCaptions } from "@asl/sync";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/captions",
);

describe("Phase 0 fixture smoke", () => {
  it("sideload path constants stay assist-only", () => {
    expect(ASSIST_LABEL).toBe("ASL assist / partial");
    expect(lintAssistCopy(ASSIST_DISCLAIMER, "assist")).toEqual([]);
  });

  it("clip pack remains pending (no persona / third-party lock-in)", () => {
    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
    expect(CLIP_PACK_MANIFEST.syntheticPersona).toBe(false);
  });

  it("caption fixture sync + lexical playlist smoke", () => {
    const vtt = readFileSync(join(fixturesDir, "phase0-hello.vtt"), "utf8");
    const cues = parseSimpleVtt(vtt);
    const at = syncToCaptions(cues, 500, 500, 500);
    expect(at.withinWindow).toBe(true);
    expect(at.activeCue?.text).toContain("Hello");

    const playlist = buildAssistPlaylist(at.activeCue?.text ?? "");
    expect(playlist.lexicalHits).toBeGreaterThan(0);
    expect(playlist.clipPackPending).toBe(true);
  });

  it("critical-domain gate still hard-blocks unsupervised assist", () => {
    const result = evaluateCriticalGate({
      domains: ["medical"],
      humanPathAvailable: false,
    });
    expect(result.blocked).toBe(true);
    expect(result.userMessage?.toLowerCase()).toContain("not content understanding");
  });
});
