/**
 * Shared product types and honesty-label constants.
 * Deaf-user stop-ship: assist path must never claim interpreter / accuracy %.
 * Per-pair copy lives in @asl/language-pairs; ASL constants remain defaults.
 *
 * Compact chrome (badge + one short line) per Deaf minimal-ui constraints;
 * long copy lives in About / Details — never as the only honesty surface.
 */

/** Visible claim tier for automated / lexical assist paths (ASL default). */
export const ASSIST_LABEL = "ASL assist / partial" as const;

/** Short UI badge text for assist (overlay chrome). */
export const ASSIST_BADGE = "ASL assist" as const;

/**
 * Always-visible honesty line (overlay + popup).
 * Must keep assist/partial framing, pack-pending, and not-interpreter without About.
 */
export const ASSIST_HONESTY_LINE = "Partial · pack pending · not an interpreter" as const;

/** Popup captions-floor one-liner. */
export const ASSIST_CAPTIONS_FLOOR = "Captions stay on" as const;

/** Compact status when overlay is on and pack unbound. */
export const ASSIST_STATUS_ON = "Assist on · cues until pack binds" as const;

/**
 * Supporting honesty line under the badge (alias of compact chrome line).
 * Prefer ASSIST_HONESTY_LINE in new UI; kept for callers/tests.
 */
export const ASSIST_DISCLAIMER = ASSIST_HONESTY_LINE;

/**
 * About / Details body — depth only; §1 chrome must still show without opening this.
 */
export const ASSIST_DETAILS =
  "ASL assist / partial — lexical gloss cues + fingerspell for unknown words. Clip pack not bound yet (pending volunteer/QA’d source). Volunteer pipeline + allowlisted link-out ready; PopSign bytes wait on Deaf QA. Not fluent ASL discourse. Not a human interpreter. Captions stay on." as const;

/** Stage hint while clip media pack is pending (compact). */
export const ASSIST_CLIP_STAGE_HINT = "Cues only — no sign video yet" as const;

/** Visible note: assist gloss is not fluent ASL (AC-1.1) — About depth. */
export const GLOSS_UI_NOTE =
  "Assist gloss (conservative) — not fluent ASL; not English-on-the-hands sold as ASL." as const;

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

/** Canonical assist copy for ASL Slice A overlay / popup. */
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

/** Default / ASL pair id string (mirrored from language-pairs to avoid cycles). */
export const DEFAULT_PAIR_ID = "en-ase" as const;

export interface OverlayState {
  readonly enabled: boolean;
  readonly claimTier: ClaimTier;
  /** Active pair assist label (ASL assist / partial, or ISL pending copy). */
  readonly label: string;
  readonly captionsFloorIntact: true;
  readonly criticalGateBlocked: boolean;
  readonly gateReason: string | null;
  readonly activeCueId: string | null;
  readonly placeholderMode: boolean;
  /** Language pair id (e.g. en-ase, en-ins). */
  readonly languagePairId: string;
  /** True only when live assist playlist may run for the pair. */
  readonly liveAssistEnabled: boolean;
}

export type RuntimeMessage =
  | { readonly type: "TOGGLE_OVERLAY"; readonly enabled: boolean }
  | {
      readonly type: "SET_LANGUAGE_PAIR";
      readonly languagePairId: string;
    }
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
    languagePairId: DEFAULT_PAIR_ID,
    liveAssistEnabled: true,
    ...overrides,
  };
}

export { isTrustedExtensionSender, parseRuntimeMessage } from "./messages.js";
