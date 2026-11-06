import {
  ASSIST_LABEL,
  HUMAN_INTERPRETATION_LABEL,
  type ContentTier,
} from "@asl/shared-types";

/**
 * Tier A/B routing (Phase 1 Slice A).
 * Tier A catalog may be empty — empty-state must stay visible and honest.
 */

export interface TierAEntry {
  readonly youtubeVideoId: string;
  readonly title: string;
  /** Human interpretation asset URL or local path — unused while catalog empty. */
  readonly assetRef: string;
}

/** Phase 1 Slice A / 1b: no Tier A media shipped yet (ingest interface separate). */
export const TIER_A_CATALOG: readonly TierAEntry[] = [];

/**
 * Phase 1b ingest hook — accepts qualified human records when CapEx/content lands.
 * Does not mutate the live catalog until a funded review path exists.
 */
export function previewTierAIngest(records: readonly TierAEntry[]): {
  readonly accepted: 0;
  readonly pendingReview: readonly TierAEntry[];
  readonly note: string;
} {
  return {
    accepted: 0,
    pendingReview: records,
    note: "Tier A ingest scaffold — zero accepted until CapEx + human QA/Deaf-user gate.",
  };
}

export interface TierRoute {
  readonly activeTier: ContentTier;
  readonly tierAAvailable: boolean;
  readonly tierAEmpty: boolean;
  readonly tierALabel: typeof HUMAN_INTERPRETATION_LABEL;
  readonly tierBLabel: typeof ASSIST_LABEL;
  /** Visible chrome line for overlay. */
  readonly routingLine: string;
  readonly emptyState: string | null;
}

export function lookupTierA(videoId: string | null): TierAEntry | null {
  if (!videoId) return null;
  return TIER_A_CATALOG.find((e) => e.youtubeVideoId === videoId) ?? null;
}

export function routeTiers(videoId: string | null): TierRoute {
  const hit = lookupTierA(videoId);
  const tierAAvailable = hit !== null;
  const tierAEmpty = TIER_A_CATALOG.length === 0;
  if (tierAAvailable) {
    return {
      activeTier: "A",
      tierAAvailable: true,
      tierAEmpty: false,
      tierALabel: HUMAN_INTERPRETATION_LABEL,
      tierBLabel: ASSIST_LABEL,
      routingLine: `Tier A · ${HUMAN_INTERPRETATION_LABEL} (active) · Tier B · ${ASSIST_LABEL} available`,
      emptyState: null,
    };
  }
  return {
    activeTier: "B",
    tierAAvailable: false,
    tierAEmpty,
    tierALabel: HUMAN_INTERPRETATION_LABEL,
    tierBLabel: ASSIST_LABEL,
    routingLine: `Tier B · ${ASSIST_LABEL} (active)`,
    emptyState: tierAEmpty
      ? `Tier A · ${HUMAN_INTERPRETATION_LABEL}: unavailable — human catalog empty (coming later). Not playing assist as human interpretation.`
      : `Tier A · ${HUMAN_INTERPRETATION_LABEL}: unavailable for this video — no human catalog match.`,
  };
}

/** Extract YouTube video id from watch URL or null. */
export function youtubeVideoIdFromLocation(
  href: string = typeof location !== "undefined" ? location.href : "",
): string | null {
  try {
    const u = new URL(href);
    if (!u.hostname.includes("youtube.com")) return null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}
