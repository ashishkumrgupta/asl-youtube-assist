import { evaluateCriticalGate } from "@asl/critical-gate";
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
      placeholderMode: true,
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
    placeholderMode: true,
  });

  if (enabled) {
    startClock();
  } else {
    stopClock();
  }

  // Captions floor: we never strip CC; assert presence for diagnostics only.
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
    renderOverlay({
      enabled: true,
      blocked: false,
      gateMessage: null,
      activeCaption: sync.activeCue?.text ?? null,
      placeholderMode: true,
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function stopClock(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "TOGGLE_OVERLAY") {
    onToggle(message.enabled);
  }
});

// Re-apply on SPA navigation (YouTube).
const obs = new MutationObserver(() => {
  if (!location.pathname.startsWith("/watch")) {
    stopClock();
    renderOverlay({
      enabled: false,
      blocked: false,
      gateMessage: null,
      activeCaption: null,
      placeholderMode: true,
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
