import {
  DEFAULT_LANGUAGE_PAIR_ID,
  getLanguagePair,
  type LanguagePairId,
} from "@asl/language-pairs";
import type { AssistPlaylistStep } from "@asl/lexical";

const ROOT_ID = "asl-assist-overlay-root";

export interface OverlayViewModel {
  readonly enabled: boolean;
  readonly blocked: boolean;
  readonly gateMessage: string | null;
  readonly activeCaption: string | null;
  readonly activeStep: AssistPlaylistStep | null;
  readonly placeholderMode: boolean;
  readonly glossLine: string | null;
  readonly routingLine: string | null;
  readonly tierAEmptyState: string | null;
  readonly languagePairId: LanguagePairId | string;
  readonly liveAssistEnabled: boolean;
}

let dragBound = false;

function assetUrl(relativePath: string): string {
  return chrome.runtime.getURL(relativePath);
}

export function ensureOverlayHost(): HTMLElement {
  let root = document.getElementById(ROOT_ID);
  if (root) return root;

  const pair = getLanguagePair(DEFAULT_LANGUAGE_PAIR_ID);
  root = document.createElement("div");
  root.id = ROOT_ID;
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", pair.assistCopy.label);
  Object.assign(root.style, {
    position: "fixed",
    right: "16px",
    bottom: "96px",
    left: "auto",
    top: "auto",
    zIndex: "2147483646",
    width: "300px",
    maxWidth: "42vw",
    fontFamily: "system-ui, sans-serif",
    pointerEvents: "auto",
  } as CSSStyleDeclaration);

  const shadow = root.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .panel {
        background: rgba(12, 14, 18, 0.92);
        color: #f4f6f8;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 10px;
        padding: 12px 14px;
        box-shadow: 0 8px 28px rgba(0,0,0,0.35);
        display: none;
        flex-direction: column;
        gap: 8px;
      }
      .panel[data-visible="true"] { display: flex; }
      .chrome {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .drag-handle {
        flex: 1;
        cursor: grab;
        user-select: none;
        font-size: 11px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #9ad0ff;
        padding: 4px 0;
        touch-action: none;
      }
      .drag-handle:active { cursor: grabbing; }
      .drag-handle:focus-visible {
        outline: 2px solid #9ad0ff;
        outline-offset: 2px;
      }
      .badge {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #9ad0ff;
      }
      .claim { font-size: 14px; font-weight: 600; }
      .disclaimer { font-size: 12px; line-height: 1.35; opacity: 0.9; }
      .pair-line {
        font-size: 11px;
        line-height: 1.35;
        color: #b8c9dc;
        border: 1px solid rgba(154, 208, 255, 0.25);
        border-radius: 6px;
        padding: 6px 8px;
      }
      .tier-route {
        font-size: 11px;
        line-height: 1.35;
        color: #b8c9dc;
        border: 1px solid rgba(154, 208, 255, 0.25);
        border-radius: 6px;
        padding: 6px 8px;
      }
      .tier-empty {
        font-size: 11px;
        line-height: 1.35;
        color: #d7c9a8;
        opacity: 0.95;
      }
      .gloss-note {
        font-size: 11px;
        line-height: 1.35;
        color: #a8b8c8;
      }
      .stage {
        min-height: 140px;
        border-radius: 8px;
        background: linear-gradient(160deg, #1a2332, #0d121a);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #c9d4e3;
        gap: 8px;
      }
      .stage video {
        width: 100%;
        max-height: 160px;
        border-radius: 6px;
        background: #0a0e14;
      }
      .cue-glyph {
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #e8f1ff;
        line-height: 1.1;
      }
      .gloss {
        font-size: 13px;
        font-weight: 600;
        color: #e8f1ff;
      }
      .cue {
        font-size: 12px;
        opacity: 0.85;
        border-top: 1px solid rgba(255,255,255,0.12);
        padding-top: 8px;
      }
      .gate {
        background: #3a1d1d;
        border: 1px solid #c45c5c;
        color: #ffd7d7;
        border-radius: 8px;
        padding: 10px;
        font-size: 12px;
        line-height: 1.4;
      }
      button.close {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.25);
        color: #fff;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
      }
      button.close:focus-visible {
        outline: 2px solid #9ad0ff;
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .panel { transition: none; }
      }
    </style>
    <div class="panel" data-visible="false" part="panel">
      <div class="chrome">
        <div
          class="drag-handle"
          data-role="drag"
          role="button"
          tabindex="0"
          aria-label="Move assist overlay — drag so it does not cover captions"
          title="Drag to move — keep captions visible"
        >Move</div>
        <button type="button" class="close" aria-label="Hide assist overlay">Hide</button>
      </div>
      <div class="badge" data-role="badge"></div>
      <div class="claim" data-role="claim"></div>
      <div class="disclaimer" data-role="disclaimer"></div>
      <div class="pair-line" data-role="pair-line"></div>
      <div class="tier-route" data-role="routing" hidden></div>
      <div class="tier-empty" data-role="tier-a-empty" hidden></div>
      <div class="gloss-note" data-role="gloss-note"></div>
      <div class="stage" data-role="stage">
        <video data-role="clip" muted playsinline loop hidden></video>
        <div class="cue-glyph" data-role="glyph" aria-live="polite"></div>
        <div class="gloss" data-role="gloss"></div>
        <div data-role="hint"></div>
      </div>
      <div class="cue" data-role="cue" hidden></div>
      <div class="gate" data-role="gate" hidden></div>
    </div>
  `;

  document.documentElement.appendChild(root);
  const closeBtn = shadow.querySelector("button.close");
  closeBtn?.addEventListener("click", () => {
    renderOverlay({
      enabled: false,
      blocked: false,
      gateMessage: null,
      activeCaption: null,
      activeStep: null,
      placeholderMode: false,
      glossLine: null,
      routingLine: null,
      tierAEmptyState: null,
      languagePairId: DEFAULT_LANGUAGE_PAIR_ID,
      liveAssistEnabled: true,
    });
    void chrome.runtime.sendMessage({ type: "TOGGLE_OVERLAY", enabled: false });
  });
  bindDrag(root, shadow);
  return root;
}

function bindDrag(root: HTMLElement, shadow: ShadowRoot): void {
  if (dragBound) return;
  const handle = shadow.querySelector('[data-role="drag"]');
  if (!(handle instanceof HTMLElement)) return;
  dragBound = true;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    dragging = true;
    const rect = root.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    root.style.right = "auto";
    root.style.bottom = "auto";
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.top}px`;
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging) return;
    const maxLeft = Math.max(0, window.innerWidth - root.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - root.offsetHeight);
    root.style.left = `${clamp(event.clientX - offsetX, 0, maxLeft)}px`;
    root.style.top = `${clamp(event.clientY - offsetY, 0, maxTop)}px`;
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
  handle.addEventListener("keydown", (event: KeyboardEvent) => {
    const stepN = event.shiftKey ? 40 : 12;
    const rect = root.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    if (event.key === "ArrowLeft") left -= stepN;
    else if (event.key === "ArrowRight") left += stepN;
    else if (event.key === "ArrowUp") top -= stepN;
    else if (event.key === "ArrowDown") top += stepN;
    else return;
    event.preventDefault();
    root.style.right = "auto";
    root.style.bottom = "auto";
    const maxLeft = Math.max(0, window.innerWidth - root.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - root.offsetHeight);
    root.style.left = `${clamp(left, 0, maxLeft)}px`;
    root.style.top = `${clamp(top, 0, maxTop)}px`;
  });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

let lastAssetPath: string | null = null;

export function renderOverlay(vm: OverlayViewModel): void {
  const root = ensureOverlayHost();
  const shadow = root.shadowRoot;
  if (!shadow) return;
  const panel = shadow.querySelector(".panel");
  const video = shadow.querySelector('[data-role="clip"]');
  const glyphEl = shadow.querySelector('[data-role="glyph"]');
  const glossEl = shadow.querySelector('[data-role="gloss"]');
  const hintEl = shadow.querySelector('[data-role="hint"]');
  const cueEl = shadow.querySelector('[data-role="cue"]');
  const gateEl = shadow.querySelector('[data-role="gate"]');
  const routingEl = shadow.querySelector('[data-role="routing"]');
  const tierEmptyEl = shadow.querySelector('[data-role="tier-a-empty"]');
  const badgeEl = shadow.querySelector('[data-role="badge"]');
  const claimEl = shadow.querySelector('[data-role="claim"]');
  const disclaimerEl = shadow.querySelector('[data-role="disclaimer"]');
  const glossNoteEl = shadow.querySelector('[data-role="gloss-note"]');
  const pairLineEl = shadow.querySelector('[data-role="pair-line"]');
  if (!(panel instanceof HTMLElement)) return;

  const pair = getLanguagePair(vm.languagePairId);
  root.setAttribute("aria-label", pair.assistCopy.label);

  if (badgeEl instanceof HTMLElement) badgeEl.textContent = pair.assistCopy.badge;
  if (claimEl instanceof HTMLElement) claimEl.textContent = pair.assistCopy.label;
  if (disclaimerEl instanceof HTMLElement) {
    disclaimerEl.textContent = pair.assistCopy.disclaimer;
  }
  if (glossNoteEl instanceof HTMLElement) {
    glossNoteEl.textContent = pair.assistCopy.glossNote;
  }
  if (pairLineEl instanceof HTMLElement) {
    const status =
      pair.uiStatus === "live"
        ? "live habit shell (assist / partial)"
        : pair.uiStatus === "pending"
          ? (pair.pickerHint ?? "pending")
          : "not shipped";
    pairLineEl.textContent = `Language · ${pair.displayName} (${pair.signLanguageIso}) · ${status}`;
  }

  panel.dataset.visible = vm.enabled || vm.blocked ? "true" : "false";

  if (routingEl instanceof HTMLElement) {
    if (vm.enabled && vm.liveAssistEnabled && vm.routingLine) {
      routingEl.hidden = false;
      routingEl.textContent = vm.routingLine;
    } else {
      routingEl.hidden = true;
      routingEl.textContent = "";
    }
  }

  if (tierEmptyEl instanceof HTMLElement) {
    if (vm.enabled && vm.liveAssistEnabled && vm.tierAEmptyState) {
      tierEmptyEl.hidden = false;
      tierEmptyEl.textContent = vm.tierAEmptyState;
    } else {
      tierEmptyEl.hidden = true;
      tierEmptyEl.textContent = "";
    }
  }

  if (hintEl instanceof HTMLElement) {
    hintEl.textContent = pair.assistCopy.clipStageHint;
  }

  if (glossEl instanceof HTMLElement) {
    if (vm.blocked) {
      glossEl.textContent =
        "Assist paused (critical-domain keyword stub — not content understanding).";
    } else if (!vm.liveAssistEnabled && vm.enabled) {
      glossEl.textContent =
        pair.pickerHint ??
        "Sign language path pending — no live gloss/clips for this pair.";
    } else if (vm.glossLine) {
      glossEl.textContent = `Assist gloss: ${vm.glossLine}`;
    } else if (vm.activeStep?.kind === "lexical") {
      glossEl.textContent = vm.activeStep.assetPath
        ? `Gloss: ${vm.activeStep.gloss}`
        : `Gloss cue: ${vm.activeStep.gloss} (clip pack pending)`;
    } else if (vm.activeStep?.kind === "fingerspell") {
      glossEl.textContent = `Fingerspell cue: ${vm.activeStep.letter}`;
    } else if (vm.enabled) {
      glossEl.textContent = "Waiting for caption window…";
    } else {
      glossEl.textContent = "";
    }
  }

  if (glyphEl instanceof HTMLElement) {
    if (
      vm.enabled &&
      !vm.blocked &&
      vm.liveAssistEnabled &&
      vm.activeStep?.kind === "fingerspell"
    ) {
      glyphEl.textContent = vm.activeStep.letter;
    } else if (
      vm.enabled &&
      !vm.blocked &&
      vm.liveAssistEnabled &&
      vm.activeStep?.kind === "lexical"
    ) {
      glyphEl.textContent = vm.activeStep.gloss;
    } else {
      glyphEl.textContent = "";
    }
  }

  if (video instanceof HTMLVideoElement) {
    // Never play assets when pair is not live (blocks ASL media under ISL).
    const path =
      vm.liveAssistEnabled && vm.enabled && !vm.blocked
        ? (vm.activeStep?.assetPath ?? null)
        : null;
    if (path) {
      const next = assetUrl(path);
      if (lastAssetPath !== next) {
        lastAssetPath = next;
        video.hidden = false;
        video.src = next;
        void video.play().catch(() => undefined);
      }
    } else {
      lastAssetPath = null;
      video.hidden = true;
      video.removeAttribute("src");
      video.load();
    }
  }

  if (cueEl instanceof HTMLElement) {
    if (vm.activeCaption && vm.enabled && !vm.blocked && vm.liveAssistEnabled) {
      cueEl.hidden = false;
      cueEl.textContent = `Synced caption window: ${vm.activeCaption}`;
    } else {
      cueEl.hidden = true;
      cueEl.textContent = "";
    }
  }

  if (gateEl instanceof HTMLElement) {
    if (vm.blocked && vm.gateMessage) {
      gateEl.hidden = false;
      gateEl.textContent = vm.gateMessage;
    } else {
      gateEl.hidden = true;
      gateEl.textContent = "";
    }
  }
}

export function pageCaptionsStillPresent(): boolean {
  const ytCaption = document.querySelector(".ytp-caption-window-container");
  const video = document.querySelector("video");
  return ytCaption !== null || video !== null;
}
