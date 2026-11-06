import {
  ASSIST_DISCLAIMER,
  ASSIST_LABEL,
  type OverlayState,
  type RuntimeMessage,
} from "@asl/shared-types";
import { BUILD_INFO } from "../shared/build-info.js";

const toggle = document.getElementById("toggle") as HTMLInputElement | null;
const status = document.getElementById("status");
const versionEl = document.getElementById("version");

if (versionEl) {
  versionEl.textContent = `v${BUILD_INFO.version} (${BUILD_INFO.gitSha})`;
}

const labelEl = document.getElementById("claim-label");
if (labelEl) labelEl.textContent = ASSIST_LABEL;

const disclaimerEl = document.getElementById("disclaimer");
if (disclaimerEl) disclaimerEl.textContent = ASSIST_DISCLAIMER;

function applyState(state: OverlayState): void {
  if (toggle) toggle.checked = state.enabled;
  if (status) {
    if (state.criticalGateBlocked) {
      status.textContent =
        "Keyword stub gate (not content understanding) blocked unsupervised assist. Captions remain available.";
    } else if (state.enabled) {
      status.textContent =
        "ASL assist overlay on — gloss/fingerspell cues (clip pack pending). Not an interpreter. Drag Move to keep captions clear.";
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
