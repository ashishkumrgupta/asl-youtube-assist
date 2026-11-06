import { describe, expect, it } from "vitest";
import { conservativeGloss } from "@asl/gloss";
import { buildPlaylistFromGloss } from "./from-gloss.js";

describe("playlist from gloss", () => {
  it("uses gloss token order (not raw English caption order)", () => {
    const gloss = conservativeGloss("What do you want today?");
    const playlist = buildPlaylistFromGloss(gloss);
    expect(playlist.clipPackPending).toBe(true);
    expect(playlist.steps.length).toBeGreaterThan(0);
    // First content after TIME preference should reflect gloss, not "what" first.
    const firstLexical = playlist.steps.find((s) => s.kind === "lexical");
    expect(firstLexical?.kind === "lexical" && firstLexical.gloss).toBe("TODAY");
  });
});
