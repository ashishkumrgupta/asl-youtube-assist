import { evaluateCriticalGate } from "@asl/critical-gate";
import { isEnabled } from "@asl/flags";
import {
  ASSIST_LABEL,
  assistOverlayDefaults,
  type OverlayState,
  type RuntimeMessage,
} from "@asl/shared-types";
import { BUILD_INFO } from "../shared/build-info.js";

const STORAGE_KEY = "aslAssistOverlayEnabled";

async function readEnabled(): Promise<boolean> {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  return Boolean(result[STORAGE_KEY]);
}

async function writeEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY]: enabled });
}

function buildState(
  enabled: boolean,
  gate: ReturnType<typeof evaluateCriticalGate>,
): OverlayState {
  const overlayOn = enabled && isEnabled("local", "assist.overlay.v1") && !gate.blocked;
  return assistOverlayDefaults({
    enabled: overlayOn,
    criticalGateBlocked: gate.blocked,
    gateReason: gate.reason,
    label: ASSIST_LABEL,
    placeholderMode: false,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // Structured log without caption PII.
  console.warn(
    `[asl-assist] installed version=${BUILD_INFO.version} sha=${BUILD_INFO.gitSha}`,
  );
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: unknown) => void) => {
    void (async () => {
      if (message.type === "GET_STATE") {
        const enabled = await readEnabled();
        // Slice A stub: no page domain tags yet from popup; content script sends gate checks.
        sendResponse({
          type: "STATE",
          state: buildState(enabled, {
            blocked: false,
            matchedDomains: [],
            reason: null,
            userMessage: null,
          }),
        });
        return;
      }

      if (message.type === "TOGGLE_OVERLAY") {
        await writeEnabled(message.enabled);
        const tabs = await chrome.tabs.query({
          url: ["https://www.youtube.com/*", "https://youtube.com/*"],
        });
        for (const tab of tabs) {
          if (tab.id !== undefined) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: "TOGGLE_OVERLAY",
                enabled: message.enabled,
              } satisfies RuntimeMessage);
            } catch {
              // Tab may not have content script yet (not a watch page).
            }
          }
        }
        sendResponse({
          type: "STATE",
          state: buildState(message.enabled, {
            blocked: false,
            matchedDomains: [],
            reason: null,
            userMessage: null,
          }),
        });
        return;
      }

      if (message.type === "CRITICAL_GATE_RESULT") {
        sendResponse({ ok: true });
      }
    })();
    return true;
  },
);

export {};
