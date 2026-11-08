/**
 * Compact honesty strings for real-video-0 + dual-path-0 provenances.
 * Long attribution lives in About / ATTRIBUTION.md.
 * Deaf dual-path §1 strings are normative for AI / real compact chrome.
 */

import type { ClipPackManifest, ClipPackProvenance } from "./clip-source.js";
import { CLIP_PACK_MANIFEST } from "./clip-source.js";

export const NO_CLIP_FOR_SIGN = "No clip for this sign" as const;

export const VOLUNTEER_SOURCE_LINE =
  "Volunteer Deaf-produced clips — assist only; dialect/scope may be limited" as const;

export const VOLUNTEER_SOURCE_SHORT = "Partial · volunteer · not an interpreter" as const;

export const POPSIGN_SOURCE_LINE =
  "Limited open lexicon (PopSign, CC BY) — phone-quality citation clips; not a complete ASL dictionary" as const;

export const POPSIGN_SOURCE_SHORT =
  "Partial · open lexicon · not an interpreter" as const;

export const REMOTE_SOURCE_LINE =
  "Opening creator-hosted media — not our pack · not an interpreter" as const;

export const PACK_PENDING_SHORT = "Partial · pack pending · not an interpreter" as const;

/** Deaf dual-path §1 — AI path compact honesty (required). */
export const AI_SOURCE_SHORT = "Partial · AI-generated · not an interpreter" as const;

export const AI_SOURCE_LINE =
  "AI-generated assist clip (interim) — labeled; not Deaf video; replaced when real Deaf video is available" as const;

export const AI_INTERIM_STAGE_HINT = "AI interim — not Deaf video" as const;

export const AI_ABOUT_NOTE =
  "AI-generated assist clip (interim). Replaced when real Deaf video is available. Assist/partial only — not an interpreter." as const;

/** Commissioned / Deaf-produced real path (still assist until gold gates). */
export const DEAF_PRODUCED_SOURCE_SHORT =
  "Partial · Deaf-produced · not an interpreter" as const;

export const DEAF_PRODUCED_SOURCE_LINE =
  "Deaf-produced clips — ASL assist / partial until gold gates; not an interpreter" as const;

export function provenanceSourceLine(provenance: ClipPackProvenance): string {
  switch (provenance) {
    case "volunteer":
      return VOLUNTEER_SOURCE_LINE;
    case "open_cc":
      return POPSIGN_SOURCE_LINE;
    case "remote_link":
      return REMOTE_SOURCE_LINE;
    case "ai_generated":
      return AI_SOURCE_LINE;
    case "commissioned":
      return DEAF_PRODUCED_SOURCE_LINE;
    default:
      return PACK_PENDING_SHORT;
  }
}

export function provenanceShortTag(
  manifest: ClipPackManifest = CLIP_PACK_MANIFEST,
): string {
  if (manifest.status !== "loaded" || !manifest.provenance) {
    return PACK_PENDING_SHORT;
  }
  switch (manifest.provenance) {
    case "volunteer":
      return VOLUNTEER_SOURCE_SHORT;
    case "open_cc":
      return POPSIGN_SOURCE_SHORT;
    case "remote_link":
      return REMOTE_SOURCE_LINE;
    case "ai_generated":
      return AI_SOURCE_SHORT;
    case "commissioned":
      return DEAF_PRODUCED_SOURCE_SHORT;
    default:
      return PACK_PENDING_SHORT;
  }
}
