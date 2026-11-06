/**
 * Phase 1b CapEx-free stubs: usefulness cohort + Tier A ingest + companion.
 * Does NOT claim AC-1.3/1.4 complete.
 */

export const PHASE_1B_SCAFFOLD_NOTE =
  "Phase 1b scaffolding — cohort / Tier A content / usefulness claims blocked until funded CapEx." as const;

export type CohortProtocolStatus = "stub" | "recruiting" | "complete";

export interface UsefulnessCohortProtocolStub {
  readonly status: CohortProtocolStatus;
  readonly ac13EntertainmentPilot: false;
  readonly ac14PreferenceOnN: false;
  readonly agreedN: null;
  readonly allowedMarketingClaim: null;
  readonly protocolSteps: readonly string[];
}

/** Scaffold only — not a real cohort. */
export const USEFULNESS_COHORT_PROTOCOL: UsefulnessCohortProtocolStub = {
  status: "stub",
  ac13EntertainmentPilot: false,
  ac14PreferenceOnN: false,
  agreedN: null,
  allowedMarketingClaim: null,
  protocolSteps: [
    "Agree N pilots with QA + Deaf user review (when funded)",
    "Recruit real Deaf/HH entertainment participants (not synthetic personas)",
    "Compare assist vs captions alone on fixed entertainment fixtures",
    "Record preference / qualitative usefulness — no GTM until pass",
  ],
};

export interface TierAIngestRecord {
  readonly youtubeVideoId: string;
  readonly title: string;
  readonly assetRef: string;
  readonly qualifiedHuman: true;
  readonly licensed: boolean;
}

export interface TierAIngestStub {
  readonly status: "empty_interface";
  readonly records: readonly TierAIngestRecord[];
  readonly note: string;
}

/** Ingest interface ready; catalog content CapEx-deferred. */
export const TIER_A_INGEST: TierAIngestStub = {
  status: "empty_interface",
  records: [],
  note: "Tier A ingest API scaffolded; no human interpretation media shipped.",
};

export interface DictionaryGrowthPlanStub {
  readonly status: "plan_only";
  readonly targetHfGlossesWhenFunded: number;
  readonly currentIndexSizeHint: "phase0_mvp_small";
  readonly goldPackRequired: true;
  readonly note: string;
}

export const DICTIONARY_GROWTH_PLAN: DictionaryGrowthPlanStub = {
  status: "plan_only",
  targetHfGlossesWhenFunded: 1500,
  currentIndexSizeHint: "phase0_mvp_small",
  goldPackRequired: true,
  note: "Growth plan notes only — do not claim HF lexicon ships until AC-0.5 pack bound.",
};

export type CompanionStubStatus = "cut_unless_free" | "free_static_stub";

export interface CompanionStub {
  readonly status: CompanionStubStatus;
  readonly path: string;
  readonly claimTier: "assist_partial_scaffolding";
  readonly note: string;
}

/** Zero-cost static stub under apps/companion — not a product surface. */
export const COMPANION_FREE_STUB: CompanionStub = {
  status: "free_static_stub",
  path: "apps/companion/",
  claimTier: "assist_partial_scaffolding",
  note: "Free static demo hook only — cut if it delays honesty gates; not shareable GTM.",
};

export function phase1bUsefulnessClaimsAllowed(): false {
  return false;
}
