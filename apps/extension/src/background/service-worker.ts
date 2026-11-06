import {
  DEFAULT_LANGUAGE_PAIR_ID,
  getLanguagePair,
  isPickerPairId,
} from "@asl/language-pairs";
import { evaluateCriticalGate } from "@asl/critical-gate";
import { isEnabled } from "@asl/flags";
import {
  assistOverlayDefaults,
  type OverlayState,
  type RuntimeMessage,
} from "@asl/shared-types";
import { BUILD_INFO } from "../shared/build-info.js";

const ENABLED_KEY = "aslAssistOverlayEnabled";
const PAIR_KEY = "aslAssistLanguagePairId";

async function readEnabled(): Promise<boolean> {
  const result = await chrome.storage.session.get(ENABLED_KEY);
  return Boolean(result[ENABLED_KEY]);
}

async function writeEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.session.set({ [ENABLED_KEY]: enabled });
}

async function readPairId(): Promise<string> {
  const result = await chrome.storage.session.get(PAIR_KEY);
  const raw = result[PAIR_KEY];
  if (typeof raw === "string" && isPickerPairId(raw)) return raw;
  return DEFAULT_LANGUAGE_PAIR_ID;
}

async function writePairId(pairId: string): Promise<void> {
  const id = isPickerPairId(pairId) ? pairId : DEFAULT_LANGUAGE_PAIR_ID;
  await chrome.storage.session.set({ [PAIR_KEY]: id });
}

function buildState(
  enabled: boolean,
  pairId: string,
  gate: ReturnType<typeof evaluateCriticalGate>,
): OverlayState {
  const pair = getLanguagePair(pairId);
  const overlayOn = enabled && isEnabled("local", "assist.overlay.v1") && !gate.blocked;
  return assistOverlayDefaults({
    enabled: overlayOn,
    criticalGateBlocked: gate.blocked,
    gateReason: gate.reason,
    label: pair.assistCopy.label,
    languagePairId: pair.id,
    liveAssistEnabled: pair.liveAssistEnabled,
    placeholderMode: !pair.liveAssistEnabled,
  });
}

async function broadcast(message: RuntimeMessage): Promise<void> {
  const tabs = await chrome.tabs.query({
    url: ["https://www.youtube.com/*", "https://youtube.com/*"],
  });
  for (const tab of tabs) {
    if (tab.id === undefined) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      // Tab may not have content script yet.
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.warn(
    `[asl-assist] installed version=${BUILD_INFO.version} sha=${BUILD_INFO.gitSha}`,
  );
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: unknown) => void) => {
    void (async () => {
      if (message.type === "GET_STATE") {
        const enabled = await readEnabled();
        const pairId = await readPairId();
        sendResponse({
          type: "STATE",
          state: buildState(enabled, pairId, {
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
        const pairId = await readPairId();
        await broadcast({
          type: "TOGGLE_OVERLAY",
          enabled: message.enabled,
        });
        await broadcast({
          type: "SET_LANGUAGE_PAIR",
          languagePairId: pairId,
        });
        sendResponse({
          type: "STATE",
          state: buildState(message.enabled, pairId, {
            blocked: false,
            matchedDomains: [],
            reason: null,
            userMessage: null,
          }),
        });
        return;
      }

      if (message.type === "SET_LANGUAGE_PAIR") {
        await writePairId(message.languagePairId);
        const enabled = await readEnabled();
        const pairId = await readPairId();
        await broadcast({
          type: "SET_LANGUAGE_PAIR",
          languagePairId: pairId,
        });
        sendResponse({
          type: "STATE",
          state: buildState(enabled, pairId, {
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
