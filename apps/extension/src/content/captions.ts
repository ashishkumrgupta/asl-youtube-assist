import type { CaptionCue } from "@asl/shared-types";

/**
 * Best-effort caption ingest from YouTube watch page (or local demo player).
 * Prefer timed text tracks; fall back to live DOM caption window (YT CC).
 * Never invent speech. Never strip page captions.
 */

const DEMO_VIDEO_SELECTOR = "video[data-asl-demo-video], #asl-demo-video";

export function getVideoElement(root: ParentNode = document): HTMLVideoElement | null {
  return (
    root.querySelector<HTMLVideoElement>("video.html5-main-video") ??
    root.querySelector<HTMLVideoElement>(DEMO_VIDEO_SELECTOR) ??
    root.querySelector<HTMLVideoElement>("video")
  );
}

/** Stable short id from caption text (for DOM live cues). */
export function captionTextId(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `dom-${(h >>> 0).toString(36)}`;
}

/**
 * Read YouTube's on-screen caption window (when TextTracks are empty).
 * Does not hide or modify native CC.
 */
export function readDomCaptionText(root: ParentNode = document): string | null {
  const selectors = [
    ".ytp-caption-segment",
    ".captions-text .ytp-caption-segment",
    ".ytp-caption-window-container .ytp-caption-segment",
    ".caption-window .ytp-caption-segment",
    "[data-asl-demo-caption]",
  ];
  const parts: string[] = [];
  for (const sel of selectors) {
    const nodes = root.querySelectorAll(sel);
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const t = (node?.textContent ?? "").replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    }
    if (parts.length > 0) break;
  }
  if (parts.length === 0) return null;
  const joined = sanitizeCaptionText(parts.join(" "));
  return joined.length > 0 ? joined : null;
}

function cueFromTextTrackCue(
  cue: TextTrackCue,
  trackIndex: number,
  cueIndex: number,
): CaptionCue {
  const text =
    "text" in cue && typeof (cue as TextTrackCue & { text?: string }).text === "string"
      ? (cue as TextTrackCue & { text: string }).text
      : "";
  return {
    id: `yt-${trackIndex}-${cueIndex}`,
    startMs: Math.round(cue.startTime * 1000),
    endMs: Math.round(cue.endTime * 1000),
    text: sanitizeCaptionText(text),
  };
}

/** Full cue list from HTML5 text tracks when the browser exposes them. */
export function readTextTrackCues(video: HTMLVideoElement): CaptionCue[] {
  const cues: CaptionCue[] = [];
  const tracks = video.textTracks;
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i];
    if (!track) continue;
    // Keep track mode as the page set it — do not force-hide native CC.
    const list = track.cues;
    if (!list || list.length === 0) continue;
    for (let j = 0; j < list.length; j += 1) {
      const cue = list[j];
      if (!cue) continue;
      cues.push(cueFromTextTrackCue(cue, i, j));
    }
  }
  return cues;
}

/** Currently showing text-track cues (useful when full list is not loaded). */
export function readActiveTextTrackCues(video: HTMLVideoElement): CaptionCue[] {
  const cues: CaptionCue[] = [];
  const tracks = video.textTracks;
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i];
    if (!track) continue;
    const list = track.activeCues;
    if (!list || list.length === 0) continue;
    for (let j = 0; j < list.length; j += 1) {
      const cue = list[j];
      if (!cue) continue;
      cues.push(cueFromTextTrackCue(cue, i, j));
    }
  }
  return cues;
}

/**
 * Live DOM caption as a sliding timed cue so gloss advances with CC text.
 * Window is anchored to media time so syncToCaptions finds it every tick.
 */
export function domCaptionAsLiveCue(
  text: string,
  mediaTimeMs: number,
  holdMs = 3000,
): CaptionCue {
  const clean = sanitizeCaptionText(text);
  return {
    id: captionTextId(clean),
    startMs: Math.max(0, Math.round(mediaTimeMs) - 80),
    endMs: Math.round(mediaTimeMs) + holdMs,
    text: clean,
  };
}

export type CaptionSourceKind = "text_tracks" | "active_cues" | "dom_live" | "none";

export interface CollectedCaptions {
  readonly cues: readonly CaptionCue[];
  readonly source: CaptionSourceKind;
}

/**
 * Unified caption collection for overlay sync.
 * Prefer full text tracks → active cues → YouTube DOM caption window.
 */
export function collectCaptionCues(
  video: HTMLVideoElement,
  options: { root?: ParentNode; mediaTimeMs?: number } = {},
): CollectedCaptions {
  const root = options.root ?? document;
  const mediaTimeMs = options.mediaTimeMs ?? Math.round(video.currentTime * 1000);

  const full = readTextTrackCues(video);
  if (full.length > 0) {
    return { cues: full, source: "text_tracks" };
  }

  const active = readActiveTextTrackCues(video);
  if (active.length > 0) {
    return { cues: active, source: "active_cues" };
  }

  const domText = readDomCaptionText(root);
  if (domText) {
    return {
      cues: [domCaptionAsLiveCue(domText, mediaTimeMs)],
      source: "dom_live",
    };
  }

  return { cues: [], source: "none" };
}

/** Strip tags/controls; cap length. Always assign via textContent — never HTML. */
export function sanitizeCaptionText(raw: string): string {
  let out = "";
  for (const ch of raw.replace(/<[^>]*>/g, " ")) {
    const code = ch.charCodeAt(0);
    if (code === 0x7f) continue;
    if (code < 0x20 && ch !== "\t" && ch !== "\n" && ch !== "\r") continue;
    out += ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, 500);
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
