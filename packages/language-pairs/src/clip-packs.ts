import type { LanguagePairId } from "./registry.js";
import { LANGUAGE_PAIRS } from "./registry.js";

/**
 * Per-language clip-pack hooks. CapEx gold packs deferred per pair.
 * Never default to synthetic / AI-persona. Never bind ASL media as ISL.
 */

export type PairClipPackStatus = "pending" | "bound";

export interface PairClipPackManifest {
  readonly pairId: LanguagePairId;
  readonly signLanguageIso: string;
  readonly assetNamespace: string;
  readonly status: PairClipPackStatus;
  readonly sourceId: string | null;
  readonly deafProduced: boolean;
  readonly syntheticPersona: false;
  readonly manifestHook: string;
  readonly note: string;
}

export const CLIP_PACKS_BY_PAIR: Readonly<Record<LanguagePairId, PairClipPackManifest>> =
  Object.fromEntries(
    LANGUAGE_PAIRS.map((p) => [
      p.id,
      {
        pairId: p.id,
        signLanguageIso: p.signLanguageIso,
        assetNamespace: p.assetNamespace,
        status: "pending" as const,
        sourceId: null,
        deafProduced: false,
        syntheticPersona: false as const,
        manifestHook: p.clipManifestHook,
        note:
          p.signLanguageIso === "ins"
            ? "ISL gold pack CapEx-blocked (separate from ASL estimate). No ASL clips. No synthetic persona."
            : `${p.displayName} gold clip pack CapEx-deferred. Gloss/fingerspell cues only when live. No synthetic persona.`,
      } satisfies PairClipPackManifest,
    ]),
  ) as Record<LanguagePairId, PairClipPackManifest>;

export function clipPackForPair(pairId: LanguagePairId): PairClipPackManifest {
  return CLIP_PACKS_BY_PAIR[pairId];
}

export function clipPackPendingForPair(pairId: LanguagePairId): boolean {
  return clipPackForPair(pairId).status !== "bound";
}
