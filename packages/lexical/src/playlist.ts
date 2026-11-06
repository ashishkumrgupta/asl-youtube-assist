import { fingerspellToken, type FingerspellStep } from "@asl/fingerspell";
import { CLIP_PACK_MANIFEST, clipPackIsPending } from "./clip-source.js";
import { LEXICAL_LOOKUP, type LexicalEntry } from "./dictionary.js";

export interface LexicalClipStep {
  readonly kind: "lexical";
  readonly gloss: string;
  readonly assetPath: string | null;
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

/**
 * Caption → assist playlist (gloss cues + fingerspell OOV).
 * Media paths bind only when clip pack status is `loaded`.
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
      steps.push({
        kind: "lexical",
        gloss: entry.gloss,
        assetPath: packLoaded ? entry.assetPath : null,
        durationMs: entry.durationMs,
        surface: token,
      });
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
