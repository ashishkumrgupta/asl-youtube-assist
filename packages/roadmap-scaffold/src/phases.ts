/**
 * CapEx-free roadmap scaffolding for Phases 1b → 5.
 * Scaffold ≠ shipped capability. Claim tiers stay assist/partial until funded evidence.
 */

export type PhaseId = "1b" | "2" | "3" | "4" | "5";

export type ScaffoldStatus =
  "scaffold_only" | "blocked_capex" | "blocked_eval" | "active";

export interface PhaseScaffoldMeta {
  readonly id: PhaseId;
  readonly title: string;
  readonly productOutcome: string;
  readonly status: ScaffoldStatus;
  /** True when public/marketing claims for this phase are forbidden. */
  readonly claimsBlocked: true;
  readonly capExRequired: readonly string[];
  readonly scaffoldSurfaces: readonly string[];
}

export const SCAFFOLD_HONESTY =
  "Roadmap scaffolding only — not a shipped Phase capability; not usefulness or accuracy proof." as const;

export const PHASE_SCAFFOLDS: readonly PhaseScaffoldMeta[] = [
  {
    id: "1b",
    title: "Phase 1b — Funded usefulness path (stubs)",
    productOutcome:
      "AC-1.3/1.4 cohort protocol + Tier A ingest hooks + free companion stub — CapEx still required to execute",
    status: "blocked_capex",
    claimsBlocked: true,
    capExRequired: [
      "Deaf/HH entertainment pilot cohort (AC-1.3/1.4)",
      "Tier A human catalog content",
      "Gold Deaf-produced clip pack (AC-0.5) when bound",
    ],
    scaffoldSurfaces: [
      "cohortProtocolStub",
      "tierAIngestInterface",
      "dictionaryGrowthPlan",
      "companionFreeStub",
      "usefulnessEvalFixtures",
    ],
  },
  {
    id: "2",
    title: "Phase 2 — Accuracy + study path",
    productOutcome:
      "Entertainment vs Study modes; study-ready human gate; comprehension protocol stubs",
    status: "scaffold_only",
    claimsBlocked: true,
    capExRequired: [
      "Deaf-led comprehension study participants",
      "Human-reviewed study packs",
      "Selective neural R&D (optional; flag off)",
    ],
    scaffoldSurfaces: [
      "productModes",
      "studyReadyGate",
      "comprehensionProtocolStub",
      "neuralSelectiveFlagOff",
    ],
  },
  {
    id: "3",
    title: "Phase 3 — Scale & real-time (ASL)",
    productOutcome: "Coverage + latency budgets; mobile/creator stubs; still honest gaps",
    status: "scaffold_only",
    claimsBlocked: true,
    capExRequired: [
      "Mobile companion eng",
      "Creator tooling ops",
      "Platform partnership effort",
    ],
    scaffoldSurfaces: [
      "latencyBudgets",
      "coverageMetricsStub",
      "mobileCompanionStub",
      "creatorBatchStub",
    ],
  },
  {
    id: "4",
    title: "Phase 4 — Multi-language",
    productOutcome:
      "Spoken→sign pair registry; ASL-only active until Phase 2 eval bar solid",
    status: "blocked_eval",
    claimsBlocked: true,
    capExRequired: [
      "Per-language Deaf community partnership",
      "Per-language lexical + eval budget",
    ],
    scaffoldSurfaces: ["languagePairRegistry", "exportGateRequiresAslEval"],
  },
  {
    id: "5",
    title: "Phase 5 — North-star proof",
    productOutcome:
      "Interpretation-grade allow-list empty until Deaf-led parity evidence; assist elsewhere",
    status: "blocked_eval",
    claimsBlocked: true,
    capExRequired: [
      "Pre-registered Deaf-led eval on held-out sets",
      "Public-defendable evidence pack",
    ],
    scaffoldSurfaces: [
      "interpretationAllowList",
      "northStarClaimGate",
      "remainingGapsRegistry",
    ],
  },
] as const;

export function phaseMeta(id: PhaseId): PhaseScaffoldMeta {
  const hit = PHASE_SCAFFOLDS.find((p) => p.id === id);
  if (!hit) throw new Error(`Unknown phase scaffold: ${id}`);
  return hit;
}

export function allClaimsBlocked(): boolean {
  return PHASE_SCAFFOLDS.every((p) => p.claimsBlocked);
}
