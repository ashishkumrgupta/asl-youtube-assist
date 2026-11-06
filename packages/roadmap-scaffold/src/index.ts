export {
  PHASE_SCAFFOLDS,
  SCAFFOLD_HONESTY,
  allClaimsBlocked,
  phaseMeta,
  type PhaseId,
  type PhaseScaffoldMeta,
  type ScaffoldStatus,
} from "./phases.js";

export {
  COMPANION_FREE_STUB,
  DICTIONARY_GROWTH_PLAN,
  PHASE_1B_SCAFFOLD_NOTE,
  TIER_A_INGEST,
  USEFULNESS_COHORT_PROTOCOL,
  phase1bUsefulnessClaimsAllowed,
  type CompanionStub,
  type DictionaryGrowthPlanStub,
  type TierAIngestRecord,
  type TierAIngestStub,
  type UsefulnessCohortProtocolStub,
} from "./phase-1b.js";

export {
  COMPREHENSION_PROTOCOL,
  STUDY_READY_BLOCKED_REASON,
  isStudyReady,
  modeChrome,
  type ComprehensionProtocolStub,
  type ModeChrome,
  type ProductMode,
  type StudyReadyGate,
} from "./phase-2.js";

export {
  COVERAGE_METRICS,
  CREATOR_BATCH,
  LATENCY_BUDGET,
  MOBILE_COMPANION,
  type CoverageMetricsStub,
  type CreatorBatchStub,
  type LatencyBudgetStub,
  type MobileCompanionStub,
} from "./phase-3.js";

export {
  LANGUAGE_PAIRS,
  PHASE_4_NOTE,
  activeLanguagePairs,
  aslExportGate,
  type AslExportGate,
  type LanguagePair,
  type LanguagePairStatus,
  type SignLanguageId,
} from "./phase-4.js";

export {
  INTERPRETATION_ALLOW_LIST,
  PHASE_5_NOTE,
  northStarClaimGate,
  type InterpretationAllowEntry,
  type NorthStarClaimGate,
} from "./phase-5.js";

export {
  assertScaffoldCopyClean,
  auditScaffoldClaims,
  type ScaffoldClaimAudit,
} from "./claim-gates.js";
