import type { CaptionCue } from "@asl/shared-types";

/**
 * Caption-clock sync math (pure). Overlay plays against media time;
 * captions remain the reliability floor — this module never hides them.
 */

export interface SyncResult {
  readonly activeCue: CaptionCue | null;
  readonly lagMs: number;
  readonly withinWindow: boolean;
}

/** Find the cue covering mediaTimeMs (inclusive start, exclusive end). */
export function findActiveCue(
  cues: readonly CaptionCue[],
  mediaTimeMs: number,
): CaptionCue | null {
  for (const cue of cues) {
    if (mediaTimeMs >= cue.startMs && mediaTimeMs < cue.endMs) {
      return cue;
    }
  }
  return null;
}

/**
 * Lag of overlay clock vs media clock. Positive = overlay behind media.
 * Used for fixture SLO checks later; Slice A exposes the math only.
 */
export function computeLagMs(mediaTimeMs: number, overlayTimeMs: number): number {
  return mediaTimeMs - overlayTimeMs;
}

export function syncToCaptions(
  cues: readonly CaptionCue[],
  mediaTimeMs: number,
  overlayTimeMs: number,
  maxLagMs = 500,
): SyncResult {
  const activeCue = findActiveCue(cues, mediaTimeMs);
  const lagMs = computeLagMs(mediaTimeMs, overlayTimeMs);
  return {
    activeCue,
    lagMs,
    withinWindow: Math.abs(lagMs) <= maxLagMs,
  };
}

/** Parse a simple VTT-like fixture line block into cues (Slice A fixtures). */
export function parseSimpleVtt(vtt: string): CaptionCue[] {
  const lines = vtt.replace(/\r\n/g, "\n").split("\n");
  const cues: CaptionCue[] = [];
  let i = 0;
  let idx = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";
    if (line.includes("-->")) {
      const [startRaw, endRaw] = line.split("-->").map((s) => s.trim());
      const startMs = parseTimestamp(startRaw ?? "");
      const endMs = parseTimestamp((endRaw ?? "").split(" ")[0] ?? "");
      i += 1;
      const textParts: string[] = [];
      while (i < lines.length && (lines[i]?.trim() ?? "") !== "") {
        textParts.push(lines[i] ?? "");
        i += 1;
      }
      cues.push({
        id: `cue-${idx++}`,
        startMs,
        endMs,
        text: textParts.join(" ").trim(),
      });
    }
    i += 1;
  }
  return cues;
}

function parseTimestamp(ts: string): number {
  // Supports mm:ss.mmm or hh:mm:ss.mmm
  const parts = ts.split(":");
  if (parts.length === 2) {
    const [mm, rest] = parts;
    const [ss, ms = "0"] = (rest ?? "").split(".");
    return (
      Number(mm) * 60_000 + Number(ss) * 1_000 + Number(ms.padEnd(3, "0").slice(0, 3))
    );
  }
  if (parts.length === 3) {
    const [hh, mm, rest] = parts;
    const [ss, ms = "0"] = (rest ?? "").split(".");
    return (
      Number(hh) * 3_600_000 +
      Number(mm) * 60_000 +
      Number(ss) * 1_000 +
      Number(ms.padEnd(3, "0").slice(0, 3))
    );
  }
  return 0;
}
