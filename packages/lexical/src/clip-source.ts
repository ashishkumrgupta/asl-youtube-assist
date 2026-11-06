/**
 * Clip media binding — Phase 0 gold pack not yet commissioned/licensed.
 * @see apps/extension/assets/lexical/ATTRIBUTION.md
 * @see docs/asl-clip-sources.md (Project)
 * @see internal/deaf-user-review/clip-source-stance.md (Project)
 */

export type ClipPackStatus = "pending" | "loaded";

export interface ClipPackManifest {
  readonly status: ClipPackStatus;
  readonly sourceId: string | null;
  readonly deafProduced: boolean;
  readonly syntheticPersona: boolean;
  readonly note: string;
}

/**
 * Phase 0 local gate: no shippable Deaf-produced CDN pack bound yet.
 * - Do NOT default to AI-persona / video-gen signers (Deaf-user stop-ship).
 * - Research sets (WLASL, etc.) are NC — not product CDN without a deal.
 * - Gold path: commissioned thin Deaf-produced pack OR commercial license.
 * - Optional later: PopSign CC BY subset only as tiny attributed scaffold + Deaf QA.
 */
export const CLIP_PACK_MANIFEST: ClipPackManifest = {
  status: "pending",
  sourceId: null,
  deafProduced: false,
  syntheticPersona: false,
  note: "AC-0.5 media pending commissioned/licensed Deaf-produced clips. Fingerspell + gloss cues only. No synthetic persona pack.",
};

export function clipPackIsPending(
  manifest: ClipPackManifest = CLIP_PACK_MANIFEST,
): boolean {
  return manifest.status !== "loaded";
}
