/**
 * Banned-term checks for assist-path user-facing copy.
 * Stop-ship aligned: never call assist an interpreter; never emit accuracy %.
 */

export type CopySurface = "assist" | "human_tier_a" | "critical_gate" | "generic";

export interface CopyViolation {
  readonly term: string;
  readonly reason: string;
}

/** Patterns banned on assist / Tier B surfaces. */
const ASSIST_BANNED: ReadonlyArray<{ pattern: RegExp; term: string; reason: string }> = [
  {
    pattern: /\bai\s+interpreter\b/i,
    term: "AI interpreter",
    reason: "Assist must not be framed as an interpreter",
  },
  {
    pattern: /\bdigital\s+interpreter\b/i,
    term: "digital interpreter",
    reason: "Assist must not be framed as an interpreter",
  },
  {
    pattern: /\breal[- ]?time\s+asl\s+interpretation\b/i,
    term: "real-time ASL interpretation",
    reason: "Interpretation reserved for human Tier A",
  },
  {
    pattern: /\binterpreter-grade\b/i,
    term: "interpreter-grade",
    reason: "Accuracy/interpreter-grade claims require Deaf-led eval",
  },
  {
    pattern: /\b100\s*%\s*accurate\b/i,
    term: "100% accurate",
    reason: "No accuracy percent without Deaf-led eval",
  },
  {
    pattern: /\b\d{1,3}\s*%\s*(accurate|accuracy|asl)\b/i,
    term: "accuracy %",
    reason: "No accuracy percent without Deaf-led eval",
  },
  {
    pattern: /\basl\s+captions\b/i,
    term: "ASL captions",
    reason: "Do not equate English captions with ASL access",
  },
  {
    pattern: /\bfluent\s+asl\s+from\s+captions\b/i,
    term: "fluent ASL from captions",
    reason: "Overclaim — stop-ship",
  },
  {
    pattern: /\breplaces\s+interpreters?\b/i,
    term: "replaces interpreters",
    reason: "Never claim assist replaces interpreters",
  },
  {
    pattern: /\bbetter\s+than\s+captions\b/i,
    term: "better than captions",
    reason: "Usefulness-vs-captions blocked until AC-1.3/1.4 Deaf cohort",
  },
  {
    pattern: /\bhelps\s+(follow|more)\s+than\s+captions\b/i,
    term: "helps more than captions",
    reason: "Usefulness-vs-captions blocked until AC-1.3/1.4 Deaf cohort",
  },
  {
    pattern: /\buseful\s+entertainment\s+assist\b/i,
    term: "useful entertainment assist",
    reason: "Phase 1 usefulness fitness claim blocked until cohort evidence",
  },
  {
    pattern: /\bas\s+good\s+as\s+a\s+person\b/i,
    term: "as good as a person",
    reason: "AI must not claim human/Deaf equivalence (AC-DP0.8)",
  },
  {
    pattern: /\bai\s+replaces\s+(outreach|volunteers?)\b/i,
    term: "AI replaces outreach",
    reason: "AI interim must not replace volunteer / lab outreach",
  },
  {
    pattern: /\bai[- ]?(generated\s+)?(gold|interpreter[- ]grade)\b/i,
    term: "AI gold/interpreter-grade",
    reason: "AI ≠ gold / never interpreter-grade (DUAL-5)",
  },
  {
    pattern: /\bgold\s+(via\s+)?ai\b|\binterpreter[- ]grade\s+ai\b/i,
    term: "AI gold/interpreter-grade",
    reason: "AI ≠ gold / never interpreter-grade (DUAL-5)",
  },
];

const ALWAYS_BANNED_ON_TIER_A = new Set([
  "100% accurate",
  "accuracy %",
  "ASL captions",
  "fluent ASL from captions",
  "replaces interpreters",
]);

/**
 * Scan user-facing copy for assist-path violations.
 * Human Tier A surfaces may use "interpreter" / "interpretation" when source is human.
 */
export function lintAssistCopy(
  text: string,
  surface: CopySurface = "assist",
): CopyViolation[] {
  const violations: CopyViolation[] = [];

  for (const ban of ASSIST_BANNED) {
    if (!ban.pattern.test(text)) continue;
    if (surface === "human_tier_a" && !ALWAYS_BANNED_ON_TIER_A.has(ban.term)) {
      continue;
    }
    violations.push({ term: ban.term, reason: ban.reason });
  }

  if (surface === "assist" || surface === "generic") {
    const allowedNegation =
      /\bnot\s+(an?\s+)?(human\s+)?interpreter\b/i.test(text) ||
      /\bdoes\s+not\s+replace\b/i.test(text) ||
      /\bseek\s+a\s+qualified\s+human\s+interpreter\b/i.test(text) ||
      /\bprefer\s+a\s+human\s+interpretation\b/i.test(text);

    const claimsAssistIsInterpreter =
      /\b(our|the|this)\s+(ai\s+|digital\s+|asl\s+)?interpreter\b/i.test(text) ||
      (/\b(interpreter|interpretation|interpreted)\b/i.test(text) &&
        !allowedNegation &&
        !/\bhuman\s+interpretation\b/i.test(text) &&
        !/\bqualified\s+human\s+interpreter\b/i.test(text));

    if (claimsAssistIsInterpreter) {
      violations.push({
        term: "interpreter/interpretation",
        reason: "Assist surfaces must use ASL assist / partial, not interpreter language",
      });
    }
  }

  return dedupe(violations);
}

export function assertAssistCopyClean(text: string): void {
  const v = lintAssistCopy(text, "assist");
  if (v.length > 0) {
    throw new Error(
      `Assist copy violations: ${v.map((x) => `${x.term} (${x.reason})`).join("; ")}`,
    );
  }
}

function dedupe(list: CopyViolation[]): CopyViolation[] {
  const seen = new Set<string>();
  return list.filter((v) => {
    const key = `${v.term}|${v.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
