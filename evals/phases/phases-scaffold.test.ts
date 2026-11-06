import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  INTERPRETATION_ALLOW_LIST,
  PHASE_SCAFFOLDS,
  USEFULNESS_COHORT_PROTOCOL,
  activeLanguagePairs,
  auditScaffoldClaims,
  modeChrome,
} from "@asl/roadmap-scaffold";
import { laterPhaseFlagsOffInProd } from "@asl/flags";

const dir = dirname(fileURLToPath(import.meta.url));

describe("evals/phases scaffold (1b–5)", () => {
  it("manifest declares notDeafLedProof and five phases", () => {
    const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as {
      notDeafLedProof: boolean;
      phases: Array<{ id: string }>;
    };
    expect(manifest.notDeafLedProof).toBe(true);
    expect(manifest.phases.map((p) => p.id)).toEqual(["1b", "2", "3", "4", "5"]);
    expect(PHASE_SCAFFOLDS).toHaveLength(5);
  });

  it("fail-closed usefulness / study / allow-list / flags", () => {
    expect(USEFULNESS_COHORT_PROTOCOL.allowedMarketingClaim).toBeNull();
    expect(modeChrome("study").studyReady).toBe(false);
    expect(INTERPRETATION_ALLOW_LIST).toHaveLength(0);
    expect(activeLanguagePairs()[0]?.signLanguageIso).toBe("ase");
    expect(activeLanguagePairs().every((p) => p.liveAssistEnabled)).toBe(true);
    expect(laterPhaseFlagsOffInProd("production")).toBe(true);
    const audit = auditScaffoldClaims();
    expect(audit.allPhaseClaimsBlocked).toBe(true);
  });
});
