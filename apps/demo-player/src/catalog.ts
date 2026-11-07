/**
 * Local theater catalog — mirrors fixtures/demo-videos/manifest.json.
 * Synthetic lavfi clips + authored VTT. Not signing video; pack pending.
 */
import { ASSIST_HONESTY_LINE, ASSIST_LABEL } from "@asl/shared-types";

export interface TheaterDemo {
  readonly id: string;
  readonly title: string;
  readonly blurb: string;
  readonly video: string;
  readonly captions: string;
  readonly durationSec: number;
}

/** Static catalog (kept in sync with fixtures/demo-videos/manifest.json). */
export const THEATER_DEMOS: readonly TheaterDemo[] = [
  {
    id: "01-hello",
    title: "Hello",
    blurb: "Lexical hits and cue advance",
    video: "./media/01-hello.mp4",
    captions: "./media/01-hello.vtt",
    durationSec: 8,
  },
  {
    id: "02-welcome",
    title: "Welcome",
    blurb: "Multi-cue advance",
    video: "./media/02-welcome.mp4",
    captions: "./media/02-welcome.vtt",
    durationSec: 7,
  },
  {
    id: "03-oov",
    title: "OOV fingerspell",
    blurb: "Out-of-vocabulary → fingerspell path",
    video: "./media/03-oov.mp4",
    captions: "./media/03-oov.vtt",
    durationSec: 6,
  },
  {
    id: "04-wh-time",
    title: "WH / TIME",
    blurb: "Conservative gloss tokens",
    video: "./media/04-wh-time.mp4",
    captions: "./media/04-wh-time.vtt",
    durationSec: 8,
  },
  {
    id: "05-gaps",
    title: "Cue gaps",
    blurb: "Idle between caption windows",
    video: "./media/05-gaps.mp4",
    captions: "./media/05-gaps.vtt",
    durationSec: 10,
  },
];

export const THEATER_ORIGIN = "http://127.0.0.1:4173";

export function demoById(id: string | null | undefined): TheaterDemo | undefined {
  if (!id) return undefined;
  return THEATER_DEMOS.find((d) => d.id === id);
}

/** Clean URL (`/watch?v=`) — avoids serve’s `.html` → `/watch` redirect dropping query. */
export function watchHref(id: string): string {
  return `./watch?v=${encodeURIComponent(id)}`;
}

export function brandCopy(): { label: string; honesty: string } {
  return { label: ASSIST_LABEL, honesty: ASSIST_HONESTY_LINE };
}
