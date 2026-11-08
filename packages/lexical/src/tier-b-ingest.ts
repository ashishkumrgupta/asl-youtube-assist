/**
 * Tier B + dual-path pack ingest — volunteer / PopSign (open_cc) / remote_link /
 * commissioned stub / labeled AI interim (`ai_generated`).
 * Separate from catalog `previewTierAIngest` (human Tier A).
 *
 * Fail-closed (Business dual-path AC-DP0.* · Deaf DUAL-*):
 * - Reject NC research sourceIds
 * - Reject syntheticPersona (unlabeled synthetic / pass-as-Deaf)
 * - Reject AI without provenance `ai_generated` + explicit aiGenerated disclosure
 * - Reject AI gloss without Deaf disposition pass (unless testOnly CI fixture)
 * - Prefer-real: binding real demotes AI for that gloss
 * - Reject gloss without qaPass (real path)
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
import {
  bindAiGloss,
  bindRealGloss,
  bindRemoteGloss,
  demoteAiForGlosses,
  getAiBinding,
  getRealBinding,
  listAiBoundGlosses,
  listRealBoundGlosses,
  resetDualPathRuntime,
  type AiDisposition,
  type AiGlossBinding,
  type RealClipProvenance,
  type RealGlossBinding,
} from "./dual-path.js";
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
  /**
   * AI HF test fixture source — CI / local dry-run only.
   * Production AI media stays unbound until Deaf disposition (AC-DP0.10).
   */
  "ai-hf-test-fixture",
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
  /**
   * Deaf disposition for AI glosses (DUAL-6 / AC-DP0.10).
   * Required for `ai_generated` unless `testOnly` CI dry-run.
   */
  readonly deafDisposition?: AiDisposition;
  /** Optional AI wave id for stop-shipping a whole wave. */
  readonly waveId?: string | null;
}

export interface TierBIngestRequest {
  readonly sourceId: string;
  readonly provenance: TierBProvenance;
  readonly license: string | null;
  readonly deafProduced: boolean;
  readonly syntheticPersona: boolean;
  /**
   * Explicit AI disclosure — required true when provenance is `ai_generated`,
   * required false otherwise (never null-while-AI).
   */
  readonly aiGenerated: boolean;
  /** Model / generator id for About when AI path. */
  readonly generatorModelId?: string | null;
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
      readonly demotedAiGlosses: readonly string[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly string[];
      readonly rejected: readonly TierBRejectedGloss[];
    };

const ASE_CLIPS_PREFIX = "lexical/ase/clips/";

const AI_ABOUT_SNIPPET =
  "AI-generated assist clip (interim). Replaced when real Deaf video is available.";

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
  resetDualPathRuntime();
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

function isRealProvenance(p: TierBProvenance): p is RealClipProvenance {
  return p === "volunteer" || p === "open_cc" || p === "commissioned";
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

function rebuildPathMapsFromDualPath(): void {
  const nextPath: Record<string, string> = {};
  for (const g of listRealBoundGlosses()) {
    const path = getRealBinding(g)?.path;
    if (path) nextPath[g] = path;
  }
  for (const g of listAiBoundGlosses()) {
    if (nextPath[g]) continue;
    const path = getAiBinding(g)?.path;
    if (path) nextPath[g] = path;
  }
  pathByGloss = nextPath;
}

function runIngest(request: TierBIngestRequest): TierBIngestResult {
  const errors: string[] = [];
  const rejected: TierBRejectedGloss[] = [];
  const isAi = request.provenance === "ai_generated";

  if (request.syntheticPersona) {
    errors.push(
      "syntheticPersona is forbidden — unlabeled synthetic / pass-as-Deaf stop-ship (use provenance ai_generated + aiGenerated for labeled AI)",
    );
  }

  if (isAi && request.aiGenerated !== true) {
    errors.push(
      'provenance "ai_generated" requires aiGenerated: true (explicit disclosure; never null-while-AI)',
    );
  }

  if (!isAi && request.aiGenerated === true) {
    errors.push("aiGenerated: true is only valid with provenance ai_generated");
  }

  if (isAi && request.deafProduced) {
    errors.push(
      "ai_generated must not set deafProduced: true (AI is not Deaf-produced video)",
    );
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
      `assetNamespace "${request.assetNamespace}" rejected — ASL Tier B binds under ase only (no ASL AI under ISL)`,
    );
  }

  if (request.provenance === "volunteer" && !request.deafProduced) {
    errors.push('provenance "volunteer" requires deafProduced: true');
  }

  if (request.provenance === "commissioned" && !request.deafProduced) {
    errors.push('provenance "commissioned" requires deafProduced: true');
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

  if (isAi && !request.generatorModelId?.trim()) {
    errors.push(
      "ai_generated ingest requires generatorModelId for About disclosure (AC-DP0.5)",
    );
  }

  // Production AI source scaffolding: only test fixture sourceIds may bind without
  // Deaf disposition rows today (AC-DP0.10 — zero AI clips approved).
  if (
    isAi &&
    normalizeSourceId(request.sourceId) !== "ai-hf-test-fixture" &&
    normalizeSourceId(request.sourceId) !== "test-fixture-only"
  ) {
    errors.push(
      `AI sourceId "${request.sourceId}" refused — no production AI media bind until Deaf disposition (AC-DP0.10); use ai-hf-test-fixture for CI dry-run`,
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors, rejected };
  }

  const nextRemote: Record<string, string> = {};
  const nextPath: Record<string, string> = {};
  const bound: string[] = [];
  const demotedAi: string[] = [];

  for (const file of request.glossFiles) {
    const gloss = file.gloss.trim().toUpperCase();
    if (!gloss) {
      rejected.push({ gloss: file.gloss, reason: "empty gloss" });
      continue;
    }

    if (isAi) {
      const disposition = file.deafDisposition ?? (file.testOnly ? "pass" : "pending");
      if (!file.testOnly && disposition !== "pass") {
        rejected.push({
          gloss,
          reason: `AI bind requires deafDisposition: "pass" (got "${disposition}") — AC-DP0.10 / DUAL-6`,
        });
        continue;
      }
      if (file.testOnly && disposition === "fail") {
        rejected.push({
          gloss,
          reason: "AI test fixture with deafDisposition fail — stop shipping",
        });
        continue;
      }
      if (!file.qaPass && !file.testOnly) {
        rejected.push({
          gloss,
          reason: "AI bind requires qaPass (or testOnly CI fixture)",
        });
        continue;
      }
      if (!file.relativePath) {
        rejected.push({ gloss, reason: "ai_generated requires relativePath" });
        continue;
      }
      const pathErr = validateRelativePath(file.relativePath);
      if (pathErr) {
        rejected.push({ gloss, reason: pathErr });
        continue;
      }
      if (getRealBinding(gloss)) {
        demotedAi.push(gloss);
        rejected.push({
          gloss,
          reason: "real clip already bound — AI demoted (prefer-real)",
        });
        continue;
      }

      bindAiGloss(gloss, {
        path: file.relativePath,
        sourceId: request.sourceId,
        disposition: file.testOnly ? "pass" : disposition,
        generatorModelId: request.generatorModelId?.trim() || null,
        testOnly: Boolean(file.testOnly),
        waveId: file.waveId ?? null,
      });
      nextPath[gloss] = file.relativePath;
      if (!bound.includes(gloss)) bound.push(gloss);
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

    if (file.relativePath && isRealProvenance(request.provenance)) {
      const hadAi = Boolean(getAiBinding(gloss));
      const realBinding: RealGlossBinding = {
        path: file.relativePath,
        provenance: request.provenance,
        sourceId: request.sourceId,
        ...(file.testOnly !== undefined ? { testOnly: file.testOnly } : {}),
      };
      bindRealGloss(gloss, realBinding);
      nextPath[gloss] = file.relativePath;
      if (hadAi) {
        demotedAi.push(gloss);
        // bindRealGloss already demotes; ensure map is clear if called elsewhere.
        demoteAiForGlosses([gloss]);
      }
    }

    if (file.remoteUrl) {
      bindRemoteGloss(gloss, file.remoteUrl);
      nextRemote[gloss] = file.remoteUrl;
    }

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
      (isAi
        ? `AI-generated assist pack (${request.sourceId}) — interim labeled only; not gold / not Deaf video.`
        : `Tier B ${request.provenance} pack (${request.sourceId}) — ASL assist / partial only.`),
  ];
  if (request.glossFiles.some((g) => g.testOnly)) {
    noteParts.push("Contains TEST-ONLY fixtures — not gold / not market fitness.");
  }
  if (isAi) {
    noteParts.push(AI_ABOUT_SNIPPET);
  }

  const manifest: ClipPackManifest = {
    status: "loaded",
    sourceId: request.sourceId,
    provenance: request.provenance,
    license: request.license,
    deafProduced: request.deafProduced,
    syntheticPersona: false,
    aiGenerated: isAi,
    generatorModelId: isAi ? request.generatorModelId?.trim() || null : null,
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
    demotedAiGlosses: demotedAi,
  };
}

/**
 * Fail-closed Tier B / dual-path ingest. Does not download or mirror remote bytes.
 * Callers must still gate PopSign UI behind `assist.popsign.v1` (default off)
 * and AI playback behind `assist.ai_generated.v1` (default off).
 * Only pass glosses with Deaf QA / disposition logged (except testOnly CI fixtures).
 */
export function ingestOpenDemoPack(request: TierBIngestRequest): TierBIngestResult {
  return bindPairClipPack(request);
}

/** Alias matching Dev handoff name. */
export function bindPairClipPack(request: TierBIngestRequest): TierBIngestResult {
  const result = runIngest(request);
  if (!result.ok) return result;
  applyClipPackManifest(result.manifest);
  remoteUrlByGloss = { ...remoteUrlByGloss, ...result.remoteByGloss };
  pathByGloss = { ...pathByGloss, ...result.pathByGloss };
  rebuildPathMapsFromDualPath();
  return result;
}

/** Preview without mutating runtime (dry-run for volunteer / AI intake checklist). */
export function previewTierBIngest(request: TierBIngestRequest): TierBIngestResult {
  const before = getClipPackManifest();
  const snapManifest: ClipPackManifest = {
    ...before,
    boundGlosses: [...before.boundGlosses],
  };
  const snapRemote = { ...remoteUrlByGloss };
  const snapPath = { ...pathByGloss };

  const dualReal: { g: string; b: RealGlossBinding }[] = listRealBoundGlosses().map(
    (g) => ({ g, b: getRealBinding(g)! }),
  );
  const dualAi: { g: string; b: AiGlossBinding }[] = listAiBoundGlosses().map((g) => ({
    g,
    b: getAiBinding(g)!,
  }));
  const dualRemote = { ...remoteUrlByGloss };

  const result = bindPairClipPack(request);

  resetDualPathRuntime();
  for (const { g, b } of dualReal) bindRealGloss(g, b);
  for (const { g, b } of dualAi) bindAiGloss(g, b);
  for (const [g, url] of Object.entries(dualRemote)) bindRemoteGloss(g, url);

  if (snapManifest.status === "pending" || snapManifest.boundGlosses.length === 0) {
    resetClipPackManifest();
  } else {
    applyClipPackManifest(snapManifest);
  }
  remoteUrlByGloss = snapRemote;
  pathByGloss = snapPath;
  return result;
}
