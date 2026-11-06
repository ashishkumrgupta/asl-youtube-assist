/**
 * Phase 5 scaffolds: north-star proof gates.
 * Interpretation-grade allow-list stays empty until Deaf-led parity evidence.
 */

import { ASSIST_LABEL, HUMAN_INTERPRETATION_LABEL } from "@asl/shared-types";

export interface InterpretationAllowEntry {
  readonly domainId: string;
  readonly mode: "entertainment" | "study";
  readonly deafLedParityEvidenceRef: string;
}

/** Empty until Phase 5 evidence lands — never invent entries for demos. */
export const INTERPRETATION_ALLOW_LIST: readonly InterpretationAllowEntry[] = [];

export interface NorthStarClaimGate {
  readonly mayClaimInterpreterGrade: boolean;
  readonly mayClaimAccuracyPercent: boolean;
  readonly mayClaimOneHundredPercent: boolean;
  readonly assistLabelElsewhere: typeof ASSIST_LABEL;
  readonly humanLabelWhenAllowed: typeof HUMAN_INTERPRETATION_LABEL;
  readonly remainingGaps: readonly string[];
}

export function northStarClaimGate(
  allowList: readonly InterpretationAllowEntry[] = INTERPRETATION_ALLOW_LIST,
): NorthStarClaimGate {
  const hasEvidence = allowList.length > 0;
  return {
    mayClaimInterpreterGrade: hasEvidence,
    mayClaimAccuracyPercent: false,
    mayClaimOneHundredPercent: false,
    assistLabelElsewhere: ASSIST_LABEL,
    humanLabelWhenAllowed: HUMAN_INTERPRETATION_LABEL,
    remainingGaps: [
      "Deaf-led comprehension ≈ human on held-out entertainment sets",
      "Deaf-led comprehension ≈ human on held-out study sets",
      "Real-time budgets met with evidence",
      "Scale economics for free/freemium habit",
      "WFD/WASLI-aligned public communications pack",
    ],
  };
}

export const PHASE_5_NOTE =
  "North-star proof scaffold — interpretation-grade allow-list empty; assist stays assist." as const;
