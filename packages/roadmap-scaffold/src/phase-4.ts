/**
 * Phase 4 scaffolds: spoken→sign language pair registry.
 * ASL-only active until Phase 2 eval bar is solid (export gate).
 */

export type SignLanguageId = "asl" | "bsl" | "lsf" | "dgs" | "libras";

export type LanguagePairStatus = "active" | "blocked_until_asl_eval" | "planned";

export interface LanguagePair {
  readonly spoken: "en" | "fr" | "de" | "pt";
  readonly sign: SignLanguageId;
  readonly status: LanguagePairStatus;
  readonly localDeafOwnership: boolean;
}

export const LANGUAGE_PAIRS: readonly LanguagePair[] = [
  {
    spoken: "en",
    sign: "asl",
    status: "active",
    localDeafOwnership: true,
  },
  {
    spoken: "en",
    sign: "bsl",
    status: "blocked_until_asl_eval",
    localDeafOwnership: false,
  },
  {
    spoken: "fr",
    sign: "lsf",
    status: "blocked_until_asl_eval",
    localDeafOwnership: false,
  },
  {
    spoken: "de",
    sign: "dgs",
    status: "blocked_until_asl_eval",
    localDeafOwnership: false,
  },
  {
    spoken: "pt",
    sign: "libras",
    status: "blocked_until_asl_eval",
    localDeafOwnership: false,
  },
] as const;

export interface AslExportGate {
  readonly aslPhase2EvalSolid: boolean;
  readonly mayExportProcessToOtherLanguages: boolean;
}

export function aslExportGate(aslPhase2EvalSolid: boolean): AslExportGate {
  // Scaffold: never export until a future wired eval flag lands (CapEx + Deaf-led).
  void aslPhase2EvalSolid;
  return {
    aslPhase2EvalSolid: false,
    mayExportProcessToOtherLanguages: false,
  };
}

export function activeLanguagePairs(): readonly LanguagePair[] {
  return LANGUAGE_PAIRS.filter((p) => p.status === "active");
}

export const PHASE_4_NOTE =
  "Multi-language scaffold — do not market additional sign languages until ASL eval bar + local Deaf ownership." as const;
