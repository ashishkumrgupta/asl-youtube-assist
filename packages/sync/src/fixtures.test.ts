import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildAssistPlaylist } from "@asl/lexical";
import { parseSimpleVtt, syncToCaptions } from "./index.js";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/captions",
);

describe("named Phase 0 caption fixtures (AC-0.2)", () => {
  it("parses phase0-hello.vtt and syncs within lag window", () => {
    const vtt = readFileSync(join(fixturesDir, "phase0-hello.vtt"), "utf8");
    const expected = JSON.parse(
      readFileSync(join(fixturesDir, "phase0-sync-expected.json"), "utf8"),
    ) as {
      syncChecks: Array<{
        mediaTimeMs: number;
        expectedCueText: string;
        maxLagMs: number;
      }>;
      playlistChecks: Array<{
        captionText: string;
        minLexicalHits: number;
        minFingerspellTokens?: number;
        expectGloss?: string[];
      }>;
    };

    const cues = parseSimpleVtt(vtt);
    expect(cues).toHaveLength(3);

    for (const check of expected.syncChecks) {
      const sync = syncToCaptions(
        cues,
        check.mediaTimeMs,
        check.mediaTimeMs,
        check.maxLagMs,
      );
      expect(sync.activeCue?.text).toBe(check.expectedCueText);
      expect(sync.withinWindow).toBe(true);
    }

    for (const check of expected.playlistChecks) {
      const playlist = buildAssistPlaylist(check.captionText);
      expect(playlist.lexicalHits).toBeGreaterThanOrEqual(check.minLexicalHits);
      if (check.minFingerspellTokens !== undefined) {
        expect(playlist.fingerspellTokens).toBeGreaterThanOrEqual(
          check.minFingerspellTokens,
        );
      }
      if (check.expectGloss) {
        const glosses = playlist.steps
          .filter((s) => s.kind === "lexical")
          .map((s) => s.gloss);
        for (const g of check.expectGloss) {
          expect(glosses).toContain(g);
        }
      }
    }
  });

  it("parses phase0-oov.vtt for fingerspell path", () => {
    const vtt = readFileSync(join(fixturesDir, "phase0-oov.vtt"), "utf8");
    const cues = parseSimpleVtt(vtt);
    expect(cues[0]?.text).toBe("Hello Ada");
    const playlist = buildAssistPlaylist(cues[0]?.text ?? "");
    expect(playlist.fingerspellTokens).toBe(1);
    expect(playlist.clipPackPending).toBe(true);
  });
});
