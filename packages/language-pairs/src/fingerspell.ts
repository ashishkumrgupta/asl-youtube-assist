import { fingerspellToken, type FingerspellStep } from "@asl/fingerspell";
import type { LanguagePairId } from "./registry.js";
import { getLanguagePair } from "./registry.js";
import { clipPackPendingForPair } from "./clip-packs.js";

/**
 * Per-pair fingerspell. Pending ISL returns no steps (no ASL letter chrome as ISL).
 */

export interface PairFingerspellResult {
  readonly pairId: LanguagePairId;
  readonly live: boolean;
  readonly steps: readonly FingerspellStep[];
  readonly tableStatus: "latin_stub" | "pack_bound" | "blocked_pending";
  readonly note: string;
}

export function fingerspellForPair(
  pairId: LanguagePairId,
  token: string,
  durationMsPerLetter = 450,
): PairFingerspellResult {
  const pair = getLanguagePair(pairId);
  if (!pair.liveAssistEnabled) {
    return {
      pairId,
      live: false,
      steps: [],
      tableStatus: "blocked_pending",
      note:
        pair.signLanguageIso === "ins"
          ? "ISL fingerspell blocked until ISL pack + Deaf-led eval — ASL letter glyphs are not ISL."
          : `${pair.shortName} fingerspell blocked — path not live.`,
    };
  }

  const packPending = clipPackPendingForPair(pairId);
  const raw = fingerspellToken(token, durationMsPerLetter, !packPending);
  const steps = raw.map((s) => ({
    ...s,
    assetPath:
      s.assetPath && !packPending
        ? `${pair.fingerspellAssetPrefix}/${s.letter}.webm`
        : null,
  }));

  return {
    pairId,
    live: true,
    steps,
    tableStatus: packPending ? "latin_stub" : "pack_bound",
    note: packPending
      ? `${pair.shortName} fingerspell stub — pack pending; letter glyphs are assist chrome only.`
      : `${pair.shortName} fingerspell media bound from approved pack.`,
  };
}
