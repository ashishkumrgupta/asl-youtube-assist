/**
 * Shared product types and honesty-label constants.
 * Deaf-user stop-ship: assist path must never claim interpreter / accuracy %.
 */

/** Visible claim tier for automated / lexical assist paths. */
export const ASSIST_LABEL = "ASL assist / partial" as const;

/** Short UI badge text for assist (overlay chrome). */
export const ASSIST_BADGE = "ASL assist" as const;

/**
 * Supporting honesty line under the badge.
 * Lexical index + fingerspell OOV scaffolded; approved clip pack held pending coordinator pick.
 */
export const ASSIST_DISCLAIMER =
  "ASL assist / partial — lexical gloss cues + fingerspell for unknown words. Clip pack not bound yet (pending approved source). Not fluent ASL discourse. Not a human interpreter. Captions stay on." as const;

/** Stage hint while clip media pack is pending. */
export const ASSIST_CLIP_STAGE_HINT =
  "Clip pack pending coordinator pick (see ATTRIBUTION). No AI-persona default. Showing gloss / fingerspell cues only — not Deaf-produced signing video." as const;

/** Label reserved for qualified human interpreter catalog (Tier A) — not used in Slice A assist. */
export const HUMAN_INTERPRETATION_LABEL = "Human interpretation" as const;

export type ClaimTier = "assist_partial" | "human_interpretation";

export type AssistTier = "B";
export type HumanTier = "A";
export type ContentTier = AssistTier | HumanTier;

export interface LabelCopy {
  readonly badge: string;
  readonly claimTier: ClaimTier;
  readonly disclaimer: string;
}

/** Canonical assist copy for Slice A overlay / popup. */
export const ASSIST_LABEL_COPY: LabelCopy = {
  badge: ASSIST_BADGE,
  claimTier: "assist_partial",
  disclaimer: ASSIST_DISCLAIMER,
};

export type CriticalDomain = "health" | "legal" | "safety";

export const CRITICAL_DOMAINS: readonly CriticalDomain[] = [
  "health",
  "legal",
  "safety",
] as const;

export interface CaptionCue {
  readonly id: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly text: string;
}

export interface OverlayState {
  readonly enabled: boolean;
  readonly claimTier: ClaimTier;
  readonly label: typeof ASSIST_LABEL;
  readonly captionsFloorIntact: true;
  readonly criticalGateBlocked: boolean;
  readonly gateReason: string | null;
  readonly activeCueId: string | null;
  readonly placeholderMode: boolean;
}

export type RuntimeMessage =
  | { readonly type: "TOGGLE_OVERLAY"; readonly enabled: boolean }
  | { readonly type: "GET_STATE" }
  | { readonly type: "STATE"; readonly state: OverlayState }
  | {
      readonly type: "CRITICAL_GATE_RESULT";
      readonly blocked: boolean;
      readonly reason: string | null;
    };

export function assistOverlayDefaults(
  overrides: Partial<OverlayState> = {},
): OverlayState {
  return {
    enabled: false,
    claimTier: "assist_partial",
    label: ASSIST_LABEL,
    captionsFloorIntact: true,
    criticalGateBlocked: false,
    gateReason: null,
    activeCueId: null,
    placeholderMode: true,
    ...overrides,
  };
}
