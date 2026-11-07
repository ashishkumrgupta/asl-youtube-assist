/**
 * Static allowlist for remote link-out (discovery only).
 * No YouTube→CDN mirror. No arbitrary scrape URLs.
 */

import type { AssistPlaylistStep } from "./playlist.js";

export interface RemoteLinkAllowEntry {
  readonly gloss: string;
  readonly url: string;
  readonly hostLabel: string;
  readonly creatorCredit: string;
  readonly note: string;
}

/**
 * Demo allowlist — PopSign project page / Commons-style discovery targets.
 * Not a redistrib license for in-extension cache.
 */
export const REMOTE_LINK_ALLOWLIST: readonly RemoteLinkAllowEntry[] = [
  {
    gloss: "HELLO",
    url: "https://www.popsign.org/",
    hostLabel: "popsign.org",
    creatorCredit: "PopSign / GT–NTID (project page)",
    note: "Creator-hosted discovery link — not our pack; not an interpreter.",
  },
  {
    gloss: "THANKS",
    url: "https://commons.wikimedia.org/wiki/Category:American_Sign_Language",
    hostLabel: "commons.wikimedia.org",
    creatorCredit: "Wikimedia Commons — ASL category",
    note: "Creator-hosted / Commons discovery — not our commissioned pack.",
  },
] as const;

export const REMOTE_LINK_HONESTY =
  "Opening creator-hosted media — not our pack · not an interpreter" as const;

/** Normalize for allowlist equality (https only; strip hash; trim trailing slash). */
export function normalizeRemoteUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") return null;
    u.hash = "";
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return `${u.origin}${path}${u.search}`;
  } catch {
    return null;
  }
}

export function findAllowlistedRemoteUrl(url: string): RemoteLinkAllowEntry | null {
  const norm = normalizeRemoteUrl(url);
  if (!norm) return null;
  return (
    REMOTE_LINK_ALLOWLIST.find((e) => normalizeRemoteUrl(e.url) === norm) ?? null
  );
}

export function isAllowlistedRemoteUrl(url: string): boolean {
  return findAllowlistedRemoteUrl(url) !== null;
}

export function remoteLinkForGloss(gloss: string): RemoteLinkAllowEntry | null {
  const key = gloss.trim().toUpperCase();
  return REMOTE_LINK_ALLOWLIST.find((e) => e.gloss === key) ?? null;
}

/**
 * Fail-closed remote URL check for Tier B ingest.
 * Requires https AND membership in REMOTE_LINK_ALLOWLIST.
 */
export function validateRemoteUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return "remoteUrl must be https";
  } catch {
    return "remoteUrl is not a valid URL";
  }
  if (!isAllowlistedRemoteUrl(url)) {
    return "remoteUrl is not on the static allowlist (no arbitrary scrape URLs)";
  }
  return null;
}

export interface ResolvedLinkOut {
  readonly url: string;
  readonly credit: string;
  readonly honesty: string;
  readonly hostLabel: string;
}

/**
 * Resolve link-out for a playlist step — allowlist only.
 * Never returns a non-allowlisted href even if `step.remoteUrl` is crafted.
 */
export function resolveLinkOutForStep(
  step: AssistPlaylistStep | null | undefined,
): ResolvedLinkOut | null {
  if (!step || step.kind !== "lexical") return null;

  // Crafted non-allowlisted remoteUrl → refuse (do not fall through to gloss discovery).
  if (step.remoteUrl && !isAllowlistedRemoteUrl(step.remoteUrl)) {
    return null;
  }

  if (step.remoteUrl) {
    const entry = findAllowlistedRemoteUrl(step.remoteUrl);
    if (!entry) return null;
    return {
      url: entry.url,
      credit: `${entry.hostLabel} · ${entry.creatorCredit}`,
      honesty: REMOTE_LINK_HONESTY,
      hostLabel: entry.hostLabel,
    };
  }

  const byGloss = remoteLinkForGloss(step.gloss);
  if (!byGloss) return null;
  return {
    url: byGloss.url,
    credit: `${byGloss.hostLabel} · ${byGloss.creatorCredit}`,
    honesty: REMOTE_LINK_HONESTY,
    hostLabel: byGloss.hostLabel,
  };
}
