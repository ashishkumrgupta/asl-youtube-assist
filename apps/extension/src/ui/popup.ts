import {
  DEFAULT_LANGUAGE_PAIR_ID,
  disabledLanguagePairs,
  getLanguagePair,
  isPickerPairId,
  pickerLanguagePairs,
} from "@asl/language-pairs";
import {
  ASSIST_CAPTIONS_FLOOR,
  ASSIST_STATUS_ON,
  parseRuntimeMessage,
  type OverlayState,
  type RuntimeMessage,
} from "@asl/shared-types";
import { BUILD_INFO } from "../shared/build-info.js";

const toggle = document.getElementById("toggle") as HTMLInputElement | null;
const status = document.getElementById("status");
const versionEl = document.getElementById("version");
const pairSelect = document.getElementById("language-pair") as HTMLSelectElement | null;
const pairHint = document.getElementById("pair-hint");
const toggleLabel = document.getElementById("toggle-label");
const honestyEl = document.getElementById("honesty");
const aboutBody = document.getElementById("about-body");
const captionsFloor = document.getElementById("captions-floor");

if (versionEl) {
  versionEl.textContent = `v${BUILD_INFO.version} · ${BUILD_INFO.gitSha}`;
}
if (captionsFloor) {
  captionsFloor.textContent = ASSIST_CAPTIONS_FLOOR;
}

function fillPairSelect(selectedId: string): void {
  if (!pairSelect) return;
  pairSelect.innerHTML = "";
  for (const pair of pickerLanguagePairs()) {
    const opt = document.createElement("option");
    opt.value = pair.id;
    const suffix =
      pair.uiStatus === "pending"
        ? " — pending"
        : pair.uiStatus === "live"
          ? ""
          : " — unavailable";
    opt.textContent = `${pair.shortName}${suffix}`;
    pairSelect.appendChild(opt);
  }
  for (const pair of disabledLanguagePairs()) {
    const opt = document.createElement("option");
    opt.value = pair.id;
    opt.textContent = `${pair.shortName} — not shipped`;
    opt.disabled = true;
    pairSelect.appendChild(opt);
  }
  pairSelect.value = isPickerPairId(selectedId) ? selectedId : DEFAULT_LANGUAGE_PAIR_ID;
}

function applyPairChrome(pairId: string): void {
  const pair = getLanguagePair(pairId);
  const labelEl = document.getElementById("claim-label");
  if (labelEl) labelEl.textContent = pair.assistCopy.label;
  if (honestyEl) honestyEl.textContent = pair.assistCopy.honestyLine;
  if (aboutBody) {
    aboutBody.textContent = `${pair.assistCopy.details} ${pair.assistCopy.glossNote}`;
  }
  if (pairHint) {
    if (pair.liveAssistEnabled) {
      pairHint.hidden = true;
      pairHint.textContent = "";
    } else {
      pairHint.hidden = false;
      pairHint.textContent = pair.pickerHint ?? "Coming later · not live";
    }
  }
  if (toggleLabel) {
    toggleLabel.textContent = pair.liveAssistEnabled
      ? `Show ${pair.shortName} assist`
      : `Show ${pair.shortName} pending chrome`;
  }
}

function applyState(state: OverlayState): void {
  fillPairSelect(state.languagePairId);
  applyPairChrome(state.languagePairId);
  if (toggle) toggle.checked = state.enabled;
  const pair = getLanguagePair(state.languagePairId);
  if (status) {
    if (state.criticalGateBlocked) {
      status.textContent = "Assist paused · critical topic · use captions";
    } else if (state.enabled && !pair.liveAssistEnabled) {
      status.textContent = `${pair.shortName} pending chrome on · not live`;
    } else if (state.enabled) {
      status.textContent = ASSIST_STATUS_ON;
    } else {
      status.textContent = "Overlay off";
    }
  }
}

void chrome.runtime
  .sendMessage({ type: "GET_STATE" } satisfies RuntimeMessage)
  .then((res: unknown) => {
    const msg = parseRuntimeMessage(res);
    if (msg?.type === "STATE") applyState(msg.state);
    else {
      fillPairSelect(DEFAULT_LANGUAGE_PAIR_ID);
      applyPairChrome(DEFAULT_LANGUAGE_PAIR_ID);
    }
  });

toggle?.addEventListener("change", () => {
  const enabled = Boolean(toggle.checked);
  void chrome.runtime
    .sendMessage({ type: "TOGGLE_OVERLAY", enabled } satisfies RuntimeMessage)
    .then((res: unknown) => {
      const msg = parseRuntimeMessage(res);
      if (msg?.type === "STATE") applyState(msg.state);
    });
});

pairSelect?.addEventListener("change", () => {
  const languagePairId = pairSelect.value;
  if (!isPickerPairId(languagePairId)) {
    pairSelect.value = DEFAULT_LANGUAGE_PAIR_ID;
    return;
  }
  void chrome.runtime
    .sendMessage({
      type: "SET_LANGUAGE_PAIR",
      languagePairId,
    } satisfies RuntimeMessage)
    .then((res: unknown) => {
      const msg = parseRuntimeMessage(res);
      if (msg?.type === "STATE") applyState(msg.state);
    });
});
