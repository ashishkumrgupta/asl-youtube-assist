/**
 * Cross-phase claim gates for scaffolding — refuse overclaim strings.
 */

import { lintAssistCopy } from "@asl/lint-copy";
import { allClaimsBlocked, PHASE_SCAFFOLDS, SCAFFOLD_HONESTY } from "./phases.js";
import { phase1bUsefulnessClaimsAllowed } from "./phase-1b.js";
import { isStudyReady, type StudyReadyGate } from "./phase-2.js";
import { INTERPRETATION_ALLOW_LIST, northStarClaimGate } from "./phase-5.js";

export interface ScaffoldClaimAudit {
  readonly allPhaseClaimsBlocked: boolean;
  readonly usefulnessMarketingAllowed: false;
  readonly studyReady: false;
  readonly interpretationAllowListEmpty: boolean;
  readonly mayClaimAccuracyPercent: false;
  readonly scaffoldHonesty: typeof SCAFFOLD_HONESTY;
  readonly phaseIds: readonly string[];
}

export function auditScaffoldClaims(
  studyGate: StudyReadyGate = {
    humanReviewedPack: false,
    deafLedStudyGate: false,
    autoCcUnsupervisedOk: false,
  },
): ScaffoldClaimAudit {
  const ns = northStarClaimGate(INTERPRETATION_ALLOW_LIST);
  return {
    allPhaseClaimsBlocked: allClaimsBlocked(),
    usefulnessMarketingAllowed: phase1bUsefulnessClaimsAllowed(),
    studyReady: isStudyReady(studyGate) as false,
    interpretationAllowListEmpty: INTERPRETATION_ALLOW_LIST.length === 0,
    mayClaimAccuracyPercent: ns.mayClaimAccuracyPercent as false,
    scaffoldHonesty: SCAFFOLD_HONESTY,
    phaseIds: PHASE_SCAFFOLDS.map((p) => p.id),
  };
}

/** Lint helper: scaffold chrome must stay assist-honest. */
export function assertScaffoldCopyClean(text: string): void {
  const v = lintAssistCopy(text, "assist");
  if (v.length > 0) {
    throw new Error(`Scaffold copy violations: ${v.map((x) => x.term).join(", ")}`);
  }
  if (nsWouldOverclaim(text)) {
    throw new Error("Scaffold copy overclaims Phase 5 / accuracy language");
  }
}

function nsWouldOverclaim(text: string): boolean {
  const studyReadyClaim =
    /\b(is|now|certified|ships?)\s+study-ready\b/i.test(text) ||
    (/\bstudy-ready\b/i.test(text) &&
      !/\b(not|never|blocked|until|requires|before)\b/i.test(text));
  return (
    /\b100\s*%\b/i.test(text) ||
    /\bnorth[\s-]?star\s+(achieved|proven|complete)\b/i.test(text) ||
    studyReadyClaim
  );
}

export { SCAFFOLD_HONESTY };
