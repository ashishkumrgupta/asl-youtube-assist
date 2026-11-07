import { afterEach, describe, expect, it } from "vitest";
import { CLIP_PACK_MANIFEST, clipPackIsPending } from "./clip-source.js";
import { buildAssistPlaylist } from "./playlist.js";
import {
  bindPairClipPack,
  previewTierBIngest,
  resetTierBRuntimeMaps,
} from "./tier-b-ingest.js";

afterEach(() => {
  resetTierBRuntimeMaps();
});

const baseVolunteer = {
  sourceId: "volunteer-deaf" as const,
  provenance: "volunteer" as const,
  license: null,
  deafProduced: true,
  syntheticPersona: false,
  attributionUrl: "https://example.com/credits",
  assetNamespace: "ase",
};

describe("Tier B ingest fail-closed", () => {
  it("rejects NC research sourceIds", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      sourceId: "wlasl",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.webm",
          qaPass: true,
          releaseOnFile: true,
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => /NC|stop-ship/i.test(e))).toBe(true);
    }
    expect(clipPackIsPending()).toBe(true);
  });

  it("rejects syntheticPersona", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      syntheticPersona: true,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.webm",
          qaPass: true,
          releaseOnFile: true,
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
  });

  it("rejects PopSign/open_cc gloss without qaPass (RV0-4)", () => {
    const result = bindPairClipPack({
      sourceId: "popsign-cc-by",
      provenance: "open_cc",
      license: "CC BY 4.0",
      deafProduced: false,
      syntheticPersona: false,
      attributionUrl: "https://www.popsign.org/",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.webm",
          qaPass: false,
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(clipPackIsPending()).toBe(true);
  });

  it("rejects volunteer gloss without releaseOnFile", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.webm",
          qaPass: true,
          releaseOnFile: false,
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(clipPackIsPending()).toBe(true);
  });

  it("rejects ins namespace", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      assetNamespace: "ins",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: "lexical/ase/clips/HELLO.webm",
          qaPass: true,
          releaseOnFile: true,
        },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("binds volunteer test-only fixture when release+QA present", () => {
    const result = bindPairClipPack({
      ...baseVolunteer,
      sourceId: "test-fixture-only",
      note: "CI dry-run fixture",
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
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(CLIP_PACK_MANIFEST.status).toBe("loaded");
    expect(CLIP_PACK_MANIFEST.provenance).toBe("volunteer");
    expect(CLIP_PACK_MANIFEST.boundGlosses).toEqual(["HELLO"]);
    expect(CLIP_PACK_MANIFEST.note).toMatch(/TEST-ONLY/i);

    const playlist = buildAssistPlaylist("Hello friends");
    expect(playlist.clipPackPending).toBe(false);
    const hello = playlist.steps.find((s) => s.kind === "lexical" && s.gloss === "HELLO");
    expect(hello?.kind).toBe("lexical");
    if (hello?.kind === "lexical") {
      expect(hello.assetPath).toBe("lexical/ase/clips/HELLO.test-only.webm");
      expect(hello.noClipFallback).toBe(false);
    }
    const friend = playlist.steps.find(
      (s) => s.kind === "lexical" && s.gloss === "FRIEND",
    );
    if (friend?.kind === "lexical") {
      expect(friend.assetPath).toBeNull();
      expect(friend.noClipFallback).toBe(true);
    }
  });

  it("previewTierBIngest does not mutate the live pack", () => {
    const preview = previewTierBIngest({
      ...baseVolunteer,
      sourceId: "test-fixture-only",
      glossFiles: [
        {
          gloss: "YES",
          relativePath: "lexical/ase/clips/YES.test-only.webm",
          qaPass: true,
          releaseOnFile: true,
          testOnly: true,
        },
      ],
    });
    expect(preview.ok).toBe(true);
    expect(CLIP_PACK_MANIFEST.status).toBe("pending");
    expect(clipPackIsPending()).toBe(true);
  });

  it("binds remote_link without local path (no CDN mirror)", () => {
    const result = bindPairClipPack({
      sourceId: "remote-link-allowlist",
      provenance: "remote_link",
      license: null,
      deafProduced: false,
      syntheticPersona: false,
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
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const playlist = buildAssistPlaylist("Hello");
    const hello = playlist.steps.find((s) => s.kind === "lexical" && s.gloss === "HELLO");
    expect(hello?.kind).toBe("lexical");
    if (hello?.kind === "lexical") {
      expect(hello.assetPath).toBeNull();
      expect(hello.remoteUrl).toBe("https://www.popsign.org/");
      expect(hello.noClipFallback).toBe(false);
    }
  });

  it("rejects remote_link with arbitrary https not on allowlist", () => {
    const result = bindPairClipPack({
      sourceId: "remote-link-allowlist",
      provenance: "remote_link",
      license: null,
      deafProduced: false,
      syntheticPersona: false,
      attributionUrl: "https://www.popsign.org/",
      glossFiles: [
        {
          gloss: "HELLO",
          relativePath: null,
          qaPass: true,
          remoteUrl: "https://evil.example/sign.mp4",
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(clipPackIsPending()).toBe(true);
  });
});
