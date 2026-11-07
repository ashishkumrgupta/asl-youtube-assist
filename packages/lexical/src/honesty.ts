/**
 * Compact honesty strings for real-video-0 provenances (Deaf RV0-5).
 * Long attribution lives in About / ATTRIBUTION.md.
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

export function provenanceSourceLine(provenance: ClipPackProvenance): string {
  switch (provenance) {
    case "volunteer":
      return VOLUNTEER_SOURCE_LINE;
    case "open_cc":
      return POPSIGN_SOURCE_LINE;
    case "remote_link":
      return REMOTE_SOURCE_LINE;
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
    default:
      return PACK_PENDING_SHORT;
  }
}
