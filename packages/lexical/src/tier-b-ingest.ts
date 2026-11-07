/**
 * Tier B pack ingest — shared hook for volunteer / PopSign (open_cc) / remote_link.
 * Separate from catalog `previewTierAIngest` (human Tier A).
 *
 * Fail-closed (Business RV0-4 · Deaf RV0-3/4):
 * - Reject NC research sourceIds
 * - Reject syntheticPersona
 * - Reject gloss without qaPass
 * - Reject volunteer gloss without releaseOnFile
 * - Do not flip status to loaded when zero glosses bind
 * - Never bind under ISL (`ins`) namespace
 */

import {
  applyClipPackManifest,
  getClipPackManifest,
  resetClipPackManifest,
  type ClipPackManifest,
  type ClipPackProvenance,
} from "./clip-source.js";
import { validateRemoteUrl } from "./remote-link.js";

/** Explicitly blocked product CDN / scrape sources (stop-ship). */
export const TIER_B_REJECTED_SOURCE_IDS: readonly string[] = [
  "wlasl",
  "ms-asl",
  "msasl",
  "asl-citizen",
  "asl_citizen",
  "how2sign",
  "spreadthesign",
  "handspeak",
  "lifeprint",
  "studiogalt-gold",
  "youtube-cdn-mirror",
] as const;

export const TIER_B_ALLOWED_SOURCE_IDS: readonly string[] = [
  "volunteer-deaf",
  "popsign-cc-by",
  "remote-link-allowlist",
  /** Dry-run / CI only — never market as gold. */
  "test-fixture-only",
] as const;

export type TierBProvenance = Exclude<ClipPackProvenance, null>;

export interface TierBGlossFile {
  readonly gloss: string;
  /** Relative packaged path, e.g. lexical/ase/clips/HELLO.webm — null for link-out-only. */
  readonly relativePath: string | null;
  readonly qaPass: boolean;
  /** Required when provenance is volunteer. */
  readonly releaseOnFile?: boolean;
  /** Optional creator-hosted URL (link-out; no CDN mirror). */
  readonly remoteUrl?: string | null;
  /** Marks test-only fixtures — never marketed as gold. */
  readonly testOnly?: boolean;
}

export interface TierBIngestRequest {
  readonly sourceId: string;
  readonly provenance: TierBProvenance;
  readonly license: string | null;
  readonly deafProduced: boolean;
  readonly syntheticPersona: boolean;
  readonly attributionUrl: string;
  readonly glossFiles: readonly TierBGlossFile[];
  readonly note?: string;
  /**
   * Optional asset namespace check — must be `ase` for ASL Tier B.
   * Rejects `ins` / other namespaces.
   */
  readonly assetNamespace?: string;
}

export interface TierBRejectedGloss {
  readonly gloss: string;
  readonly reason: string;
}

export type TierBIngestResult =
  | {
      readonly ok: true;
      readonly manifest: ClipPackManifest;
      readonly boundGlosses: readonly string[];
      readonly rejected: readonly TierBRejectedGloss[];
      readonly remoteByGloss: Readonly<Record<string, string>>;
      readonly pathByGloss: Readonly<Record<string, string>>;
    }
  | {
      readonly ok: false;
      readonly errors: readonly string[];
      readonly rejected: readonly TierBRejectedGloss[];
    };

const ASE_CLIPS_PREFIX = "lexical/ase/clips/";

/** Runtime map of gloss → remote link-out URL (cleared on reset / successful bind). */
let remoteUrlByGloss: Record<string, string> = {};

/** Runtime map of gloss → packaged relative path for bound clips. */
let pathByGloss: Record<string, string> = {};

export function getRemoteUrlForGloss(gloss: string): string | null {
  return remoteUrlByGloss[gloss] ?? null;
}

export function getBoundAssetPathForGloss(gloss: string): string | null {
  return pathByGloss[gloss] ?? null;
}

export function resetTierBRuntimeMaps(): void {
  remoteUrlByGloss = {};
  pathByGloss = {};
  resetClipPackManifest();
}

function normalizeSourceId(id: string): string {
  return id.trim().toLowerCase();
}

function isNcSource(sourceId: string): boolean {
  const id = normalizeSourceId(sourceId);
  return TIER_B_REJECTED_SOURCE_IDS.some(
    (blocked) => id === blocked || id.startsWith(`${blocked}-`) || id.includes(blocked),
  );
}

function validateRelativePath(path: string): string | null {
  if (!path.startsWith(ASE_CLIPS_PREFIX)) {
    return `path must start with ${ASE_CLIPS_PREFIX}`;
  }
  if (path.includes("..") || path.includes("\\")) {
    return "path must not escape ase/clips";
  }
  if (path.includes("/ins/") || path.startsWith("lexical/ins/")) {
    return "ASL Tier B must not bind under ins/ISL namespace";
  }
  if (!/\.(webm|mp4)$/i.test(path)) {
    return "path must be .webm or .mp4";
  }
  return null;
}

function runIngest(request: TierBIngestRequest): TierBIngestResult {
  const errors: string[] = [];
  const rejected: TierBRejectedGloss[] = [];

  if (request.syntheticPersona) {
    errors.push("syntheticPersona is forbidden on Tier B assist packs");
  }

  if (isNcSource(request.sourceId)) {
    errors.push(`sourceId "${request.sourceId}" is NC / scrape / CDN-mirror stop-ship`);
  }

  const allowed = TIER_B_ALLOWED_SOURCE_IDS.map(normalizeSourceId);
  if (!allowed.includes(normalizeSourceId(request.sourceId))) {
    errors.push(
      `sourceId "${request.sourceId}" is not in the Tier B allowlist (${TIER_B_ALLOWED_SOURCE_IDS.join(", ")})`,
    );
  }

  if (request.assetNamespace && request.assetNamespace !== "ase") {
    errors.push(
      `assetNamespace "${request.assetNamespace}" rejected — ASL Tier B binds under ase only`,
    );
  }

  if (request.provenance === "volunteer" && !request.deafProduced) {
    errors.push('provenance "volunteer" requires deafProduced: true');
  }

  if (
    request.provenance === "open_cc" &&
    normalizeSourceId(request.sourceId) === "popsign-cc-by" &&
    request.license !== "CC BY 4.0"
  ) {
    errors.push('PopSign open_cc ingest requires license: "CC BY 4.0"');
  }

  if (!request.attributionUrl || !/^https?:\/\//i.test(request.attributionUrl)) {
    errors.push("attributionUrl must be an http(s) URL");
  }

  if (errors.length > 0) {
    return { ok: false, errors, rejected };
  }

  const nextRemote: Record<string, string> = {};
  const nextPath: Record<string, string> = {};
  const bound: string[] = [];

  for (const file of request.glossFiles) {
    const gloss = file.gloss.trim().toUpperCase();
    if (!gloss) {
      rejected.push({ gloss: file.gloss, reason: "empty gloss" });
      continue;
    }

    if (!file.qaPass) {
      rejected.push({
        gloss,
        reason: "qaPass required — no bind without Deaf QA per gloss (RV0-4)",
      });
      continue;
    }

    if (request.provenance === "volunteer" && file.releaseOnFile !== true) {
      rejected.push({
        gloss,
        reason: "volunteer bind requires releaseOnFile: true (RV0-1)",
      });
      continue;
    }

    if (file.relativePath) {
      const pathErr = validateRelativePath(file.relativePath);
      if (pathErr) {
        rejected.push({ gloss, reason: pathErr });
        continue;
      }
    }

    if (file.remoteUrl) {
      const urlErr = validateRemoteUrl(file.remoteUrl);
      if (urlErr) {
        rejected.push({ gloss, reason: urlErr });
        continue;
      }
    }

    if (!file.relativePath && !file.remoteUrl) {
      rejected.push({
        gloss,
        reason: "need relativePath and/or remoteUrl",
      });
      continue;
    }

    if (file.relativePath) nextPath[gloss] = file.relativePath;
    if (file.remoteUrl) nextRemote[gloss] = file.remoteUrl;
    if (!bound.includes(gloss)) bound.push(gloss);
  }

  if (bound.length === 0) {
    return {
      ok: false,
      errors: [
        "no glosses bound — pack stays pending (refuse loaded-with-empty)",
        ...rejected.map((r) => `${r.gloss}: ${r.reason}`),
      ],
      rejected,
    };
  }

  const noteParts = [
    request.note?.trim() ||
      `Tier B ${request.provenance} pack (${request.sourceId}) — ASL assist / partial only.`,
  ];
  if (request.glossFiles.some((g) => g.testOnly)) {
    noteParts.push("Contains TEST-ONLY fixtures — not gold / not market fitness.");
  }

  const manifest: ClipPackManifest = {
    status: "loaded",
    sourceId: request.sourceId,
    provenance: request.provenance,
    license: request.license,
    deafProduced: request.deafProduced,
    syntheticPersona: false,
    attributionUrl: request.attributionUrl,
    boundGlosses: bound,
    note: noteParts.join(" "),
  };

  return {
    ok: true,
    manifest,
    boundGlosses: bound,
    rejected,
    remoteByGloss: nextRemote,
    pathByGloss: nextPath,
  };
}

/**
 * Fail-closed Tier B ingest. Does not download or mirror remote bytes.
 * Callers must still gate PopSign UI behind `assist.popsign.v1` (default off)
 * and only pass glosses with Deaf QA logged.
 */
export function ingestOpenDemoPack(request: TierBIngestRequest): TierBIngestResult {
  return bindPairClipPack(request);
}

/** Alias matching Dev handoff name. */
export function bindPairClipPack(request: TierBIngestRequest): TierBIngestResult {
  const result = runIngest(request);
  if (!result.ok) return result;
  applyClipPackManifest(result.manifest);
  remoteUrlByGloss = { ...result.remoteByGloss };
  pathByGloss = { ...result.pathByGloss };
  return result;
}

/** Preview without mutating runtime (dry-run for volunteer intake checklist). */
export function previewTierBIngest(request: TierBIngestRequest): TierBIngestResult {
  const before = getClipPackManifest();
  const snapManifest: ClipPackManifest = {
    ...before,
    boundGlosses: [...before.boundGlosses],
  };
  const snapRemote = { ...remoteUrlByGloss };
  const snapPath = { ...pathByGloss };

  const result = bindPairClipPack(request);

  if (snapManifest.status === "pending" || snapManifest.boundGlosses.length === 0) {
    resetClipPackManifest();
  } else {
    applyClipPackManifest(snapManifest);
  }
  remoteUrlByGloss = snapRemote;
  pathByGloss = snapPath;
  return result;
}
