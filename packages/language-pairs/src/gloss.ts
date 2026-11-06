import { conservativeGloss, type GlossResult } from "@asl/gloss";
import type { LanguagePairId } from "./registry.js";
import { getLanguagePair } from "./registry.js";

/**
 * Gloss pipeline keyed by language pair.
 * Live pairs only. Pending ISL must not reuse ASL gloss under an ISL label.
 */

export interface PairGlossResult {
  readonly pairId: LanguagePairId;
  readonly live: boolean;
  readonly gloss: GlossResult | null;
  readonly glossNote: string;
  readonly blockedReason: string | null;
}

export function conservativeGlossForPair(
  pairId: LanguagePairId,
  captionText: string,
): PairGlossResult {
  const pair = getLanguagePair(pairId);
  if (!pair.liveAssistEnabled) {
    return {
      pairId,
      live: false,
      gloss: null,
      glossNote: pair.assistCopy.glossNote,
      blockedReason:
        pair.pickerHint ?? "Sign-language path not live — pending Deaf-led eval / pack.",
    };
  }
  const gloss = conservativeGloss(captionText);
  return {
    pairId,
    live: true,
    gloss,
    glossNote: pair.assistCopy.glossNote,
    blockedReason: null,
  };
}
