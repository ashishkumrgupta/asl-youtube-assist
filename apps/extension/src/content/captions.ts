import type { CaptionCue } from "@asl/shared-types";

/**
 * Best-effort caption ingest from YouTube watch page (or local demo player).
 * Prefer timed text tracks; fall back to live DOM caption window (YT CC).
 * Never invent speech. Never strip page captions.
 *
 * DOM live-cue `id` must stay stable for the lifetime of one visual caption
 * window (prefix growth must not thrash assist-runtime playlist rebuild).
 */

const DEMO_VIDEO_SELECTOR = "video[data-asl-demo-video], #asl-demo-video";

/** Brief empty-DOM ticks to absorb CC flicker without hard-reset (~3×100ms). */
export const DOM_CAPTION_EMPTY_HOLD_TICKS = 3;

/**
 * YouTube watch: only `video.html5-main-video`.
 * Local demo harness: `data-asl-demo-video` / `#asl-demo-video`.
 * Never fall back to generic `video` (ads / endscreens).
 */
export function getVideoElement(root: ParentNode = document): HTMLVideoElement | null {
  // YouTube main player or explicit theater watch video only — never ads/thumbs.
  return (
    root.querySelector<HTMLVideoElement>("video.html5-main-video") ??
    root.querySelector<HTMLVideoElement>(DEMO_VIDEO_SELECTOR)
  );
}

/** Stable short hash (used for new-window ids, not per-tick text). */
export function captionTextId(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `dom-${(h >>> 0).toString(36)}`;
}

/** True when next text is the same visual window (equal / growing / shrinking prefix). */
export function isSameCaptionWindow(prev: string, next: string): boolean {
  const a = prev.replace(/\s+/g, " ").trim().toLowerCase();
  const b = next.replace(/\s+/g, " ").trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  return b.startsWith(a) || a.startsWith(b);
}

function isElementVisible(el: Element): boolean {
  if (typeof CSS !== "undefined" && "escape" in CSS) {
    // best-effort without layout in unit tests
  }
  const style =
    typeof (el as HTMLElement).style !== "undefined"
      ? ((el as HTMLElement).getAttribute?.("style") ?? "")
      : "";
  if (/display\s*:\s*none/i.test(style) || /visibility\s*:\s*hidden/i.test(style)) {
    return false;
  }
  const hidden = (el as HTMLElement).hidden;
  if (hidden) return false;
  const aria = el.getAttribute?.("aria-hidden");
  if (aria === "true") return false;
  return true;
}

function segmentTextsFrom(container: ParentNode): string[] {
  const nodes = container.querySelectorAll(
    ".ytp-caption-segment, [data-asl-demo-caption]",
  );
  const parts: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (!node || !isElementVisible(node)) continue;
    const t = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    parts.push(t);
  }
  return parts;
}

/**
 * Read YouTube's on-screen caption window (when TextTracks are empty).
 * Prefers active caption-window containers; de-dupes identical segments.
 * Does not hide or modify native CC.
 */
export function readDomCaptionText(root: ParentNode = document): string | null {
  const windowSelectors = [
    ".ytp-caption-window-container",
    ".caption-window",
    ".captions-text",
  ];

  for (const winSel of windowSelectors) {
    const windows = root.querySelectorAll(winSel);
    for (let w = 0; w < windows.length; w += 1) {
      const win = windows[w];
      if (!win || !isElementVisible(win)) continue;
      const parts = segmentTextsFrom(win);
      if (parts.length === 0) continue;
      const joined = sanitizeCaptionText(parts.join(" "));
      if (joined.length > 0) return joined;
    }
  }

  // Demo / flat markup without a window wrapper
  const flat = segmentTextsFrom(root);
  if (flat.length > 0) {
    const joined = sanitizeCaptionText(flat.join(" "));
    return joined.length > 0 ? joined : null;
  }
  return null;
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
 * Tracks DOM live-caption identity across ticks so prefix growth does not
 * reset assist-runtime stitch state. Brief empty ticks hold the last cue.
 */
export class DomCaptionTracker {
  private lastText: string | null = null;
  private lastId = "dom-live";
  private lastCue: CaptionCue | null = null;
  private emptyHold = 0;
  private windowSeq = 0;

  reset(): void {
    this.lastText = null;
    this.lastId = "dom-live";
    this.lastCue = null;
    this.emptyHold = 0;
    this.windowSeq = 0;
  }

  /**
   * Build / refresh a sliding live cue. Same visual window → same `id`.
   * New window (non-prefix change) → new `id` so playlist rebuilds once.
   */
  liveCueFromText(text: string, mediaTimeMs: number, holdMs = 3000): CaptionCue {
    const clean = sanitizeCaptionText(text);
    if (!this.lastText || !isSameCaptionWindow(this.lastText, clean)) {
      this.windowSeq += 1;
      this.lastId = `dom-live-${this.windowSeq}`;
    }
    this.lastText = clean;
    this.emptyHold = 0;
    this.lastCue = {
      id: this.lastId,
      startMs: Math.max(0, Math.round(mediaTimeMs) - 80),
      endMs: Math.round(mediaTimeMs) + holdMs,
      text: clean,
    };
    return this.lastCue;
  }

  /** Hold last cue across brief empty DOM, else clear. */
  afterEmptyDom(mediaTimeMs: number, holdMs = 3000): CaptionCue | null {
    if (this.lastCue && this.emptyHold < DOM_CAPTION_EMPTY_HOLD_TICKS) {
      this.emptyHold += 1;
      this.lastCue = {
        ...this.lastCue,
        startMs: Math.max(0, Math.round(mediaTimeMs) - 80),
        endMs: Math.round(mediaTimeMs) + holdMs,
      };
      return this.lastCue;
    }
    this.lastText = null;
    this.lastCue = null;
    this.emptyHold = 0;
    return null;
  }
}

let sharedDomTracker = new DomCaptionTracker();

export function resetDomCaptionTracker(): void {
  sharedDomTracker = new DomCaptionTracker();
}

export function getSharedDomCaptionTracker(): DomCaptionTracker {
  return sharedDomTracker;
}

/**
 * @deprecated Prefer DomCaptionTracker.liveCueFromText — kept for call sites
 * that pass an explicit stable id.
 */
export function domCaptionAsLiveCue(
  text: string,
  mediaTimeMs: number,
  holdMs = 3000,
  id = "dom-live",
): CaptionCue {
  const clean = sanitizeCaptionText(text);
  return {
    id,
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
  options: {
    root?: ParentNode;
    mediaTimeMs?: number;
    tracker?: DomCaptionTracker;
  } = {},
): CollectedCaptions {
  const root = options.root ?? document;
  const mediaTimeMs = options.mediaTimeMs ?? Math.round(video.currentTime * 1000);
  const tracker = options.tracker ?? sharedDomTracker;

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
      cues: [tracker.liveCueFromText(domText, mediaTimeMs)],
      source: "dom_live",
    };
  }

  const held = tracker.afterEmptyDom(mediaTimeMs);
  if (held) {
    return { cues: [held], source: "dom_live" };
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
