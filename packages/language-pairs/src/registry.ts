/**
 * Language-pair registry — single source of truth for spoken → sign routing.
 *
 * ISO 639-3:
 * - ase = American Sign Language (ASL) — primary habit shell
 * - ins = Indian Sign Language (ISL) — registry + pending chrome only until
 *         ISL gold pack + Deaf-led ISL eval / local ownership
 *
 * Out of scope this ship: Irish Sign Language (ISO isg). Do not add an isg
 * pair, do not alias isg as “ISL”, and do not put Irish in the picker.
 *
 * Selectable pending ≠ production-quality / multi-lang “live.”
 */

export type SpokenLocale = "en" | "fr" | "de" | "pt";

/** ISO 639-3 codes tracked in this registry (Irish isg intentionally omitted). */
export type SignLanguageIso = "ase" | "ins" | "bfi" | "fsl" | "gsg" | "bzs";

export type LanguagePairId =
  "en-ase" | "en-ins" | "en-bfi" | "fr-fsl" | "de-gsg" | "pt-bzs";

/**
 * - live: habit-shell assist path may run (still pack-pending / assist-partial)
 * - pending: picker-visible; chrome only — no live overlay signing path
 * - disabled: not evaluated / not shipped
 */
export type PairUiStatus = "live" | "pending" | "disabled";

export type PairEvalStatus = "not_evaluated" | "habit_shell_scaffold" | "deaf_led_pass";

export type PairClipPackStatus = "pending" | "bound";

export interface PairAssistCopy {
  readonly badge: string;
  readonly label: string;
  readonly disclaimer: string;
  readonly glossNote: string;
  readonly clipStageHint: string;
  readonly shortName: string;
}

export interface LanguagePair {
  readonly id: LanguagePairId;
  readonly spokenLocale: SpokenLocale;
  readonly signLanguageIso: SignLanguageIso;
  readonly displayName: string;
  readonly shortName: string;
  readonly uiStatus: PairUiStatus;
  readonly evalStatus: PairEvalStatus;
  /** Fail-closed: true only when live assist path may run. */
  readonly liveAssistEnabled: boolean;
  readonly clipPackStatus: PairClipPackStatus;
  readonly flagKey: `pairs.${LanguagePairId}`;
  readonly localDeafOwnership: boolean;
  readonly assistCopy: PairAssistCopy;
  readonly pickerHint: string | null;
  readonly clipManifestHook: string;
  readonly fingerspellAssetPrefix: string;
  /** Lexical / gloss asset namespace — never share ASL assets under ISL. */
  readonly assetNamespace: string;
}

const ASL_COPY: PairAssistCopy = {
  shortName: "ASL",
  badge: "ASL assist",
  label: "ASL assist / partial",
  disclaimer:
    "ASL assist / partial — lexical gloss cues + fingerspell for unknown words. Clip pack not bound yet (pending approved source). Not fluent ASL discourse. Not a human interpreter. Captions stay on.",
  glossNote:
    "Assist gloss (conservative) — not fluent ASL; not English-on-the-hands sold as ASL.",
  clipStageHint:
    "ASL clip pack pending coordinator pick. No AI-persona default. Showing gloss / fingerspell cues only — not Deaf-produced signing video.",
};

/** Pending chrome only — not a live ISL product path. */
const ISL_PENDING_COPY: PairAssistCopy = {
  shortName: "ISL",
  badge: "ISL pending",
  label: "Indian Sign Language (ISL) — pending",
  disclaimer:
    "Indian Sign Language (ISL, ISO ins) is registered for multi-lang architecture. Coming later / pending Deaf-led ISL eval and local ISL-community ownership. Not a live ISL overlay. Not ASL. Not an interpreter. Captions stay on.",
  glossNote:
    "ISL path pending — no ISL gloss or clips yet. ASL assets are not used as ISL.",
  clipStageHint:
    "ISL gold clip pack CapEx-blocked. No synthetic persona. No ASL clips under ISL label.",
};

const DISABLED =
  "Not evaluated / not shipped — per-language Deaf-led ownership + eval required." as const;

/**
 * Canonical registry. Product “ISL” always means Indian Sign Language (`ins`).
 * Irish Sign Language (`isg`) is not in this registry (out of scope).
 */
export const LANGUAGE_PAIRS: readonly LanguagePair[] = [
  {
    id: "en-ase",
    spokenLocale: "en",
    signLanguageIso: "ase",
    displayName: "American Sign Language (ASL)",
    shortName: "ASL",
    uiStatus: "live",
    evalStatus: "habit_shell_scaffold",
    liveAssistEnabled: true,
    clipPackStatus: "pending",
    flagKey: "pairs.en-ase",
    localDeafOwnership: true,
    assistCopy: ASL_COPY,
    pickerHint: null,
    clipManifestHook: "lexical/ase/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/ase/fingerspell",
    assetNamespace: "ase",
  },
  {
    id: "en-ins",
    spokenLocale: "en",
    signLanguageIso: "ins",
    displayName: "Indian Sign Language (ISL)",
    shortName: "ISL",
    uiStatus: "pending",
    evalStatus: "not_evaluated",
    liveAssistEnabled: false,
    clipPackStatus: "pending",
    flagKey: "pairs.en-ins",
    localDeafOwnership: false,
    assistCopy: ISL_PENDING_COPY,
    pickerHint: "Coming later / pending Deaf-led ISL eval",
    clipManifestHook: "lexical/ins/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/ins/fingerspell",
    assetNamespace: "ins",
  },
  {
    id: "en-bfi",
    spokenLocale: "en",
    signLanguageIso: "bfi",
    displayName: "British Sign Language (BSL)",
    shortName: "BSL",
    uiStatus: "disabled",
    evalStatus: "not_evaluated",
    liveAssistEnabled: false,
    clipPackStatus: "pending",
    flagKey: "pairs.en-bfi",
    localDeafOwnership: false,
    assistCopy: {
      shortName: "BSL",
      badge: "BSL",
      label: "BSL — not shipped",
      disclaimer: DISABLED,
      glossNote: DISABLED,
      clipStageHint: DISABLED,
    },
    pickerHint: DISABLED,
    clipManifestHook: "lexical/bfi/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/bfi/fingerspell",
    assetNamespace: "bfi",
  },
  {
    id: "fr-fsl",
    spokenLocale: "fr",
    signLanguageIso: "fsl",
    displayName: "French Sign Language (LSF)",
    shortName: "LSF",
    uiStatus: "disabled",
    evalStatus: "not_evaluated",
    liveAssistEnabled: false,
    clipPackStatus: "pending",
    flagKey: "pairs.fr-fsl",
    localDeafOwnership: false,
    assistCopy: {
      shortName: "LSF",
      badge: "LSF",
      label: "LSF — not shipped",
      disclaimer: DISABLED,
      glossNote: DISABLED,
      clipStageHint: DISABLED,
    },
    pickerHint: DISABLED,
    clipManifestHook: "lexical/fsl/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/fsl/fingerspell",
    assetNamespace: "fsl",
  },
  {
    id: "de-gsg",
    spokenLocale: "de",
    signLanguageIso: "gsg",
    displayName: "German Sign Language (DGS)",
    shortName: "DGS",
    uiStatus: "disabled",
    evalStatus: "not_evaluated",
    liveAssistEnabled: false,
    clipPackStatus: "pending",
    flagKey: "pairs.de-gsg",
    localDeafOwnership: false,
    assistCopy: {
      shortName: "DGS",
      badge: "DGS",
      label: "DGS — not shipped",
      disclaimer: DISABLED,
      glossNote: DISABLED,
      clipStageHint: DISABLED,
    },
    pickerHint: DISABLED,
    clipManifestHook: "lexical/gsg/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/gsg/fingerspell",
    assetNamespace: "gsg",
  },
  {
    id: "pt-bzs",
    spokenLocale: "pt",
    signLanguageIso: "bzs",
    displayName: "Brazilian Sign Language (Libras)",
    shortName: "Libras",
    uiStatus: "disabled",
    evalStatus: "not_evaluated",
    liveAssistEnabled: false,
    clipPackStatus: "pending",
    flagKey: "pairs.pt-bzs",
    localDeafOwnership: false,
    assistCopy: {
      shortName: "Libras",
      badge: "Libras",
      label: "Libras — not shipped",
      disclaimer: DISABLED,
      glossNote: DISABLED,
      clipStageHint: DISABLED,
    },
    pickerHint: DISABLED,
    clipManifestHook: "lexical/bzs/CLIP_PACK.json",
    fingerspellAssetPrefix: "lexical/bzs/fingerspell",
    assetNamespace: "bzs",
  },
] as const;

export const DEFAULT_LANGUAGE_PAIR_ID: LanguagePairId = "en-ase";

export const LANGUAGE_PAIR_BY_ID: ReadonlyMap<LanguagePairId, LanguagePair> = new Map(
  LANGUAGE_PAIRS.map((p) => [p.id, p]),
);

export function getLanguagePair(
  id: LanguagePairId | string | null | undefined,
): LanguagePair {
  if (id && LANGUAGE_PAIR_BY_ID.has(id as LanguagePairId)) {
    return LANGUAGE_PAIR_BY_ID.get(id as LanguagePairId)!;
  }
  return LANGUAGE_PAIR_BY_ID.get(DEFAULT_LANGUAGE_PAIR_ID)!;
}

/** Pairs shown in the language picker (live + pending; not disabled). */
export function pickerLanguagePairs(): readonly LanguagePair[] {
  return LANGUAGE_PAIRS.filter((p) => p.uiStatus === "live" || p.uiStatus === "pending");
}

export function liveLanguagePairs(): readonly LanguagePair[] {
  return LANGUAGE_PAIRS.filter((p) => p.liveAssistEnabled);
}

export function disabledLanguagePairs(): readonly LanguagePair[] {
  return LANGUAGE_PAIRS.filter((p) => p.uiStatus === "disabled");
}

export function isLivePairId(id: string): id is LanguagePairId {
  const p = LANGUAGE_PAIR_BY_ID.get(id as LanguagePairId);
  return p?.liveAssistEnabled === true;
}

/** True when picker may highlight the pair (live or pending chrome). */
export function isPickerPairId(id: string): id is LanguagePairId {
  const p = LANGUAGE_PAIR_BY_ID.get(id as LanguagePairId);
  return p?.uiStatus === "live" || p?.uiStatus === "pending";
}

export function indianSignLanguagePair(): LanguagePair {
  return LANGUAGE_PAIR_BY_ID.get("en-ins")!;
}

export const MULTILANG_CLAIM_NOTE =
  "Multi-lang architecture: ASL (ase) habit shell live; Indian Sign Language ISL (ins) pending Deaf-led eval — not multi-language production live. Irish Sign Language (isg) out of scope." as const;
