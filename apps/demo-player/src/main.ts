/**
 * Offline demo player — caption→gloss sync UI without live YouTube.
 * Pack pending: cues only; not signing video; not an interpreter.
 */
import { routeTiers } from "@asl/catalog";
import {
  ASSIST_BADGE,
  ASSIST_CAPTIONS_FLOOR,
  ASSIST_HONESTY_LINE,
  ASSIST_LABEL,
} from "@asl/shared-types";
import { parseSimpleVtt } from "@asl/sync";
import {
  advanceAssistFrame,
  emptyAssistClock,
  type AssistClockState,
} from "@asl/assist-runtime";

interface DemoEntry {
  readonly id: string;
  readonly video: string;
  readonly captions: string;
  readonly label: string;
}

const DEMOS: readonly DemoEntry[] = [
  {
    id: "01-hello",
    video: "./media/01-hello.mp4",
    captions: "./media/01-hello.vtt",
    label: "01 · Hello",
  },
  {
    id: "02-welcome",
    video: "./media/02-welcome.mp4",
    captions: "./media/02-welcome.vtt",
    label: "02 · Welcome",
  },
  {
    id: "03-oov",
    video: "./media/03-oov.mp4",
    captions: "./media/03-oov.vtt",
    label: "03 · OOV fingerspell",
  },
  {
    id: "04-wh-time",
    video: "./media/04-wh-time.mp4",
    captions: "./media/04-wh-time.vtt",
    label: "04 · WH / TIME",
  },
  {
    id: "05-gaps",
    video: "./media/05-gaps.mp4",
    captions: "./media/05-gaps.vtt",
    label: "05 · Cue gaps",
  },
];

const video = document.getElementById("asl-demo-video") as HTMLVideoElement;
const trackEl = document.getElementById("asl-demo-track") as HTMLTrackElement;
const select = document.getElementById("demo-select") as HTMLSelectElement;
const toggle = document.getElementById("assist-toggle") as HTMLInputElement;
const badge = document.getElementById("assist-badge");
const honesty = document.getElementById("assist-honesty");
const glossEl = document.getElementById("assist-gloss");
const cueEl = document.getElementById("assist-cue");
const chipEl = document.getElementById("assist-chip");
const floorEl = document.getElementById("assist-floor");
const demoCaption = document.getElementById("demo-caption");

let clock: AssistClockState = emptyAssistClock();
let cues = parseSimpleVtt("");
let enabled = false;
let lastKey = "";

async function loadDemo(entry: DemoEntry): Promise<void> {
  clock = emptyAssistClock();
  lastKey = "";
  const res = await fetch(entry.captions);
  const vtt = await res.text();
  cues = parseSimpleVtt(vtt);
  video.src = entry.video;
  trackEl.src = entry.captions;
  video.load();
  if (demoCaption) demoCaption.textContent = "";
  paintIdle();
}

function paintIdle(): void {
  if (badge) badge.textContent = ASSIST_BADGE;
  if (honesty) honesty.textContent = ASSIST_HONESTY_LINE;
  if (floorEl) floorEl.textContent = ASSIST_CAPTIONS_FLOOR;
  if (chipEl) {
    const route = routeTiers(null);
    chipEl.textContent = `${route.routingLine} · ${route.emptyState ?? ""}`.trim();
  }
  if (!enabled) {
    if (glossEl) glossEl.textContent = "Assist off";
    if (cueEl) cueEl.textContent = "";
    return;
  }
  if (glossEl) glossEl.textContent = "Waiting for captions…";
  if (cueEl) cueEl.textContent = "";
}

function tick(): void {
  if (!enabled) {
    requestAnimationFrame(tick);
    return;
  }
  const mediaMs = video.currentTime * 1000;
  // Prefer parsed VTT (reliable offline); textTracks may lag until loaded.
  const frame = advanceAssistFrame({
    enabled: true,
    languagePairId: "en-ase",
    cues,
    mediaMs,
    routingLine: "Assist · Tier B",
    tierAEmptyState: "Tier A empty · not human interpretation",
    clock,
  });
  clock = frame.clock;
  if (frame.renderKey !== lastKey) {
    lastKey = frame.renderKey;
    const vm = frame.viewModel;
    if (glossEl) {
      if (vm.glossLine) glossEl.textContent = vm.glossLine;
      else if (vm.activeStep?.kind === "lexical")
        glossEl.textContent = vm.activeStep.gloss;
      else if (vm.activeStep?.kind === "fingerspell")
        glossEl.textContent = `FS · ${vm.activeStep.letter}`;
      else glossEl.textContent = "Waiting for captions…";
    }
    if (cueEl) cueEl.textContent = vm.activeCaption ?? "";
    if (demoCaption) demoCaption.textContent = vm.activeCaption ?? "";
  }
  requestAnimationFrame(tick);
}

function fillSelect(): void {
  select.innerHTML = "";
  for (const demo of DEMOS) {
    const opt = document.createElement("option");
    opt.value = demo.id;
    opt.textContent = demo.label;
    select.appendChild(opt);
  }
}

fillSelect();
const title = document.getElementById("page-title");
if (title) title.textContent = ASSIST_LABEL;
paintIdle();

void loadDemo(DEMOS[0]!);
select.addEventListener("change", () => {
  const entry = DEMOS.find((d) => d.id === select.value) ?? DEMOS[0]!;
  void loadDemo(entry);
});
toggle.addEventListener("change", () => {
  enabled = toggle.checked;
  clock = emptyAssistClock();
  lastKey = "";
  paintIdle();
});

requestAnimationFrame(tick);
