import { CRITICAL_DOMAINS, type CriticalDomain } from "@asl/shared-types";

/**
 * Critical-domain hard gate (Slice A stub).
 * Health / legal / safety must not run unsupervised assist as sole channel.
 *
 * Detection is a keyword heuristic on caller-supplied tokens (title/description) —
 * not content understanding. User-facing copy must say so.
 */

/** Prefix for all Slice A gate user messages — honesty about stub detection. */
export const GATE_STUB_NOTICE = "Keyword stub only — not content understanding." as const;

export interface GateInput {
  /** Detected or declared domain tags for the video / page. */
  readonly domains: readonly string[];
  /** True when a qualified human interpretation path is available. */
  readonly humanPathAvailable: boolean;
  /** User explicitly acknowledges captions-only / seeks human help (Slice A: always false). */
  readonly userAcknowledgedCaptionsOnly?: boolean;
}

export interface GateResult {
  readonly blocked: boolean;
  readonly matchedDomains: readonly CriticalDomain[];
  readonly reason: string | null;
  /** User-facing copy — honest, no interpreter claim for assist. */
  readonly userMessage: string | null;
}

const KEYWORDS: Readonly<Record<CriticalDomain, readonly string[]>> = {
  health: [
    "health",
    "medical",
    "medicine",
    "hospital",
    "diagnosis",
    "clinical",
    "pharmacy",
    "doctor",
  ],
  legal: ["legal", "lawyer", "attorney", "court", "lawsuit", "rights", "contract"],
  safety: [
    "safety",
    "emergency",
    "evacuate",
    "911",
    "disaster",
    "warning",
    "hazard",
    "alert",
  ],
};

export function detectCriticalDomains(domains: readonly string[]): CriticalDomain[] {
  const matched = new Set<CriticalDomain>();
  const lowered = domains.map((d) => d.toLowerCase());
  for (const domain of CRITICAL_DOMAINS) {
    const keys = KEYWORDS[domain];
    for (const token of lowered) {
      if (keys.some((k) => token === k || token.includes(k))) {
        matched.add(domain);
      }
    }
  }
  return CRITICAL_DOMAINS.filter((d) => matched.has(d));
}

/**
 * Hard gate: unsupervised assist blocked when critical domains match
 * and no human path is available.
 */
export function evaluateCriticalGate(input: GateInput): GateResult {
  const matchedDomains = detectCriticalDomains(input.domains);
  if (matchedDomains.length === 0) {
    return {
      blocked: false,
      matchedDomains: [],
      reason: null,
      userMessage: null,
    };
  }

  if (input.humanPathAvailable) {
    return {
      blocked: false,
      matchedDomains,
      reason: null,
      userMessage: `${GATE_STUB_NOTICE} Title/description keywords matched ${matchedDomains.join(", ")}. Prefer a human interpretation path when available. Captions remain on.`,
    };
  }

  return {
    blocked: true,
    matchedDomains,
    reason: `unsupervised_assist_blocked:${matchedDomains.join(",")}`,
    userMessage: `${GATE_STUB_NOTICE} Title/description keywords matched ${matchedDomains.join(", ")}. ASL assist stays off as the sole channel — use captions and seek a qualified human interpreter. This overlay is not an interpreter.`,
  };
}

export function isCriticalDomainBlocked(input: GateInput): boolean {
  return evaluateCriticalGate(input).blocked;
}
