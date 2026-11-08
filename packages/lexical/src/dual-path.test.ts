import { afterEach, describe, expect, it } from "vitest";
import {
  AI_INTERIM_STAGE_HINT,
  AI_SOURCE_SHORT,
  VOLUNTEER_SOURCE_SHORT,
} from "./honesty.js";
import { buildAssistPlaylist } from "./playlist.js";
import { bindPairClipPack, resetTierBRuntimeMaps } from "./tier-b-ingest.js";
import {
  getAiBinding,
  getRealBinding,
  resolveMediaForGloss,
  stopShippingAiForGloss,
  stopShippingAiWave,
} from "./dual-path.js";

afterEach(() => {
  resetTierBRuntimeMaps();
});

const baseAi = {
  sourceId: "ai-hf-test-fixture" as const,
  provenance: "ai_generated" as const,
  license: null,
  deafProduced: false,
  syntheticPersona: false,
  aiGenerated: true,
  generatorModelId: "test-hf-stub/v0",
  attributionUrl: "https://example.com/ai-fixture",
  assetNamespace: "ase",
};

const baseVolunteer = {
  sourceId: "test-fixture-only" as const,
  provenance: "volunteer" as const,
  license: null,
  deafProduced: true,
  syntheticPersona: false,
  aiGenerated: false,
  attributionUrl: "https://example.com/credits",
  assetNamespace: "ase",
};

describe("dual-path-0 prefer-real + AI fail-closed", () => {
  it("rejects unlabeled syntheticPersona even with ai_generated fields missing", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      syntheticPersona: true,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.test-only.webm",
          qaPass: true,
          releaseOnFile: true,
          testOnly: true,
        },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects AI without aiGenerated: true (never null-while-AI)", () => {
    const result = bindPairClipPack({
      ...baseAi,
      aiGenerated: false,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
          deafDisposition: "pass",
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => /aiGenerated/i.test(e))).toBe(true);
    }
  });

  it("rejects production AI sourceId before Deaf disposition (AC-DP0.10)", () => {
    const result = bindPairClipPack({
      ...baseAi,
      sourceId: "volunteer-deaf",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          deafDisposition: "pass",
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => /AC-DP0\.10|disposition/i.test(e))).toBe(true);
    }
  });

  it("binds AI test-only fixture for CI dry-run", () => {
    const result = bindPairClipPack({
      ...baseAi,
      note: "CI AI dry-run — not gold",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
          deafDisposition: "pass",
          waveId: "wave-ci-0",
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.manifest.provenance).toBe("ai_generated");
    expect(result.manifest.aiGenerated).toBe(true);
    expect(result.manifest.generatorModelId).toBe("test-hf-stub/v0");
    expect(getAiBinding("HELLO")?.testOnly).toBe(true);
  });

  it("flag OFF: AI bound but playlist does not play AI asset", () => {
    bindPairClipPack({
      ...baseAi,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
        },
      ],
    });
    const playlist = buildAssistPlaylist("Hello", undefined, {
      aiFlagEnabled: false,
    });
    const hello = playlist.steps.find((s) => s.kind === "lexical" && s.gloss === "HELLO");
    expect(hello?.kind).toBe("lexical");
    if (hello?.kind === "lexical") {
      expect(hello.assetPath).toBeNull();
      expect(hello.mediaKind).toBe("none");
      expect(hello.noClipFallback).toBe(true);
    }
  });

  it("flag ON + testOnly: plays AI with Deaf honesty string", () => {
    bindPairClipPack({
      ...baseAi,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
        },
      ],
    });
    const playlist = buildAssistPlaylist("Hello", undefined, {
      aiFlagEnabled: true,
      allowTestOnlyAi: true,
    });
    const hello = playlist.steps.find((s) => s.kind === "lexical" && s.gloss === "HELLO");
    expect(hello?.kind).toBe("lexical");
    if (hello?.kind === "lexical") {
      expect(hello.assetPath).toBe("lexical/ase/clips/HELLO.ai-test-only.webm");
      expect(hello.mediaKind).toBe("ai_generated");
      expect(hello.honestyShortTag).toBe(AI_SOURCE_SHORT);
      expect(hello.stageHint).toBe(AI_INTERIM_STAGE_HINT);
    }
  });

  it("prefer-real: real bind demotes AI for the same gloss", () => {
    bindPairClipPack({
      ...baseAi,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
        },
      ],
    });
    expect(getAiBinding("HELLO")).not.toBeNull();

    const real = bindPairClipPack({
      ...baseVolunteer,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.test-only.webm",
          qaPass: true,
          releaseOnFile: true,
          testOnly: true,
        },
      ],
    });
    expect(real.ok).toBe(true);
    if (real.ok) {
      expect(real.demotedAiGlosses).toContain("HELLO");
    }
    expect(getAiBinding("HELLO")).toBeNull();
    expect(getRealBinding("HELLO")?.path).toBe("lexical/ase/clips/HELLO.test-only.webm");

    const resolved = resolveMediaForGloss("HELLO", {
      aiFlagEnabled: true,
      allowTestOnlyAi: true,
    });
    expect(resolved.kind).toBe("real");
    expect(resolved.honestyShortTag).toBe(VOLUNTEER_SOURCE_SHORT);
    expect(resolved.assetPath).toBe("lexical/ase/clips/HELLO.test-only.webm");
  });

  it("stop shipping AI for gloss / wave on Deaf fail path", () => {
    bindPairClipPack({
      ...baseAi,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
          waveId: "wave-ci-0",
        },
        {
          gloss: "THANKS",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
          waveId: "wave-ci-0",
        },
      ],
    });
    expect(stopShippingAiForGloss("HELLO")).toBe(true);
    expect(getAiBinding("HELLO")).toBeNull();
    expect(getAiBinding("THANKS")).not.toBeNull();
    expect(stopShippingAiWave("wave-ci-0")).toEqual(["THANKS"]);
    expect(getAiBinding("THANKS")).toBeNull();
  });

  it("fallback order: AI (flag off) → remote_link when no real", () => {
    bindPairClipPack({
      ...baseAi,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.ai-test-only.webm",
          qaPass: true,
          testOnly: true,
        },
      ],
    });
    bindPairClipPack({
      sourceId: "remote-link-allowlist",
      provenance: "remote_link",
      license: null,
      deafProduced: false,
      syntheticPersona: false,
      aiGenerated: false,
      attributionUrl: "https://www.popsign.org/",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: null,
          qaPass: true,
          remoteUrl: "https://www.popsign.org/",
        },
      ],
    });
    const resolved = resolveMediaForGloss("HELLO", { aiFlagEnabled: false });
    expect(resolved.kind).toBe("remote_link");
    expect(resolved.remoteUrl).toBe("https://www.popsign.org/");
  });
});
