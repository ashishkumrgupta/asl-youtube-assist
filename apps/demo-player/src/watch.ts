/**
 * Local theater watch page — HTML5 video + always-available VTT.
 * Content script injects assist overlay (same path as YouTube).
 * Pack pending: captions floor only; not signing video.
 */
import { parseSimpleVtt } from "@asl/sync";
import { THEATER_DEMOS, brandCopy, demoById, watchHref } from "./catalog.js";

const video = document.getElementById("asl-demo-video") as HTMLVideoElement | null;
const trackEl = document.getElementById("asl-demo-track") as HTMLTrackElement | null;
const captionEl = document.getElementById("demo-caption");
const titleEl = document.getElementById("watch-title");
const brandEl = document.getElementById("watch-brand");
const honestyEl = document.getElementById("watch-honesty");
const upNext = document.getElementById("up-next-list");

const params = new URLSearchParams(location.search);
const demo = demoById(params.get("v")) ?? THEATER_DEMOS[0]!;
const copy = brandCopy();

if (brandEl) brandEl.textContent = copy.label;
if (honestyEl) honestyEl.textContent = copy.honesty;
if (titleEl) titleEl.textContent = demo.title;
document.title = `${demo.title} · ASL assist theater`;

let cues = parseSimpleVtt("");

async function load(): Promise<void> {
  if (!video || !trackEl) return;
  const res = await fetch(demo.captions);
  const vtt = await res.text();
  cues = parseSimpleVtt(vtt);
  video.src = demo.video;
  trackEl.src = demo.captions;
  // Keep native captions showing — floor for assist; never strip.
  trackEl.default = true;
  video.load();

  video.addEventListener("loadedmetadata", () => {
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const t = tracks[i];
      if (t) t.mode = "showing";
    }
  });
}

function paintDomCaption(): void {
  if (!video || !captionEl) return;
  const mediaMs = video.currentTime * 1000;
  const active = cues.find((c) => mediaMs >= c.startMs && mediaMs < c.endMs);
  captionEl.textContent = active?.text ?? "";
}

function fillUpNext(): void {
  if (!upNext) return;
  upNext.innerHTML = "";
  for (const entry of THEATER_DEMOS) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = watchHref(entry.id);
    a.textContent = entry.title;
    if (entry.id === demo.id) a.setAttribute("aria-current", "page");
    li.append(a);
    upNext.append(li);
  }
}

void load();
fillUpNext();

if (video) {
  video.addEventListener("timeupdate", paintDomCaption);
  video.addEventListener("seeked", paintDomCaption);
}
