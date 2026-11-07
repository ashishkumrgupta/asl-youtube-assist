import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { routeTiers } from "@asl/catalog";
import { conservativeGloss, isEnglishWordOrderPreserved } from "@asl/gloss";
import { CLIP_PACK_MANIFEST, buildPlaylistFromGloss } from "@asl/lexical";
import { lintAssistCopy } from "@asl/lint-copy";
import { GLOSS_UI_NOTE } from "@asl/shared-types";

const dir = dirname(fileURLToPath(import.meta.url));

describe("eval harness scaffolding (AC-1.5)", () => {
  it("loads fixture manifest and asserts gloss / tier / pack-pending", () => {
    const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as {
      notDeafLedProof: boolean;
      fixtures: Array<Record<string, unknown>>;
    };
    expect(manifest.notDeafLedProof).toBe(true);

    const glossFx = manifest.fixtures.find((f) => f.id === "p1a-gloss-wh-time")!;
    const gloss = conservativeGloss(String(glossFx.caption));
    expect(gloss.claimsFluentAsl).toBe(false);
    for (const part of glossFx.expectGlossContains as string[]) {
      expect(gloss.glossLine).toContain(part);
    }
    expect(isEnglishWordOrderPreserved(String(glossFx.caption), gloss)).toBe(false);

    const tierFx = manifest.fixtures.find((f) => f.id === "p1a-tier-empty")!;
    const route = routeTiers(String(tierFx.youtubeVideoId));
    expect(route.activeTier).toBe("B");
    expect(route.emptyState?.toLowerCase()).toContain("tier a empty");
    expect(route.emptyState?.toLowerCase()).toContain("not human interpretation");

    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
    const playlist = buildPlaylistFromGloss(gloss);
    expect(playlist.clipPackPending).toBe(true);
  });

  it("refuses usefulness marketing strings in UI notes", () => {
    expect(lintAssistCopy(GLOSS_UI_NOTE, "assist")).toEqual([]);
    expect(
      lintAssistCopy("Helps follow better than captions alone", "assist").length,
    ).toBeGreaterThan(0);
  });
});
