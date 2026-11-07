/**
 * Clip media binding — Tier B assist packs only (volunteer / open_cc / remote_link).
 * Fail-closed: pending until a rights-clear, QA'd gloss set actually binds.
 * @see apps/extension/assets/lexical/ATTRIBUTION.md
 * @see docs/asl-clip-sources.md
 */

export type ClipPackStatus = "pending" | "loaded";

/** Manifest provenance — never silent. */
export type ClipPackProvenance = "volunteer" | "open_cc" | "remote_link" | null;

export interface ClipPackManifest {
  readonly status: ClipPackStatus;
  readonly sourceId: string | null;
  readonly provenance: ClipPackProvenance;
  readonly license: string | null;
  readonly deafProduced: boolean;
  /** Hard rule: must stay false on any shipped pack. */
  readonly syntheticPersona: false;
  readonly attributionUrl: string | null;
  /** QA-passed glosses only. */
  readonly boundGlosses: readonly string[];
  readonly note: string;
}

export const CLIP_PACK_PENDING_NOTE =
  "AC-0.5 / real-video media pending rights-clear Deaf-produced or QA'd open clips. Fingerspell + gloss cues only. No synthetic persona pack." as const;

const PENDING_MANIFEST: ClipPackManifest = {
  status: "pending",
  sourceId: null,
  provenance: null,
  license: null,
  deafProduced: false,
  syntheticPersona: false,
  attributionUrl: null,
  boundGlosses: [],
  note: CLIP_PACK_PENDING_NOTE,
};

/** Live binding — mutated only via Tier B ingest / reset. ES live binding. */
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
  if (next.status === "loaded" && next.boundGlosses.length === 0) {
    throw new Error("reject: cannot mark pack loaded with zero bound glosses");
  }
  CLIP_PACK_MANIFEST = next;
}
