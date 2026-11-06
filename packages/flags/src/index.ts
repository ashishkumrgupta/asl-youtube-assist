/**
 * Capability-named feature flags. Experimental signing paths default off in prod.
 */

export type FlagName =
  | "assist.lexical.v1"
  | "assist.overlay.v1"
  | "assist.stitching.v2"
  | "avatar.neural"
  | "catalog.tierA"
  | "label.interpreter_domains";

export type EnvName = "local" | "preview" | "staging" | "production";

export type FlagDefaults = Readonly<Record<FlagName, boolean>>;

const LOCAL: FlagDefaults = {
  "assist.lexical.v1": true,
  "assist.overlay.v1": true,
  "assist.stitching.v2": false,
  "avatar.neural": false,
  "catalog.tierA": false,
  "label.interpreter_domains": true,
};

const PRODUCTION: FlagDefaults = {
  "assist.lexical.v1": true,
  "assist.overlay.v1": true,
  "assist.stitching.v2": false,
  "avatar.neural": false,
  "catalog.tierA": false,
  "label.interpreter_domains": true,
};

const BY_ENV: Readonly<Record<EnvName, FlagDefaults>> = {
  local: LOCAL,
  preview: LOCAL,
  staging: {
    ...LOCAL,
    "catalog.tierA": false,
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

/** Neural / stitch experimental paths must stay off in production defaults. */
export function experimentalSigningOffInProd(env: EnvName): boolean {
  const d = defaultsForEnv(env);
  return d["avatar.neural"] === false && d["assist.stitching.v2"] === false;
}
