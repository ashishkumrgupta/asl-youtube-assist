import type { OverlayState, RuntimeMessage } from "@asl/shared-types";

export type { OverlayState, RuntimeMessage };

export function isRuntimeMessage(value: unknown): value is RuntimeMessage {
  if (!value || typeof value !== "object") return false;
  const t = (value as { type?: unknown }).type;
  return (
    t === "TOGGLE_OVERLAY" ||
    t === "GET_STATE" ||
    t === "STATE" ||
    t === "CRITICAL_GATE_RESULT"
  );
}
