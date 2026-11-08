/**
 * Dual-path media resolution (dual-path-0):
 * prefer real Deaf → labeled AI interim → remote_link → gloss/fingerspell cues.
 *
 * AI path never gold/interpreter. Flag `assist.ai_generated.v1` gates AI playback.
 * Real binding for a gloss demotes/unbinds AI for that gloss.
 */

import type { ClipPackProvenance } from "./clip-source.js";
import {
  AI_INTERIM_STAGE_HINT,
  AI_SOURCE_SHORT,
  NO_CLIP_FOR_SIGN,
  PACK_PENDING_SHORT,
  POPSIGN_SOURCE_SHORT,
  REMOTE_SOURCE_LINE,
  VOLUNTEER_SOURCE_SHORT,
  DEAF_PRODUCED_SOURCE_SHORT,
} from "./honesty.js";

/** Real human-signing provenances (preferred over AI). */
export type RealClipProvenance = "volunteer" | "open_cc" | "commissioned";

export type AiDisposition = "pass" | "fail" | "hold" | "pending";

export interface RealGlossBinding {
  readonly path: string;
  readonly provenance: RealClipProvenance;
  readonly sourceId: string;
  readonly testOnly?: boolean;
}

export interface AiGlossBinding {
  readonly path: string;
  readonly sourceId: string;
  readonly disposition: AiDisposition;
  readonly generatorModelId: string | null;
  readonly testOnly: boolean;
  /** Wave id for stop-shipping a whole AI wave. */
  readonly waveId: string | null;
}

export type ResolvedMediaKind = "real" | "ai_generated" | "remote_link" | "none";

export interface ResolvedGlossMedia {
  readonly kind: ResolvedMediaKind;
  readonly assetPath: string | null;
  readonly remoteUrl: string | null;
  readonly provenance: ClipPackProvenance;
  readonly honestyShortTag: string;
  readonly stageHint: string | null;
  readonly noClipFallback: boolean;
  readonly generatorModelId: string | null;
  readonly testOnly: boolean;
}

let realByGloss: Record<string, RealGlossBinding> = {};
let aiByGloss: Record<string, AiGlossBinding> = {};
let remoteByGloss: Record<string, string> = {};

/** Gloss allowlist for AI when flag is on (Deaf-cleared only). Empty = none approved. */
let aiAllowlist: ReadonlySet<string> = new Set();

export function resetDualPathRuntime(): void {
  realByGloss = {};
  aiByGloss = {};
  remoteByGloss = {};
  aiAllowlist = new Set();
}

export function getRealBinding(gloss: string): RealGlossBinding | null {
  return realByGloss[gloss] ?? null;
}

export function getAiBinding(gloss: string): AiGlossBinding | null {
  return aiByGloss[gloss] ?? null;
}

export function getRemoteBinding(gloss: string): string | null {
  return remoteByGloss[gloss] ?? null;
}

export function listAiBoundGlosses(): readonly string[] {
  return Object.keys(aiByGloss).sort();
}

export function listRealBoundGlosses(): readonly string[] {
  return Object.keys(realByGloss).sort();
}

export function setAiAllowlist(glosses: readonly string[]): void {
  aiAllowlist = new Set(glosses.map((g) => g.trim().toUpperCase()).filter(Boolean));
}

export function getAiAllowlist(): readonly string[] {
  return [...aiAllowlist].sort();
}

export function isAiAllowlisted(gloss: string): boolean {
  return aiAllowlist.has(gloss.trim().toUpperCase());
}

/** Record a real local clip; demotes any AI binding for the same gloss. */
export function bindRealGloss(gloss: string, binding: RealGlossBinding): void {
  const g = gloss.trim().toUpperCase();
  realByGloss[g] = binding;
  demoteAiForGloss(g);
}

/** Record an AI local clip (caller must have validated provenance + disposition). */
export function bindAiGloss(gloss: string, binding: AiGlossBinding): void {
  const g = gloss.trim().toUpperCase();
  // Prefer-real: do not keep AI playable when real already exists.
  if (realByGloss[g]) {
    return;
  }
  aiByGloss[g] = binding;
}

export function bindRemoteGloss(gloss: string, url: string): void {
  remoteByGloss[gloss.trim().toUpperCase()] = url;
}

/**
 * When real Deaf media arrives for gloss G, unbind/demote AI for G (DUAL-2 / AC-DP0.2).
 */
export function demoteAiForGloss(gloss: string): boolean {
  const g = gloss.trim().toUpperCase();
  if (!(g in aiByGloss)) return false;
  delete aiByGloss[g];
  return true;
}

export function demoteAiForGlosses(glosses: readonly string[]): readonly string[] {
  const demoted: string[] = [];
  for (const g of glosses) {
    if (demoteAiForGloss(g)) demoted.push(g.trim().toUpperCase());
  }
  return demoted;
}

/**
 * Deaf fail / not-good-enough → stop shipping AI for that gloss (DUAL-4 / AC-DP0.6).
 */
export function stopShippingAiForGloss(gloss: string): boolean {
  return demoteAiForGloss(gloss);
}

/** Stop shipping all AI bindings in a wave (or every AI gloss if waveId is null). */
export function stopShippingAiWave(waveId: string | null): readonly string[] {
  const removed: string[] = [];
  for (const [g, binding] of Object.entries(aiByGloss)) {
    if (waveId === null || binding.waveId === waveId) {
      delete aiByGloss[g];
      removed.push(g);
    }
  }
  return removed.sort();
}

export interface ResolveMediaOptions {
  /** When false, AI path is skipped even if files exist (flag off). */
  readonly aiFlagEnabled: boolean;
  /**
   * When true, allow `testOnly` AI fixtures to play (CI/unit only).
   * Defaults to false in playlist / from-gloss — testOnly never counts as Deaf allowlist.
   */
  readonly allowTestOnlyAi?: boolean;
}

function honestyForReal(provenance: RealClipProvenance): string {
  switch (provenance) {
    case "volunteer":
      return VOLUNTEER_SOURCE_SHORT;
    case "open_cc":
      return POPSIGN_SOURCE_SHORT;
    case "commissioned":
      return DEAF_PRODUCED_SOURCE_SHORT;
    default:
      return PACK_PENDING_SHORT;
  }
}

/**
 * Normative resolver: real → AI (flag + disposition) → remote_link → none/cues.
 */
export function resolveMediaForGloss(
  gloss: string,
  options: ResolveMediaOptions,
): ResolvedGlossMedia {
  const g = gloss.trim().toUpperCase();
  const real = realByGloss[g];
  if (real) {
    return {
      kind: "real",
      assetPath: real.path,
      remoteUrl: remoteByGloss[g] ?? null,
      provenance: real.provenance,
      honestyShortTag: honestyForReal(real.provenance),
      stageHint: null,
      noClipFallback: false,
      generatorModelId: null,
      testOnly: Boolean(real.testOnly),
    };
  }

  const ai = aiByGloss[g];
  if (ai) {
    const dispositionOk = ai.disposition === "pass";
    // testOnly never counts as Deaf allowlist — only explicit allowTestOnlyAi may play fixtures.
    const allowlisted = isAiAllowlisted(g) && !ai.testOnly;
    const testOk = Boolean(options.allowTestOnlyAi && ai.testOnly);
    const canPlay =
      options.aiFlagEnabled && dispositionOk && !real && (allowlisted || testOk);

    if (canPlay) {
      return {
        kind: "ai_generated",
        assetPath: ai.path,
        remoteUrl: remoteByGloss[g] ?? null,
        provenance: "ai_generated",
        honestyShortTag: AI_SOURCE_SHORT,
        stageHint: AI_INTERIM_STAGE_HINT,
        noClipFallback: false,
        generatorModelId: ai.generatorModelId,
        testOnly: ai.testOnly,
      };
    }
  }

  const remote = remoteByGloss[g];
  if (remote) {
    return {
      kind: "remote_link",
      assetPath: null,
      remoteUrl: remote,
      provenance: "remote_link",
      honestyShortTag: REMOTE_SOURCE_LINE,
      stageHint: null,
      noClipFallback: false,
      generatorModelId: null,
      testOnly: false,
    };
  }

  return {
    kind: "none",
    assetPath: null,
    remoteUrl: null,
    provenance: null,
    honestyShortTag: PACK_PENDING_SHORT,
    stageHint: null,
    noClipFallback: true,
    generatorModelId: null,
    testOnly: false,
  };
}

export function gapCueLabel(gloss: string): string {
  return `${NO_CLIP_FOR_SIGN} · ${gloss}`;
}

/** Snapshot helpers for tests / About UI. */
export function dualPathSnapshot(): {
  readonly real: readonly string[];
  readonly ai: readonly string[];
  readonly remote: readonly string[];
  readonly aiAllowlist: readonly string[];
} {
  return {
    real: listRealBoundGlosses(),
    ai: listAiBoundGlosses(),
    remote: Object.keys(remoteByGloss).sort(),
    aiAllowlist: getAiAllowlist(),
  };
}
