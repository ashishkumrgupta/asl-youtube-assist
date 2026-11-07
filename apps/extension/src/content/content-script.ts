import { routeTiers, youtubeVideoIdFromLocation } from "@asl/catalog";
import { evaluateCriticalGate } from "@asl/critical-gate";
import {
  DEFAULT_LANGUAGE_PAIR_ID,
  getLanguagePair,
  isPickerPairId,
  type LanguagePairId,
} from "@asl/language-pairs";
import {
  NAV_OBSERVER_DEBOUNCE_MS,
  OVERLAY_HIDDEN_TICK_MS,
  OVERLAY_TICK_MS,
} from "@asl/perf-budget";
import { parseRuntimeMessage, type RuntimeMessage } from "@asl/shared-types";
import {
  advanceAssistFrame,
  emptyAssistClock,
  type AssistClockState,
} from "@asl/assist-runtime";
import {
  collectCaptionCues,
  extractPageDomainTokens,
  getVideoElement,
  resetDomCaptionTracker,
} from "./captions.js";
import {
  pageCaptionsStillPresent,
  renderOverlay,
  setOverlayHideHandler,
} from "./overlay.js";

let enabled = false;
let pairId: LanguagePairId = DEFAULT_LANGUAGE_PAIR_ID;
let tickTimer = 0;
let clock: AssistClockState = emptyAssistClock();
let lastRenderKey = "";
let lastPathname = location.pathname;
let navTimer = 0;

/** Hide button: stop local clock immediately (do not wait for SW broadcast). */
function onLocalHide(): void {
  enabled = false;
  stopClock();
  resetDomCaptionTracker();
}

setOverlayHideHandler(onLocalHide);

function currentPair() {
  return getLanguagePair(pairId);
}

function emptyVm(
  partial: Partial<{
    enabled: boolean;
    blocked: boolean;
    gateMessage: string | null;
  }> = {},
) {
  const route = routeTiers(youtubeVideoIdFromLocation(location.href));
  const pair = currentPair();
  return {
    enabled: false,
    blocked: false,
    gateMessage: null as string | null,
    activeCaption: null as string | null,
    activeStep: null,
    placeholderMode: !pair.liveAssistEnabled,
    glossLine: null as string | null,
    routingLine: route.routingLine,
    tierAEmptyState: route.emptyState,
    languagePairId: pair.id,
    liveAssistEnabled: pair.liveAssistEnabled,
    ...partial,
  };
}

function renderPendingOrLiveBase(active: boolean): void {
  const route = routeTiers(youtubeVideoIdFromLocation(location.href));
  const pair = currentPair();
  lastRenderKey = "";
  clock = emptyAssistClock();
  renderOverlay({
    enabled: active,
    blocked: false,
    gateMessage: null,
    activeCaption: null,
    activeStep: null,
    placeholderMode: !pair.liveAssistEnabled,
    glossLine: null,
    routingLine: active && pair.liveAssistEnabled ? route.routingLine : null,
    tierAEmptyState: active && pair.liveAssistEnabled ? route.emptyState : null,
    languagePairId: pair.id,
    liveAssistEnabled: pair.liveAssistEnabled,
  });
}

/** YouTube `/watch` and local theater `/watch` (same assist path; `.html` ok too). */
function isWatchPath(pathname: string = location.pathname): boolean {
  return pathname === "/watch" || pathname.startsWith("/watch.");
}

function onToggle(next: boolean): void {
  const gate = evaluateCriticalGate({
    domains: extractPageDomainTokens(),
    humanPathAvailable: false,
  });

  if (gate.blocked) {
    enabled = false;
    renderOverlay({
      ...emptyVm({ blocked: true, gateMessage: gate.userMessage }),
      routingLine: null,
      tierAEmptyState: null,
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
  renderPendingOrLiveBase(enabled);

  const pair = currentPair();
  // Library / non-watch pages: show chrome state only; do not bind random videos.
  if (enabled && pair.liveAssistEnabled && isWatchPath()) {
    startClock();
  } else {
    stopClock();
  }

  if (isWatchPath() && !pageCaptionsStillPresent()) {
    console.warn("[asl-assist] video element missing; captions floor cannot be verified");
  }
}

function onPairChange(nextId: string): void {
  if (!isPickerPairId(nextId)) return;
  pairId = nextId;
  clock = emptyAssistClock();
  onToggle(enabled);
}

function scheduleTick(ms: number): void {
  tickTimer = window.setTimeout(runTick, ms);
}

function runTick(): void {
  const pair = currentPair();
  if (!enabled || !pair.liveAssistEnabled) {
    stopClock();
    return;
  }

  if (document.hidden) {
    scheduleTick(OVERLAY_HIDDEN_TICK_MS);
    return;
  }

  const video = getVideoElement();
  if (!video) {
    scheduleTick(OVERLAY_TICK_MS);
    return;
  }

  const mediaMs = video.currentTime * 1000;
  const collected = collectCaptionCues(video, { mediaTimeMs: mediaMs });
  const route = routeTiers(youtubeVideoIdFromLocation(location.href));
  const frame = advanceAssistFrame({
    enabled: true,
    languagePairId: pair.id,
    cues: collected.cues,
    mediaMs,
    routingLine: route.routingLine,
    tierAEmptyState: route.emptyState,
    clock,
  });
  clock = frame.clock;

  if (frame.renderKey !== lastRenderKey) {
    lastRenderKey = frame.renderKey;
    renderOverlay(frame.viewModel);
  }
  scheduleTick(OVERLAY_TICK_MS);
}

function startClock(): void {
  stopClock();
  scheduleTick(0);
}

function stopClock(): void {
  if (tickTimer) window.clearTimeout(tickTimer);
  tickTimer = 0;
  clock = emptyAssistClock();
  lastRenderKey = "";
}

chrome.runtime.onMessage.addListener((raw) => {
  const message = parseRuntimeMessage(raw);
  if (!message) return;
  if (message.type === "TOGGLE_OVERLAY") {
    onToggle(message.enabled);
  }
  if (message.type === "SET_LANGUAGE_PAIR") {
    onPairChange(message.languagePairId);
  }
});

// SC-4 / main-thread: debounce SPA path checks; do not scan every DOM mutation.
const obs = new MutationObserver(() => {
  if (navTimer) window.clearTimeout(navTimer);
  navTimer = window.setTimeout(() => {
    if (location.pathname === lastPathname) return;
    lastPathname = location.pathname;
    if (!isWatchPath()) {
      stopClock();
      renderOverlay(emptyVm());
    } else if (enabled && currentPair().liveAssistEnabled && !tickTimer) {
      startClock();
    }
  }, NAV_OBSERVER_DEBOUNCE_MS);
});
obs.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("visibilitychange", () => {
  if (!enabled) return;
  if (document.hidden) return;
  if (currentPair().liveAssistEnabled && isWatchPath() && !tickTimer) startClock();
});

void chrome.runtime.sendMessage({ type: "GET_STATE" }).then((res: unknown) => {
  const msg = parseRuntimeMessage(res);
  if (msg && msg.type === "STATE") {
    if (isPickerPairId(msg.state.languagePairId)) {
      pairId = msg.state.languagePairId;
    }
    if (msg.state.enabled) onToggle(true);
    else renderPendingOrLiveBase(false);
  }
});
