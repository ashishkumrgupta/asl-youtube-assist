/**
 * Phase 4 scaffolds — re-export language-pair registry (SSOT: @asl/language-pairs).
 * ASL (ase) live habit shell; Indian ISL (ins) pending; Irish isg out of scope.
 */

import { liveLanguagePairs } from "@asl/language-pairs";

export {
  DEFAULT_LANGUAGE_PAIR_ID,
  LANGUAGE_PAIRS,
  MULTILANG_CLAIM_NOTE as PHASE_4_NOTE,
  disabledLanguagePairs,
  getLanguagePair,
  indianSignLanguagePair,
  isLivePairId,
  liveLanguagePairs,
  pickerLanguagePairs,
  type LanguagePair,
  type LanguagePairId,
  type PairUiStatus as LanguagePairStatus,
  type SignLanguageIso,
} from "@asl/language-pairs";

/** @deprecated Use liveLanguagePairs() — kept for older scaffold tests. */
export function activeLanguagePairs() {
  return liveLanguagePairs();
}

export interface AslExportGate {
  readonly aslPhase2EvalSolid: boolean;
  readonly mayExportProcessToOtherLanguages: boolean;
}

export function aslExportGate(aslPhase2EvalSolid: boolean): AslExportGate {
  void aslPhase2EvalSolid;
  return {
    aslPhase2EvalSolid: false,
    mayExportProcessToOtherLanguages: false,
  };
}
