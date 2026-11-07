import { fingerspellToken, type FingerspellStep } from "@asl/fingerspell";
import {
  CLIP_PACK_MANIFEST,
  clipPackIsPending,
  glossHasBoundClip,
} from "./clip-source.js";
import { LEXICAL_LOOKUP, type LexicalEntry } from "./dictionary.js";
import { getBoundAssetPathForGloss, getRemoteUrlForGloss } from "./tier-b-ingest.js";

export interface LexicalClipStep {
  readonly kind: "lexical";
  readonly gloss: string;
  readonly assetPath: string | null;
  /** Creator-hosted link-out URL when allowlisted; never a CDN mirror. */
  readonly remoteUrl: string | null;
  /** True when pack is loaded but this gloss has no local clip (honest gap). */
  readonly noClipFallback: boolean;
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

function lexicalStep(entry: LexicalEntry, surface: string): LexicalClipStep {
  const packPending = clipPackIsPending(CLIP_PACK_MANIFEST);
  const bound = !packPending && glossHasBoundClip(entry.gloss);
  // Only paths recorded by Tier B ingest — never invent a local file from dictionary alone.
  const boundPath = bound ? getBoundAssetPathForGloss(entry.gloss) : null;
  const remoteUrl = getRemoteUrlForGloss(entry.gloss);
  const hasLocal = Boolean(boundPath);
  const hasRemote = Boolean(remoteUrl);
  return {
    kind: "lexical",
    gloss: entry.gloss,
    assetPath: hasLocal ? boundPath : null,
    remoteUrl: hasRemote ? remoteUrl : null,
    // Gap honesty when pack is pending OR gloss not bound (and no remote).
    noClipFallback: !hasLocal && !hasRemote,
    durationMs: entry.durationMs,
    surface,
  };
}

/**
 * Caption → assist playlist (gloss cues + fingerspell OOV).
 * Local media paths bind only for QA'd glosses in a loaded Tier B pack.
 * Gloss/fingerspell remains the fallback when no clip exists.
 */
export function buildAssistPlaylist(
  captionText: string,
  lookup: ReadonlyMap<string, LexicalEntry> = LEXICAL_LOOKUP,
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
      steps.push(lexicalStep(entry, token));
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
