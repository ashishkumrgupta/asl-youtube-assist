/**
 * ai-wave-1 — first thin HF AI citation set (pipeline stubs only).
 *
 * Candidate allowlist for Deaf disposition — **not** production-bound.
 * Flag `assist.ai_generated.v1` stays OFF. No qaPass / no prod bind.
 * Filenames when media arrives: `<GLOSS>.ai-pending.webm` (unbound until disposition).
 *
 * Gloss IDs match `LEXICAL_ENTRIES` (HF). THANKS = thank-you forms (not THANK-YOU).
 */

/** Wave id for stopShippingAiWave / QA log rows. */
export const AI_WAVE_1_ID = "ai-wave-1" as const;

/**
 * Tier B sourceId for this wave once Deaf disposition clears a gloss.
 * Until then: QA log + prompts only — do not call bind with qaPass.
 */
export const AI_WAVE_1_SOURCE_ID = "ai-hf-wave-1" as const;

/**
 * Thin HF allowlist (≤6) for first Deaf AI disposition review.
 * Product-facing greetings / polarity / politeness / valence.
 */
export const AI_WAVE_1_GLOSSES = [
  "HELLO",
  "THANKS",
  "YES",
  "NO",
  "PLEASE",
  "BAD",
] as const;

export type AiWave1Gloss = (typeof AI_WAVE_1_GLOSSES)[number];

/** ASL (`ase`) only — never under `ins` / ISL. */
export const AI_WAVE_1_PAIR_ID = "en-ase" as const;
export const AI_WAVE_1_SIGN_LANGUAGE_ISO = "ase" as const;

/** Placeholder model id until a real generator is wired. */
export const AI_WAVE_1_GENERATOR_MODEL_ID_PENDING =
  "pending-external-video-gen/unspecified" as const;

const WAVE_1_SET: ReadonlySet<string> = new Set(AI_WAVE_1_GLOSSES);

export function isAiWave1Gloss(gloss: string): boolean {
  return WAVE_1_SET.has(gloss.trim().toUpperCase());
}

/** Expected unbound asset path once real AI media is dropped in. */
export function aiWave1PendingAssetPath(gloss: string): string {
  const g = gloss.trim().toUpperCase();
  return `lexical/ase/clips/${g}.ai-pending.webm`;
}

export function listAiWave1PendingPaths(): readonly string[] {
  return AI_WAVE_1_GLOSSES.map((g) => aiWave1PendingAssetPath(g));
}

/**
 * Production AI allowlist for this wave — **empty** until Deaf disposition.
 * Do not call `setAiAllowlist` with these glosses in prod/local defaults.
 */
export function aiWave1ProductionAllowlist(): readonly string[] {
  return [];
}
