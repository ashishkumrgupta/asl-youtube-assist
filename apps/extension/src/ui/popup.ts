import {
  DEFAULT_LANGUAGE_PAIR_ID,
  disabledLanguagePairs,
  getLanguagePair,
  isPickerPairId,
  pickerLanguagePairs,
} from "@asl/language-pairs";
import type { OverlayState, RuntimeMessage } from "@asl/shared-types";
import { BUILD_INFO } from "../shared/build-info.js";

const toggle = document.getElementById("toggle") as HTMLInputElement | null;
const status = document.getElementById("status");
const versionEl = document.getElementById("version");
const pairSelect = document.getElementById("language-pair") as HTMLSelectElement | null;
const pairHint = document.getElementById("pair-hint");
const toggleLabel = document.getElementById("toggle-label");

if (versionEl) {
  versionEl.textContent = `v${BUILD_INFO.version} (${BUILD_INFO.gitSha})`;
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
    opt.textContent = `${pair.displayName} (${pair.signLanguageIso})${suffix}`;
    pairSelect.appendChild(opt);
  }
  // Disabled pairs listed for honesty (not selectable).
  for (const pair of disabledLanguagePairs()) {
    const opt = document.createElement("option");
    opt.value = pair.id;
    opt.textContent = `${pair.displayName} — not evaluated / not shipped`;
    opt.disabled = true;
    pairSelect.appendChild(opt);
  }
  pairSelect.value = isPickerPairId(selectedId) ? selectedId : DEFAULT_LANGUAGE_PAIR_ID;
}

function applyPairChrome(pairId: string): void {
  const pair = getLanguagePair(pairId);
  const labelEl = document.getElementById("claim-label");
  const disclaimerEl = document.getElementById("disclaimer");
  if (labelEl) labelEl.textContent = pair.assistCopy.label;
  if (disclaimerEl) disclaimerEl.textContent = pair.assistCopy.disclaimer;
  if (pairHint) {
    pairHint.textContent = pair.liveAssistEnabled
      ? `Active path: ${pair.shortName} assist / partial (pack may still be pending). Irish Sign Language is out of scope.`
      : (pair.pickerHint ??
        "Coming later / pending Deaf-led eval — not a live overlay for this language.");
  }
  if (toggleLabel) {
    toggleLabel.textContent = pair.liveAssistEnabled
      ? `Show ${pair.shortName} assist overlay`
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
      status.textContent =
        "Keyword stub gate (not content understanding) blocked unsupervised assist. Captions remain available.";
    } else if (state.enabled && !pair.liveAssistEnabled) {
      status.textContent = `${pair.displayName} pending chrome on — not a live ISL/product path. ASL assets are not used. Captions stay on.`;
    } else if (state.enabled) {
      status.textContent = `${pair.shortName} assist overlay on — conservative gloss + fingerspell (clip pack pending). Tier A empty. Not an interpreter. Drag Move to keep captions clear.`;
    } else {
      status.textContent = "Overlay off. Captions stay available on YouTube.";
    }
  }
}

void chrome.runtime
  .sendMessage({ type: "GET_STATE" } satisfies RuntimeMessage)
  .then((res: unknown) => {
    const msg = res as RuntimeMessage;
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
      const msg = res as RuntimeMessage;
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
      const msg = res as RuntimeMessage;
      if (msg?.type === "STATE") applyState(msg.state);
    });
});
