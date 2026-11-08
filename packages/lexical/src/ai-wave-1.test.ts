import { afterEach, describe, expect, it } from "vitest";
import {
  AI_WAVE_1_GLOSSES,
  AI_WAVE_1_ID,
  AI_WAVE_1_SOURCE_ID,
  aiWave1PendingAssetPath,
  aiWave1ProductionAllowlist,
  isAiWave1Gloss,
  listAiWave1PendingPaths,
} from "./ai-wave-1.js";
import { AI_SOURCE_SHORT, VOLUNTEER_SOURCE_SHORT } from "./honesty.js";
import {
  bindAiGloss,
  bindRealGloss,
  resolveMediaForGloss,
  setAiAllowlist,
} from "./dual-path.js";
import { buildAssistPlaylist } from "./playlist.js";
import { bindPairClipPack, resetTierBRuntimeMaps } from "./tier-b-ingest.js";

afterEach(() => {
  resetTierBRuntimeMaps();
});

describe("ai-wave-1 thin HF allowlist stubs", () => {
  it("exposes ≤6 HF glosses matching product greeting/polarity set", () => {
    expect(AI_WAVE_1_GLOSSES).toHaveLength(6);
    expect(AI_WAVE_1_GLOSSES).toEqual(["HELLO", "THANKS", "YES", "NO", "PLEASE", "BAD"]);
    expect(AI_WAVE_1_ID).toBe("ai-wave-1");
    expect(AI_WAVE_1_SOURCE_ID).toBe("ai-hf-wave-1");
    expect(isAiWave1Gloss("thanks")).toBe(true);
    expect(isAiWave1Gloss("THANK-YOU")).toBe(false);
    expect(isAiWave1Gloss("SORRY")).toBe(false);
  });

  it("production allowlist stays empty (flag / Deaf disposition gate)", () => {
    expect(aiWave1ProductionAllowlist()).toEqual([]);
  });

  it("pending asset paths use *.ai-pending.webm under ase/clips", () => {
    expect(aiWave1PendingAssetPath("HELLO")).toBe(
      "lexical/ase/clips/HELLO.ai-pending.webm",
    );
    expect(listAiWave1PendingPaths()).toHaveLength(6);
    expect(listAiWave1PendingPaths().every((p) => p.includes(".ai-pending.webm"))).toBe(
      true,
    );
    expect(
      listAiWave1PendingPaths().every((p) => p.startsWith("lexical/ase/clips/")),
    ).toBe(true);
  });

  it("pending disposition AI does not play with flag OFF", () => {
    for (const gloss of AI_WAVE_1_GLOSSES) {
      bindAiGloss(gloss, {
        path: aiWave1PendingAssetPath(gloss),
        sourceId: AI_WAVE_1_SOURCE_ID,
        disposition: "pending",
        generatorModelId: "pending-external-video-gen/unspecified",
        testOnly: false,
        waveId: AI_WAVE_1_ID,
      });
    }
    setAiAllowlist([...AI_WAVE_1_GLOSSES]);

    for (const gloss of AI_WAVE_1_GLOSSES) {
      const resolved = resolveMediaForGloss(gloss, { aiFlagEnabled: false });
      expect(resolved.kind).not.toBe("ai_generated");
      expect(resolved.assetPath).toBeNull();
      expect(resolved.noClipFallback || resolved.kind === "remote_link").toBe(true);
    }

    const playlist = buildAssistPlaylist("Hello yes please", undefined, {
      aiFlagEnabled: false,
    });
    for (const step of playlist.steps) {
      if (step.kind === "lexical" && isAiWave1Gloss(step.gloss)) {
        expect(step.mediaKind).not.toBe("ai_generated");
        expect(step.assetPath).toBeNull();
      }
    }
  });

  it("pending disposition AI does not play even with flag ON + allowlist", () => {
    bindAiGloss("HELLO", {
      path: aiWave1PendingAssetPath("HELLO"),
      sourceId: AI_WAVE_1_SOURCE_ID,
      disposition: "pending",
      generatorModelId: "pending-external-video-gen/unspecified",
      testOnly: false,
      waveId: AI_WAVE_1_ID,
    });
    setAiAllowlist(["HELLO"]);
    const resolved = resolveMediaForGloss("HELLO", {
      aiFlagEnabled: true,
      allowTestOnlyAi: false,
    });
    expect(resolved.kind).not.toBe("ai_generated");
    expect(resolved.assetPath).toBeNull();
  });

  it("prefer-real still demotes wave-1 AI when volunteer binds", () => {
    bindAiGloss("HELLO", {
      path: aiWave1PendingAssetPath("HELLO"),
      sourceId: AI_WAVE_1_SOURCE_ID,
      disposition: "pass",
      generatorModelId: "pending-external-video-gen/unspecified",
      testOnly: false,
      waveId: AI_WAVE_1_ID,
    });
    setAiAllowlist(["HELLO"]);
    expect(resolveMediaForGloss("HELLO", { aiFlagEnabled: true }).kind).toBe(
      "ai_generated",
    );
    expect(resolveMediaForGloss("HELLO", { aiFlagEnabled: true }).honestyShortTag).toBe(
      AI_SOURCE_SHORT,
    );

    bindRealGloss("HELLO", {
      path: "lexical/ase/clips/HELLO.test-only.webm",
      provenance: "volunteer",
      sourceId: "test-fixture-only",
      testOnly: true,
    });

    const resolved = resolveMediaForGloss("HELLO", { aiFlagEnabled: true });
    expect(resolved.kind).toBe("real");
    expect(resolved.honestyShortTag).toBe(VOLUNTEER_SOURCE_SHORT);
    expect(resolved.assetPath).toBe("lexical/ase/clips/HELLO.test-only.webm");
  });

  it("ingest rejects ai-hf-wave-1 glosses still disposition pending (no prod bind)", () => {
    const result = bindPairClipPack({
      sourceId: AI_WAVE_1_SOURCE_ID,
      provenance: "ai_generated",
      license: null,
      deafProduced: false,
      syntheticPersona: false,
      aiGenerated: true,
      generatorModelId: "pending-external-video-gen/unspecified",
      attributionUrl: "https://example.com/ai-wave-1",
      assetNamespace: "ase",
      glossFiles: AI_WAVE_1_GLOSSES.map((gloss) => ({
        gloss,
        relativePath: aiWave1PendingAssetPath(gloss),
        qaPass: false,
        deafDisposition: "pending" as const,
        waveId: AI_WAVE_1_ID,
      })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejected.length).toBe(6);
      expect(
        result.rejected.every((r) =>
          /disposition|qaPass|AC-DP0\.10|DUAL-6/i.test(r.reason),
        ),
      ).toBe(true);
    }
  });
});
