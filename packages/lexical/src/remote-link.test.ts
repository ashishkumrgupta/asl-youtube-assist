import { describe, expect, it } from "vitest";
import type { AssistPlaylistStep } from "./playlist.js";
import {
  REMOTE_LINK_ALLOWLIST,
  findAllowlistedRemoteUrl,
  isAllowlistedRemoteUrl,
  resolveLinkOutForStep,
  validateRemoteUrl,
} from "./remote-link.js";

function lex(
  gloss: string,
  remoteUrl: string | null,
): AssistPlaylistStep {
  return {
    kind: "lexical",
    gloss,
    assetPath: null,
    remoteUrl,
    noClipFallback: remoteUrl === null,
    durationMs: 800,
    surface: gloss.toLowerCase(),
  };
}

describe("remote link allowlist", () => {
  it("accepts allowlisted https URLs", () => {
    const allowed = REMOTE_LINK_ALLOWLIST[0]!.url;
    expect(validateRemoteUrl(allowed)).toBeNull();
    expect(isAllowlistedRemoteUrl(allowed)).toBe(true);
    expect(findAllowlistedRemoteUrl(allowed)?.gloss).toBe("HELLO");
  });

  it("rejects arbitrary https not on the allowlist", () => {
    const evil = "https://evil.example/sign.mp4";
    expect(validateRemoteUrl(evil)).toMatch(/allowlist/i);
    expect(isAllowlistedRemoteUrl(evil)).toBe(false);
  });

  it("rejects non-https", () => {
    expect(validateRemoteUrl("http://www.popsign.org/")).toMatch(/https/i);
  });

  it("resolveLinkOutForStep opens allowlisted gloss discovery", () => {
    const resolved = resolveLinkOutForStep(lex("HELLO", null));
    expect(resolved?.url).toBe("https://www.popsign.org/");
    expect(resolved?.honesty.toLowerCase()).toContain("not our pack");
  });

  it("resolveLinkOutForStep refuses crafted non-allowlisted remoteUrl", () => {
    const crafted = lex("HELLO", "https://evil.example/sign.mp4");
    expect(resolveLinkOutForStep(crafted)).toBeNull();
  });

  it("resolveLinkOutForStep accepts allowlisted remoteUrl on step", () => {
    const ok = lex("HELLO", "https://www.popsign.org/");
    expect(resolveLinkOutForStep(ok)?.url).toBe("https://www.popsign.org/");
  });

  it("overlay cannot surface href for unknown gloss with evil remoteUrl", () => {
    const crafted = lex("DEMO", "https://evil.example/x");
    expect(resolveLinkOutForStep(crafted)).toBeNull();
  });
});
