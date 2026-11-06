import type { CaptionCue } from "@asl/shared-types";

/**
 * Best-effort caption ingest from YouTube watch page.
 * Prefer timed text tracks on the HTML5 video; fall back to empty (prompt CC).
 * Never invent speech. Never strip page captions.
 */

export function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector("video.html5-main-video");
}

export function readTextTrackCues(video: HTMLVideoElement): CaptionCue[] {
  const cues: CaptionCue[] = [];
  const tracks = video.textTracks;
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i];
    if (!track) continue;
    // Keep track mode as the page set it — do not force hide native CC.
    const list = track.cues;
    if (!list) continue;
    for (let j = 0; j < list.length; j += 1) {
      const cue = list[j];
      if (!cue) continue;
      const text =
        "text" in cue &&
        typeof (cue as TextTrackCue & { text?: string }).text === "string"
          ? (cue as TextTrackCue & { text: string }).text
          : "";
      cues.push({
        id: `yt-${i}-${j}`,
        startMs: Math.round(cue.startTime * 1000),
        endMs: Math.round(cue.endTime * 1000),
        text: sanitizeCaptionText(text),
      });
    }
  }
  return cues;
}

export function sanitizeCaptionText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

/** Heuristic domain tokens from title + description for critical-gate stub. */
export function extractPageDomainTokens(): string[] {
  const tokens: string[] = [];
  const title = document.title || "";
  tokens.push(...tokenize(title));
  const desc =
    document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  tokens.push(...tokenize(desc));
  return tokens;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+]+/g)
    .filter((t) => t.length >= 3);
}
