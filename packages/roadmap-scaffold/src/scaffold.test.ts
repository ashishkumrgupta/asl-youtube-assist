import { describe, expect, it } from "vitest";
import { ASSIST_LABEL } from "@asl/shared-types";
import {
  COMPANION_FREE_STUB,
  COMPREHENSION_PROTOCOL,
  INTERPRETATION_ALLOW_LIST,
  LANGUAGE_PAIRS,
  LATENCY_BUDGET,
  PHASE_SCAFFOLDS,
  SCAFFOLD_HONESTY,
  TIER_A_INGEST,
  USEFULNESS_COHORT_PROTOCOL,
  activeLanguagePairs,
  allClaimsBlocked,
  assertScaffoldCopyClean,
  auditScaffoldClaims,
  isStudyReady,
  modeChrome,
  northStarClaimGate,
  phase1bUsefulnessClaimsAllowed,
  phaseMeta,
} from "./index.js";

describe("roadmap scaffold Phases 1b–5", () => {
  it("registers all five phase scaffolds with claims blocked", () => {
    expect(PHASE_SCAFFOLDS.map((p) => p.id)).toEqual(["1b", "2", "3", "4", "5"]);
    expect(allClaimsBlocked()).toBe(true);
    expect(SCAFFOLD_HONESTY.toLowerCase()).toContain("scaffolding only");
  });

  it("Phase 1b keeps usefulness marketing and Tier A ingest empty", () => {
    expect(phase1bUsefulnessClaimsAllowed()).toBe(false);
    expect(USEFULNESS_COHORT_PROTOCOL.ac13EntertainmentPilot).toBe(false);
    expect(USEFULNESS_COHORT_PROTOCOL.ac14PreferenceOnN).toBe(false);
    expect(TIER_A_INGEST.records).toHaveLength(0);
    expect(COMPANION_FREE_STUB.claimTier).toBe("assist_partial_scaffolding");
  });

  it("Phase 2 study mode never returns study-ready from scaffold gate", () => {
    const study = modeChrome("study");
    expect(study.studyReady).toBe(false);
    expect(
      isStudyReady({
        humanReviewedPack: true,
        deafLedStudyGate: true,
        autoCcUnsupervisedOk: false,
      }),
    ).toBe(false);
    expect(COMPREHENSION_PROTOCOL.publicAccuracyPercentAllowed).toBe(false);
  });

  it("Phase 3 latency/coverage remain unmeasured stubs", () => {
    expect(LATENCY_BUDGET.measuredP95SyncLagMs).toBeNull();
    expect(phaseMeta("3").status).toBe("scaffold_only");
  });

  it("Phase 4 only activates ASL pair", () => {
    expect(activeLanguagePairs()).toHaveLength(1);
    expect(activeLanguagePairs()[0]?.sign).toBe("asl");
    expect(LANGUAGE_PAIRS.filter((p) => p.status !== "active").length).toBeGreaterThan(0);
  });

  it("Phase 5 interpretation allow-list empty; accuracy % blocked", () => {
    expect(INTERPRETATION_ALLOW_LIST).toHaveLength(0);
    const gate = northStarClaimGate();
    expect(gate.mayClaimInterpreterGrade).toBe(false);
    expect(gate.mayClaimAccuracyPercent).toBe(false);
    expect(gate.mayClaimOneHundredPercent).toBe(false);
    expect(gate.assistLabelElsewhere).toBe(ASSIST_LABEL);
  });

  it("scaffold claim audit is fail-closed", () => {
    const audit = auditScaffoldClaims();
    expect(audit.usefulnessMarketingAllowed).toBe(false);
    expect(audit.studyReady).toBe(false);
    expect(audit.interpretationAllowListEmpty).toBe(true);
    expect(audit.mayClaimAccuracyPercent).toBe(false);
  });

  it("allows honest assist scaffold copy; rejects north-star complete", () => {
    expect(() =>
      assertScaffoldCopyClean(
        "ASL assist / partial — scaffolding only. Not an interpreter.",
      ),
    ).not.toThrow();
    expect(() => assertScaffoldCopyClean("North-star proven complete")).toThrow();
  });
});
