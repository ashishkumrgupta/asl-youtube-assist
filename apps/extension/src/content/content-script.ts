import { evaluateCriticalGate } from "@asl/critical-gate";
import { buildAssistPlaylist, stepAtElapsed } from "@asl/lexical";
import { syncToCaptions } from "@asl/sync";
import type { RuntimeMessage } from "@asl/shared-types";
import {
  extractPageDomainTokens,
  getVideoElement,
  readTextTrackCues,
} from "./captions.js";
import { pageCaptionsStillPresent, renderOverlay } from "./overlay.js";

let enabled = false;
let raf = 0;
let cueStartedAtMediaMs: number | null = null;
let lastCueId: string | null = null;

function onToggle(next: boolean): void {
  const gate = evaluateCriticalGate({
    domains: extractPageDomainTokens(),
    humanPathAvailable: false,
  });

  if (gate.blocked) {
    enabled = false;
    renderOverlay({
      enabled: false,
      blocked: true,
      gateMessage: gate.userMessage,
      activeCaption: null,
      activeStep: null,
      placeholderMode: false,
    });
    void chrome.runtime.sendMessage({
      type: "CRITICAL_GATE_RESULT",
      blocked: true,
      reason: gate.reason,
    } satisfies RuntimeMessage);
    stopClock();
    return;
  }

  enabled = next;
  renderOverlay({
    enabled,
    blocked: false,
    gateMessage: null,
    activeCaption: null,
    activeStep: null,
    placeholderMode: false,
  });

  if (enabled) {
    startClock();
  } else {
    stopClock();
  }

  if (!pageCaptionsStillPresent()) {
    console.warn("[asl-assist] video element missing; captions floor cannot be verified");
  }
}

function startClock(): void {
  stopClock();
  const tick = (): void => {
    const video = getVideoElement();
    if (!video || !enabled) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const cues = readTextTrackCues(video);
    const mediaMs = video.currentTime * 1000;
    const sync = syncToCaptions(cues, mediaMs, mediaMs, 500);
    const activeCue = sync.activeCue;

    if (!activeCue) {
      cueStartedAtMediaMs = null;
      lastCueId = null;
      renderOverlay({
        enabled: true,
        blocked: false,
        gateMessage: null,
        activeCaption: null,
        activeStep: null,
        placeholderMode: false,
      });
      raf = requestAnimationFrame(tick);
      return;
    }

    if (lastCueId !== activeCue.id) {
      lastCueId = activeCue.id;
      cueStartedAtMediaMs = activeCue.startMs;
    }

    const elapsedInCue = Math.max(
      0,
      mediaMs - (cueStartedAtMediaMs ?? activeCue.startMs),
    );
    const playlist = buildAssistPlaylist(activeCue.text);
    const step = stepAtElapsed(playlist.steps, elapsedInCue);

    renderOverlay({
      enabled: true,
      blocked: false,
      gateMessage: null,
      activeCaption: activeCue.text,
      activeStep: step,
      placeholderMode: false,
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function stopClock(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  cueStartedAtMediaMs = null;
  lastCueId = null;
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "TOGGLE_OVERLAY") {
    onToggle(message.enabled);
  }
});

const obs = new MutationObserver(() => {
  if (!location.pathname.startsWith("/watch")) {
    stopClock();
    renderOverlay({
      enabled: false,
      blocked: false,
      gateMessage: null,
      activeCaption: null,
      activeStep: null,
      placeholderMode: false,
    });
  }
});
obs.observe(document.documentElement, { childList: true, subtree: true });

void chrome.runtime.sendMessage({ type: "GET_STATE" }).then((res: unknown) => {
  const msg = res as RuntimeMessage | undefined;
  if (msg && msg.type === "STATE" && msg.state.enabled) {
    onToggle(true);
  }
});
