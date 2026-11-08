import { fingerspellToken, type FingerspellStep } from "@asl/fingerspell";
import { isEnabled } from "@asl/flags";
import {
  CLIP_PACK_MANIFEST,
  clipPackIsPending,
  type ClipPackProvenance,
} from "./clip-source.js";
import { LEXICAL_LOOKUP, type LexicalEntry } from "./dictionary.js";
import { resolveMediaForGloss, type ResolvedMediaKind } from "./dual-path.js";

export interface LexicalClipStep {
  readonly kind: "lexical";
  readonly gloss: string;
  readonly assetPath: string | null;
  /** Creator-hosted link-out URL when allowlisted; never a CDN mirror. */
  readonly remoteUrl: string | null;
  /** True when pack is loaded but this gloss has no local clip (honest gap). */
  readonly noClipFallback: boolean;
  /** Which dual-path media won (real → AI → remote → none). */
  readonly mediaKind: ResolvedMediaKind;
  readonly mediaProvenance: ClipPackProvenance;
  /** Compact honesty for the active media path. */
  readonly honestyShortTag: string;
  /** Optional stage hint (e.g. AI interim). */
  readonly stageHint: string | null;
  readonly durationMs: number;
  readonly surface: string;
}

export type AssistPlaylistStep = LexicalClipStep | FingerspellStep;

export interface PlaylistBuildResult {
  readonly steps: readonly AssistPlaylistStep[];
  readonly lexicalHits: number;
  readonly fingerspellTokens: number;
  readonly skippedStopwords: number;
  readonly clipPackPending: boolean;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "am",
  "this",
  "that",
  "it",
  "as",
  "by",
  "from",
  "not",
]);

export function tokenizeCaption(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t.length > 0);
}

export interface PlaylistMediaOptions {
  /** Override AI flag (defaults to `assist.ai_generated.v1` for local env). */
  readonly aiFlagEnabled?: boolean;
  readonly allowTestOnlyAi?: boolean;
}

function resolveOptions(options?: PlaylistMediaOptions) {
  return {
    aiFlagEnabled: options?.aiFlagEnabled ?? isEnabled("local", "assist.ai_generated.v1"),
    // Default false — content-script must not auto-play CI fixtures if flag flips ON.
    allowTestOnlyAi: options?.allowTestOnlyAi ?? false,
  };
}

function lexicalStep(
  entry: LexicalEntry,
  surface: string,
  mediaOptions?: PlaylistMediaOptions,
): LexicalClipStep {
  const resolved = resolveMediaForGloss(entry.gloss, resolveOptions(mediaOptions));
  // Prefer-real resolver; never invent a local file from dictionary alone.
  const assetPath =
    resolved.kind === "real" || resolved.kind === "ai_generated"
      ? resolved.assetPath
      : null;
  return {
    kind: "lexical",
    gloss: entry.gloss,
    assetPath,
    remoteUrl: resolved.remoteUrl,
    noClipFallback: resolved.noClipFallback,
    mediaKind: resolved.kind,
    mediaProvenance: resolved.provenance,
    honestyShortTag: resolved.honestyShortTag,
    stageHint: resolved.stageHint,
    durationMs: entry.durationMs,
    surface,
  };
}

/**
 * Caption → assist playlist (gloss cues + fingerspell OOV).
 * Dual-path: real → AI (flagged) → remote → cues. Gloss/fingerspell remains the gap fallback.
 */
export function buildAssistPlaylist(
  captionText: string,
  lookup: ReadonlyMap<string, LexicalEntry> = LEXICAL_LOOKUP,
  mediaOptions?: PlaylistMediaOptions,
): PlaylistBuildResult {
  const packPending = clipPackIsPending(CLIP_PACK_MANIFEST);
  const packLoaded = !packPending;
  const steps: AssistPlaylistStep[] = [];
  let lexicalHits = 0;
  let fingerspellTokens = 0;
  let skippedStopwords = 0;

  for (const token of tokenizeCaption(captionText)) {
    if (STOPWORDS.has(token)) {
      skippedStopwords += 1;
      continue;
    }
    const entry = lookup.get(token);
    if (entry) {
      lexicalHits += 1;
      steps.push(lexicalStep(entry, token, mediaOptions));
      continue;
    }
    const fs = fingerspellToken(token, 450, packLoaded);
    if (fs.length > 0) {
      fingerspellTokens += 1;
      steps.push(...fs);
    }
  }

  return {
    steps,
    lexicalHits,
    fingerspellTokens,
    skippedStopwords,
    clipPackPending: packPending,
  };
}

export function stepAtElapsed(
  steps: readonly AssistPlaylistStep[],
  elapsedMs: number,
): AssistPlaylistStep | null {
  if (steps.length === 0) return null;
  let t = 0;
  for (const step of steps) {
    const end = t + step.durationMs;
    if (elapsedMs >= t && elapsedMs < end) return step;
    t = end;
  }
  return steps[steps.length - 1] ?? null;
}
