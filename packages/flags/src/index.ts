/**
 * Capability-named feature flags. Experimental signing paths default off in prod.
 * Phase 1b–5 scaffolds: flags exist so wiring can land; defaults stay fail-closed.
 */

export type FlagName =
  | "assist.lexical.v1"
  | "assist.overlay.v1"
  | "assist.stitching.v2"
  | "assist.gloss.v1"
  | "avatar.neural"
  | "catalog.tierA"
  | "catalog.tierA.ingest"
  | "mode.study"
  | "eval.comprehension.v1"
  | "scale.mobile_companion"
  | "scale.creator_batch"
  | "i18n.sign_pairs"
  | "claim.interpretation_allowlist"
  | "label.interpreter_domains";

export type EnvName = "local" | "preview" | "staging" | "production";

export type FlagDefaults = Readonly<Record<FlagName, boolean>>;

/** Local: Slice A paths on; later-phase scaffolds discoverable but off. */
const LOCAL: FlagDefaults = {
  "assist.lexical.v1": true,
  "assist.overlay.v1": true,
  "assist.stitching.v2": true,
  "assist.gloss.v1": true,
  "avatar.neural": false,
  "catalog.tierA": false,
  "catalog.tierA.ingest": false,
  "mode.study": false,
  "eval.comprehension.v1": false,
  "scale.mobile_companion": false,
  "scale.creator_batch": false,
  "i18n.sign_pairs": false,
  "claim.interpretation_allowlist": false,
  "label.interpreter_domains": true,
};

const PRODUCTION: FlagDefaults = {
  "assist.lexical.v1": true,
  "assist.overlay.v1": true,
  "assist.stitching.v2": true,
  "assist.gloss.v1": true,
  "avatar.neural": false,
  "catalog.tierA": false,
  "catalog.tierA.ingest": false,
  "mode.study": false,
  "eval.comprehension.v1": false,
  "scale.mobile_companion": false,
  "scale.creator_batch": false,
  "i18n.sign_pairs": false,
  "claim.interpretation_allowlist": false,
  "label.interpreter_domains": true,
};

const BY_ENV: Readonly<Record<EnvName, FlagDefaults>> = {
  local: LOCAL,
  preview: LOCAL,
  staging: {
    ...LOCAL,
    "catalog.tierA": false,
    "mode.study": false,
    "avatar.neural": false,
  },
  production: PRODUCTION,
};

export function defaultsForEnv(env: EnvName): FlagDefaults {
  return BY_ENV[env];
}

export function isEnabled(
  env: EnvName,
  flag: FlagName,
  overrides: Partial<Record<FlagName, boolean>> = {},
): boolean {
  if (Object.prototype.hasOwnProperty.call(overrides, flag)) {
    return Boolean(overrides[flag]);
  }
  return defaultsForEnv(env)[flag];
}

/** Neural / study / multi-lang / interpretation allow-list stay off in production defaults. */
export function experimentalSigningOffInProd(env: EnvName): boolean {
  const d = defaultsForEnv(env);
  return (
    d["avatar.neural"] === false &&
    d["mode.study"] === false &&
    d["i18n.sign_pairs"] === false &&
    d["claim.interpretation_allowlist"] === false
  );
}

/** Phase 1b–5 CapEx/eval-gated flags — all false in production defaults. */
export function laterPhaseFlagsOffInProd(env: EnvName): boolean {
  const d = defaultsForEnv(env);
  return (
    d["catalog.tierA"] === false &&
    d["catalog.tierA.ingest"] === false &&
    d["eval.comprehension.v1"] === false &&
    d["scale.mobile_companion"] === false &&
    d["scale.creator_batch"] === false &&
    d["i18n.sign_pairs"] === false &&
    d["claim.interpretation_allowlist"] === false
  );
}
