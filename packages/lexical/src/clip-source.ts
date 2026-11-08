/**
 * Clip media binding — Tier B assist packs (volunteer / open_cc / remote_link /
 * commissioned stub) + dual-path AI interim (`ai_generated`).
 * Fail-closed: pending until a rights-clear, QA'd gloss set actually binds.
 * AI never silent / never gold. Prefer-real over AI at bind + runtime.
 * @see apps/extension/assets/lexical/ATTRIBUTION.md
 * @see docs/asl-clip-sources.md
 */

export type ClipPackStatus = "pending" | "loaded";

/**
 * Manifest provenance — never silent.
 * Real preferred: volunteer | open_cc | commissioned.
 * Interim: ai_generated (flagged + labeled).
 * Link-out: remote_link (after AI in dual-path fallback chain).
 */
export type ClipPackProvenance =
  "volunteer" | "open_cc" | "remote_link" | "ai_generated" | "commissioned" | null;

export interface ClipPackManifest {
  readonly status: ClipPackStatus;
  readonly sourceId: string | null;
  readonly provenance: ClipPackProvenance;
  readonly license: string | null;
  readonly deafProduced: boolean;
  /**
   * Hard rule: must stay false. Unlabeled synthetic / photoreal "pass as Deaf"
   * packs are stop-ship. Labeled AI uses provenance `ai_generated` + `aiGenerated`.
   */
  readonly syntheticPersona: false;
  /**
   * Explicit AI path marker — must be true iff provenance is `ai_generated`,
   * never null-while-AI (Deaf DUAL-3 / AC-DP0.5).
   */
  readonly aiGenerated: boolean;
  /** Generator / model id for About disclosure when AI path is loaded. */
  readonly generatorModelId: string | null;
  readonly attributionUrl: string | null;
  /** QA-passed glosses only (real or AI with disposition). */
  readonly boundGlosses: readonly string[];
  readonly note: string;
}

export const CLIP_PACK_PENDING_NOTE =
  "AC-0.5 / real-video media pending rights-clear Deaf-produced or QA'd open clips. Fingerspell + gloss cues only. No silent synthetic; AI interim gated off until Deaf disposition." as const;

const PENDING_MANIFEST: ClipPackManifest = {
  status: "pending",
  sourceId: null,
  provenance: null,
  license: null,
  deafProduced: false,
  syntheticPersona: false,
  aiGenerated: false,
  generatorModelId: null,
  attributionUrl: null,
  boundGlosses: [],
  note: CLIP_PACK_PENDING_NOTE,
};

/** Live binding — mutated only via Tier B / dual-path ingest / reset. */
export let CLIP_PACK_MANIFEST: ClipPackManifest = { ...PENDING_MANIFEST };

export function getClipPackManifest(): ClipPackManifest {
  return CLIP_PACK_MANIFEST;
}

export function clipPackIsPending(
  manifest: ClipPackManifest = CLIP_PACK_MANIFEST,
): boolean {
  return manifest.status !== "loaded";
}

/** True when a specific gloss has a bound local clip in the active pack. */
export function glossHasBoundClip(
  gloss: string,
  manifest: ClipPackManifest = CLIP_PACK_MANIFEST,
): boolean {
  if (manifest.status !== "loaded") return false;
  return manifest.boundGlosses.includes(gloss);
}

/** Test / dry-run helper — restores fail-closed pending defaults. */
export function resetClipPackManifest(): void {
  CLIP_PACK_MANIFEST = { ...PENDING_MANIFEST, boundGlosses: [] };
}

/** Internal: apply a validated loaded manifest (ingest only). */
export function applyClipPackManifest(next: ClipPackManifest): void {
  if (next.syntheticPersona !== false) {
    throw new Error("reject: syntheticPersona must be false");
  }
  if (next.provenance === "ai_generated" && next.aiGenerated !== true) {
    throw new Error("reject: ai_generated provenance requires aiGenerated: true");
  }
  if (next.provenance !== "ai_generated" && next.aiGenerated === true) {
    throw new Error("reject: aiGenerated true only with provenance ai_generated");
  }
  if (next.status === "loaded" && next.boundGlosses.length === 0) {
    throw new Error("reject: cannot mark pack loaded with zero bound glosses");
  }
  CLIP_PACK_MANIFEST = next;
}
