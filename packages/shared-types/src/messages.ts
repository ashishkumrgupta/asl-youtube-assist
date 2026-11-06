/**
 * Fail-closed runtime message parsing for MV3 ports.
 * Never trust raw postMessage / onMessage payloads by TypeScript cast alone.
 */

import type { OverlayState, RuntimeMessage } from "./index.js";
// import type only — avoid runtime cycle with index re-exports.

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isOverlayState(v: unknown): v is OverlayState {
  if (!isRecord(v)) return false;
  return (
    typeof v.enabled === "boolean" &&
    typeof v.label === "string" &&
    v.captionsFloorIntact === true &&
    typeof v.criticalGateBlocked === "boolean" &&
    (v.gateReason === null || typeof v.gateReason === "string") &&
    (v.activeCueId === null || typeof v.activeCueId === "string") &&
    typeof v.placeholderMode === "boolean" &&
    typeof v.languagePairId === "string" &&
    typeof v.liveAssistEnabled === "boolean" &&
    (v.claimTier === "assist_partial" || v.claimTier === "human_interpretation")
  );
}

/** Parse unknown IPC payload; return null if shape is invalid. */
export function parseRuntimeMessage(raw: unknown): RuntimeMessage | null {
  if (!isRecord(raw) || typeof raw.type !== "string") return null;

  switch (raw.type) {
    case "GET_STATE":
      return { type: "GET_STATE" };
    case "TOGGLE_OVERLAY":
      if (typeof raw.enabled !== "boolean") return null;
      return { type: "TOGGLE_OVERLAY", enabled: raw.enabled };
    case "SET_LANGUAGE_PAIR":
      if (typeof raw.languagePairId !== "string") return null;
      if (raw.languagePairId.length === 0 || raw.languagePairId.length > 32) {
        return null;
      }
      if (!/^[a-z]{2}-[a-z]{3}$/.test(raw.languagePairId)) return null;
      return { type: "SET_LANGUAGE_PAIR", languagePairId: raw.languagePairId };
    case "STATE":
      if (!isOverlayState(raw.state)) return null;
      return { type: "STATE", state: raw.state };
    case "CRITICAL_GATE_RESULT":
      if (typeof raw.blocked !== "boolean") return null;
      if (!(raw.reason === null || typeof raw.reason === "string")) return null;
      if (typeof raw.reason === "string" && raw.reason.length > 200) return null;
      return {
        type: "CRITICAL_GATE_RESULT",
        blocked: raw.blocked,
        reason: raw.reason,
      };
    default:
      return null;
  }
}

/** True when extension message sender is this extension (not a web page). */
export function isTrustedExtensionSender(sender: {
  readonly id?: string | undefined;
}): boolean {
  try {
    return (
      typeof chrome !== "undefined" &&
      typeof sender.id === "string" &&
      sender.id === chrome.runtime.id
    );
  } catch {
    return false;
  }
}
