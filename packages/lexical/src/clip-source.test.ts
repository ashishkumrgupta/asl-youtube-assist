import { afterEach, describe, expect, it } from "vitest";
import { CLIP_PACK_MANIFEST, clipPackIsPending } from "./clip-source.js";
import { buildAssistPlaylist } from "./playlist.js";
import { resetTierBRuntimeMaps } from "./tier-b-ingest.js";

afterEach(() => {
  resetTierBRuntimeMaps();
});

describe("clip source hold", () => {
  it("does not lock a loaded third-party or persona pack yet", () => {
    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
    expect(CLIP_PACK_MANIFEST.syntheticPersona).toBe(false);
    expect(CLIP_PACK_MANIFEST.sourceId).toBeNull();
    expect(CLIP_PACK_MANIFEST.provenance).toBeNull();
    expect(CLIP_PACK_MANIFEST.boundGlosses).toEqual([]);
    expect(clipPackIsPending()).toBe(true);
  });

  it("playlist still produces gloss + fingerspell cues with null media paths", () => {
    const result = buildAssistPlaylist("Hello Ada");
    expect(result.clipPackPending).toBe(true);
    expect(
      result.steps
        .filter((s) => s.kind === "lexical" || s.kind === "fingerspell")
        .every((s) => s.assetPath === null),
    ).toBe(true);
    expect(result.lexicalHits).toBeGreaterThanOrEqual(1);
    expect(result.fingerspellTokens).toBe(1);
    const hello = result.steps.find((s) => s.kind === "lexical" && s.gloss === "HELLO");
    expect(hello?.kind).toBe("lexical");
    if (hello?.kind === "lexical") {
      expect(hello.noClipFallback).toBe(true);
      expect(hello.remoteUrl).toBeNull();
    }
  });
});
