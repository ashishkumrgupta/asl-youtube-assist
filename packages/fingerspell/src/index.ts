/**
 * Fingerspell OOV fallback for ASL assist (partial).
 * Letter steps for scaffolding — UI glyphs are assist chrome, not Deaf-produced signing.
 * Clip media for letters binds only after an approved pack is selected.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;

export type FingerspellLetter = (typeof LETTERS)[number];

export interface FingerspellStep {
  readonly kind: "fingerspell";
  readonly letter: FingerspellLetter;
  /** Relative path when an approved pack provides letter media; null while pack pending. */
  readonly assetPath: string | null;
  readonly durationMs: number;
}

const LETTER_SET = new Set<string>(LETTERS.split(""));

export function isFingerspellLetter(ch: string): ch is FingerspellLetter {
  return LETTER_SET.has(ch.toUpperCase());
}

/** Expand an OOV token into fingerspell steps (letters only; others skipped). */
export function fingerspellToken(
  token: string,
  durationMsPerLetter = 450,
  packLoaded = false,
): FingerspellStep[] {
  const steps: FingerspellStep[] = [];
  for (const raw of token) {
    const ch = raw.toUpperCase();
    if (!isFingerspellLetter(ch)) continue;
    steps.push({
      kind: "fingerspell",
      letter: ch,
      assetPath: packLoaded ? `lexical/fingerspell/${ch}.webm` : null,
      durationMs: durationMsPerLetter,
    });
  }
  return steps;
}

export function fingerspellLabel(steps: readonly FingerspellStep[]): string {
  return steps.map((s) => s.letter).join("-");
}
