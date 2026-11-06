import { routeTiers, youtubeVideoIdFromLocation } from "@asl/catalog";
import { evaluateCriticalGate } from "@asl/critical-gate";
import {
  DEFAULT_LANGUAGE_PAIR_ID,
  conservativeGlossForPair,
  getLanguagePair,
  isPickerPairId,
  type LanguagePairId,
} from "@asl/language-pairs";
import { buildPlaylistFromGloss, type AssistPlaylistStep } from "@asl/lexical";
import {
  NAV_OBSERVER_DEBOUNCE_MS,
  OVERLAY_HIDDEN_TICK_MS,
  OVERLAY_TICK_MS,
} from "@asl/perf-budget";
import { stitchIntoCue, stepAtElapsedStitched } from "@asl/stitch";
import { syncToCaptions } from "@asl/sync";
import { parseRuntimeMessage, type RuntimeMessage } from "@asl/shared-types";
import {
  extractPageDomainTokens,
  getVideoElement,
  readTextTrackCues,
} from "./captions.js";
import { pageCaptionsStillPresent, renderOverlay } from "./overlay.js";

let enabled = false;
let pairId: LanguagePairId = DEFAULT_LANGUAGE_PAIR_ID;
let tickTimer = 0;
let cueStartedAtMediaMs: number | null = null;
let lastCueId: string | null = null;
let cachedSteps: readonly AssistPlaylistStep[] = [];
let cachedGlossLine: string | null = null;
let lastRenderKey = "";
let lastPathname = location.pathname;
let navTimer = 0;

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
  if (enabled && pair.liveAssistEnabled) {
    startClock();
  } else {
    stopClock();
  }

  if (!pageCaptionsStillPresent()) {
    console.warn("[asl-assist] video element missing; captions floor cannot be verified");
  }
}

function onPairChange(nextId: string): void {
  if (!isPickerPairId(nextId)) return;
  pairId = nextId;
  cachedSteps = [];
  cachedGlossLine = null;
  lastCueId = null;
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

  const cues = readTextTrackCues(video);
  const mediaMs = video.currentTime * 1000;
  const sync = syncToCaptions(cues, mediaMs, mediaMs, 500);
  const activeCue = sync.activeCue;
  const route = routeTiers(youtubeVideoIdFromLocation(location.href));

  if (!activeCue) {
    cueStartedAtMediaMs = null;
    lastCueId = null;
    cachedSteps = [];
    cachedGlossLine = null;
    const key = "idle";
    if (lastRenderKey !== key) {
      lastRenderKey = key;
      renderOverlay({
        enabled: true,
        blocked: false,
        gateMessage: null,
        activeCaption: null,
        activeStep: null,
        placeholderMode: false,
        glossLine: null,
        routingLine: route.routingLine,
        tierAEmptyState: route.emptyState,
        languagePairId: pair.id,
        liveAssistEnabled: true,
      });
    }
    scheduleTick(OVERLAY_TICK_MS);
    return;
  }

  if (lastCueId !== activeCue.id) {
    lastCueId = activeCue.id;
    cueStartedAtMediaMs = activeCue.startMs;
    const pairGloss = conservativeGlossForPair(pair.id, activeCue.text);
    if (!pairGloss.live || !pairGloss.gloss) {
      cachedSteps = [];
      cachedGlossLine = null;
    } else {
      const playlist = buildPlaylistFromGloss(pairGloss.gloss);
      const cueDurationMs = Math.max(0, activeCue.endMs - activeCue.startMs);
      const stitched = stitchIntoCue(playlist.steps, cueDurationMs || 2000);
      cachedSteps = stitched.steps;
      cachedGlossLine = pairGloss.gloss.glossLine || null;
    }
  }

  const elapsedInCue = Math.max(0, mediaMs - (cueStartedAtMediaMs ?? activeCue.startMs));
  const step = stepAtElapsedStitched(cachedSteps, elapsedInCue);
  const stepKey =
    step?.kind === "lexical"
      ? `L:${step.gloss}`
      : step?.kind === "fingerspell"
        ? `F:${step.letter}`
        : "none";
  const key = `${activeCue.id}|${stepKey}|${cachedGlossLine ?? ""}`;
  if (key !== lastRenderKey) {
    lastRenderKey = key;
    renderOverlay({
      enabled: true,
      blocked: false,
      gateMessage: null,
      activeCaption: activeCue.text,
      activeStep: step,
      placeholderMode: false,
      glossLine: cachedGlossLine,
      routingLine: route.routingLine,
      tierAEmptyState: route.emptyState,
      languagePairId: pair.id,
      liveAssistEnabled: true,
    });
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
  cueStartedAtMediaMs = null;
  lastCueId = null;
  cachedSteps = [];
  cachedGlossLine = null;
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
    if (!location.pathname.startsWith("/watch")) {
      stopClock();
      renderOverlay(emptyVm());
    }
  }, NAV_OBSERVER_DEBOUNCE_MS);
});
obs.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("visibilitychange", () => {
  if (!enabled) return;
  if (document.hidden) return;
  // Resume promptly when tab visible again.
  if (currentPair().liveAssistEnabled && !tickTimer) startClock();
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
