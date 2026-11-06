/**
 * Phase 2 scaffolds: entertainment vs study modes + study-ready human gate.
 * Study-ready stays false until human review + Deaf-led study gate.
 */

export type ProductMode = "entertainment" | "study";

export const STUDY_READY_BLOCKED_REASON =
  "study-ready blocked — requires human-reviewed pack + Deaf-led study gate (Phase 2 CapEx/eval)." as const;

export interface ModeChrome {
  readonly mode: ProductMode;
  readonly label: string;
  readonly studyReady: false;
  readonly honesty: string;
}

export function modeChrome(mode: ProductMode): ModeChrome {
  if (mode === "entertainment") {
    return {
      mode: "entertainment",
      label: "Entertainment · ASL assist / partial",
      studyReady: false,
      honesty:
        "Entertainment assist — not study-ready; not interpreter-grade; captions stay on.",
    };
  }
  return {
    mode: "study",
    label: "Study mode (scaffold)",
    studyReady: false,
    honesty: STUDY_READY_BLOCKED_REASON,
  };
}

export interface StudyReadyGate {
  readonly humanReviewedPack: boolean;
  readonly deafLedStudyGate: boolean;
  readonly autoCcUnsupervisedOk: false;
}

export function isStudyReady(gate: StudyReadyGate): boolean {
  return (
    gate.humanReviewedPack &&
    gate.deafLedStudyGate &&
    gate.autoCcUnsupervisedOk === false &&
    false // hard-locked until CapEx/eval lands; scaffold never returns true
  );
}

export interface ComprehensionProtocolStub {
  readonly status: "stub";
  readonly compares: readonly ["captions_alone", "assist", "human_baseline"];
  readonly publicAccuracyPercentAllowed: false;
  readonly note: string;
}

export const COMPREHENSION_PROTOCOL: ComprehensionProtocolStub = {
  status: "stub",
  compares: ["captions_alone", "assist", "human_baseline"],
  publicAccuracyPercentAllowed: false,
  note: "Internal protocol stub only — not Deaf-led proof; no public %.",
};
