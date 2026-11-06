import type { AssistPlaylistStep } from "@asl/lexical";

/**
 * Stitch / timing: fit assist steps into a caption cue window.
 * Phase 1 improvement over Phase 0 raw sequential durations that can overrun the cue.
 */

export interface StitchedPlaylist {
  readonly steps: readonly AssistPlaylistStep[];
  readonly cueDurationMs: number;
  readonly totalUnscaledMs: number;
  readonly scale: number;
  readonly truncated: boolean;
}

const MIN_STEP_MS = 280;
const MAX_STEPS_IN_CUE = 6;

function withDuration(step: AssistPlaylistStep, durationMs: number): AssistPlaylistStep {
  if (step.kind === "lexical") {
    return { ...step, durationMs };
  }
  return { ...step, durationMs };
}

/**
 * Fit steps into cueDurationMs:
 * 1) Cap step count (prefer earlier content)
 * 2) Scale durations to fill cue (not exceed)
 * 3) Enforce minimum per-step hold when possible
 */
export function stitchIntoCue(
  steps: readonly AssistPlaylistStep[],
  cueDurationMs: number,
): StitchedPlaylist {
  const cue = Math.max(cueDurationMs, MIN_STEP_MS);
  let truncated = false;
  let picked = [...steps];
  if (picked.length > MAX_STEPS_IN_CUE) {
    picked = picked.slice(0, MAX_STEPS_IN_CUE);
    truncated = true;
  }

  const totalUnscaledMs = picked.reduce((sum, s) => sum + s.durationMs, 0);
  if (picked.length === 0 || totalUnscaledMs === 0) {
    return {
      steps: [],
      cueDurationMs: cue,
      totalUnscaledMs: 0,
      scale: 1,
      truncated,
    };
  }

  let scale = cue / totalUnscaledMs;
  // Prefer not to stretch beyond 1.35× (avoid sluggish holds).
  if (scale > 1.35) scale = 1.35;

  let fitted = picked.map((s) =>
    withDuration(s, Math.max(MIN_STEP_MS, Math.round(s.durationMs * scale))),
  );

  let total = fitted.reduce((sum, s) => sum + s.durationMs, 0);
  if (total > cue) {
    // Drop trailing steps until fit (improved vs Phase 0 overrun).
    while (fitted.length > 1 && total > cue) {
      fitted = fitted.slice(0, -1);
      truncated = true;
      total = fitted.reduce((sum, s) => sum + s.durationMs, 0);
    }
    if (total > cue && fitted[0]) {
      fitted = [withDuration(fitted[0], cue)];
    }
  }

  const finalTotal = fitted.reduce((sum, s) => sum + s.durationMs, 0);
  return {
    steps: fitted,
    cueDurationMs: cue,
    totalUnscaledMs,
    scale: finalTotal / Math.max(totalUnscaledMs, 1),
    truncated,
  };
}

export function stepAtElapsedStitched(
  steps: readonly AssistPlaylistStep[],
  elapsedMs: number,
): AssistPlaylistStep | null {
  if (steps.length === 0) return null;
  let t = 0;
  for (const step of steps) {
    const end = t + step.durationMs;
    if (elapsedMs >= t && elapsedMs < end) return step;
    t = end;
  }
  return steps[steps.length - 1] ?? null;
}
