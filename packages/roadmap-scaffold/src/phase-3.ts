/**
 * Phase 3 scaffolds: latency budgets, coverage metrics, mobile/creator stubs.
 */

export interface LatencyBudgetStub {
  readonly status: "stub";
  /** Target p95 overlay sync lag (ms) aspirational — not measured yet. */
  readonly targetP95SyncLagMs: number;
  readonly measuredP95SyncLagMs: null;
  readonly note: string;
}

export const LATENCY_BUDGET: LatencyBudgetStub = {
  status: "stub",
  targetP95SyncLagMs: 1500,
  measuredP95SyncLagMs: null,
  note: "Latency budget scaffold — do not claim CC-like ubiquity until measured.",
};

export interface CoverageMetricsStub {
  readonly status: "stub";
  readonly sampledYoutubeWithCaptionsPct: null;
  readonly note: string;
}

export const COVERAGE_METRICS: CoverageMetricsStub = {
  status: "stub",
  sampledYoutubeWithCaptionsPct: null,
  note: "Coverage % not measured — scaffold only.",
};

export interface MobileCompanionStub {
  readonly status: "stub";
  readonly ships: false;
  readonly note: string;
}

export const MOBILE_COMPANION: MobileCompanionStub = {
  status: "stub",
  ships: false,
  note: "Mobile companion out of Phase 0/1; scaffold placeholder only.",
};

export interface CreatorBatchStub {
  readonly status: "stub";
  readonly ships: false;
  readonly note: string;
}

export const CREATOR_BATCH: CreatorBatchStub = {
  status: "stub",
  ships: false,
  note: "Creator/batch tooling CapEx-deferred; interface reserved.",
};
