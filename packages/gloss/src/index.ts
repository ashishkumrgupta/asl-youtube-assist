/**
 * Conservative English → assist gloss (Phase 1 Slice A).
 * Output is **not** fluent ASL discourse and must never be labeled as such.
 * Heuristics only: drop function words, light WH/time preference — not linguistic certification.
 */

export const GLOSS_HONESTY =
  "Conservative assist gloss — not English-on-the-hands sold as ASL; not fluent discourse." as const;

const DROP = new Set([
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
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "should",
  "have",
  "has",
  "had",
  "just",
  "really",
  "very",
  "so",
  "too",
]);

const TIME_WORDS = new Set([
  "today",
  "tomorrow",
  "yesterday",
  "now",
  "later",
  "night",
  "day",
  "morning",
  "evening",
]);

const WH_WORDS = new Set(["what", "where", "who", "why", "how", "when", "which"]);

export interface GlossToken {
  readonly surface: string;
  readonly role: "content" | "time" | "wh" | "kept";
}

export interface GlossResult {
  /** Ordered assist gloss tokens (still English lemmas — not ASL). */
  readonly tokens: readonly GlossToken[];
  readonly glossLine: string;
  /** Always false — UI must not present this as fluent ASL. */
  readonly claimsFluentAsl: false;
  readonly honesty: typeof GLOSS_HONESTY;
  readonly droppedCount: number;
}

export function tokenizeForGloss(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t.length > 0);
}

/**
 * Build a conservative assist gloss from caption English.
 * - Drops many function words (anti SEE-ish splice density)
 * - Moves a leading WH toward the end (light topic/comment hint)
 * - Moves a time word toward the front when present
 * Never asserts ASL fluency.
 */
export function conservativeGloss(captionText: string): GlossResult {
  const raw = tokenizeForGloss(captionText);
  let droppedCount = 0;
  const kept: GlossToken[] = [];

  for (const surface of raw) {
    if (DROP.has(surface)) {
      droppedCount += 1;
      continue;
    }
    if (TIME_WORDS.has(surface)) {
      kept.push({ surface, role: "time" });
    } else if (WH_WORDS.has(surface)) {
      kept.push({ surface, role: "wh" });
    } else {
      kept.push({ surface, role: "content" });
    }
  }

  const times = kept.filter((t) => t.role === "time");
  const whs = kept.filter((t) => t.role === "wh");
  const content = kept.filter((t) => t.role === "content" || t.role === "kept");

  // Prefer TIME … CONTENT … WH (assist heuristic only).
  const ordered = [...times, ...content, ...whs];

  return {
    tokens: ordered,
    glossLine: ordered.map((t) => t.surface.toUpperCase()).join(" "),
    claimsFluentAsl: false,
    honesty: GLOSS_HONESTY,
    droppedCount,
  };
}

/** True if gloss line is identical to uppercased English token order (bad SEE-ish). */
export function isEnglishWordOrderPreserved(
  captionText: string,
  gloss: GlossResult,
): boolean {
  const english = tokenizeForGloss(captionText)
    .filter((t) => !DROP.has(t))
    .map((t) => t.toUpperCase())
    .join(" ");
  return english.length > 0 && english === gloss.glossLine && gloss.droppedCount === 0;
}
