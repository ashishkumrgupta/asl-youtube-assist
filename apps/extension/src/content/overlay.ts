import type { AssistViewModel } from "@asl/assist-runtime";
import { DEFAULT_LANGUAGE_PAIR_ID, getLanguagePair } from "@asl/language-pairs";

const ROOT_ID = "asl-assist-overlay-root";

export type OverlayViewModel = AssistViewModel;

let dragBound = false;
let detailsOpen = false;

/** Content-script registers this so Hide stops the tick clock synchronously. */
let hideHandler: (() => void) | null = null;

export function setOverlayHideHandler(handler: (() => void) | null): void {
  hideHandler = handler;
}

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
    width: "280px",
    maxWidth: "min(280px, 88vw)",
    pointerEvents: "auto",
  } as CSSStyleDeclaration);

  const shadow = root.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .panel {
        --ink: #07131a;
        --foam: #e7f3f1;
        --mist: #9bb8b4;
        --amber: #e2a35a;
        --line: rgba(231, 243, 241, 0.16);
        font-family: "Avenir Next", "Century Gothic", "Futura", "Gill Sans", sans-serif;
        color: var(--foam);
        background:
          radial-gradient(120% 90% at 0% 0%, rgba(46, 110, 98, 0.45), transparent 55%),
          radial-gradient(90% 80% at 100% 100%, rgba(226, 163, 90, 0.18), transparent 50%),
          linear-gradient(165deg, #0c2228 0%, #07131a 55%, #0a1814 100%);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px 14px;
        display: none;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
        animation: rise 280ms ease-out;
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
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--mist);
        padding: 4px 0;
        touch-action: none;
      }
      .drag-handle:active { cursor: grabbing; }
      .drag-handle:focus-visible,
      button:focus-visible {
        outline: 2px solid var(--amber);
        outline-offset: 2px;
      }
      .badge {
        font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--foam);
        line-height: 1.15;
        animation: soft-in 420ms ease-out;
      }
      .honesty {
        font-size: 12px;
        line-height: 1.35;
        color: var(--mist);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        font-size: 10px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--foam);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 3px 8px;
        background: rgba(255,255,255,0.04);
      }
      .chip[hidden] { display: none; }
      .stage {
        min-height: 120px;
        border-radius: 10px;
        background:
          linear-gradient(160deg, rgba(20, 48, 44, 0.9), rgba(8, 18, 22, 0.95));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px 10px;
        gap: 6px;
        position: relative;
        overflow: hidden;
      }
      .stage::after {
        content: "";
        position: absolute;
        inset: auto -20% -40% 40%;
        height: 70%;
        background: radial-gradient(circle, rgba(226, 163, 90, 0.16), transparent 65%);
        pointer-events: none;
        animation: drift 8s ease-in-out infinite alternate;
      }
      .stage video {
        width: 100%;
        max-height: 140px;
        border-radius: 6px;
        background: #050b0e;
        position: relative;
        z-index: 1;
      }
      .cue-glyph {
        font-family: Georgia, "Iowan Old Style", Palatino, serif;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--foam);
        line-height: 1.1;
        position: relative;
        z-index: 1;
        animation: soft-in 240ms ease-out;
      }
      .gloss {
        font-size: 12px;
        font-weight: 600;
        color: var(--foam);
        position: relative;
        z-index: 1;
      }
      .hint {
        font-size: 11px;
        color: var(--mist);
        position: relative;
        z-index: 1;
      }
      .cue {
        font-size: 11px;
        color: var(--mist);
        border-top: 1px solid var(--line);
        padding-top: 8px;
      }
      .gate {
        background: rgba(90, 24, 24, 0.55);
        border: 1px solid rgba(220, 120, 120, 0.45);
        color: #ffd7d7;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        line-height: 1.35;
      }
      button.close, button.about {
        background: transparent;
        border: 1px solid var(--line);
        color: var(--foam);
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 11px;
        font-family: inherit;
      }
      .about-body {
        font-size: 11px;
        line-height: 1.4;
        color: var(--mist);
        border-top: 1px solid var(--line);
        padding-top: 8px;
      }
      .about-body[hidden] { display: none; }
      @keyframes rise {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes soft-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes drift {
        from { transform: translate3d(0,0,0); }
        to { transform: translate3d(-12%, -8%, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .panel, .badge, .cue-glyph, .stage::after { animation: none; }
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
        <button type="button" class="about" data-role="about-toggle" aria-expanded="false">About</button>
        <button type="button" class="close" aria-label="Hide assist overlay">Hide</button>
      </div>
      <div class="badge" data-role="badge"></div>
      <div class="honesty" data-role="honesty"></div>
      <div class="chips">
        <span class="chip" data-role="routing" hidden></span>
        <span class="chip" data-role="tier-a-empty" hidden></span>
      </div>
      <div class="stage" data-role="stage">
        <video data-role="clip" muted playsinline loop hidden></video>
        <div class="cue-glyph" data-role="glyph" aria-live="polite"></div>
        <div class="gloss" data-role="gloss"></div>
        <div class="hint" data-role="hint"></div>
      </div>
      <div class="cue" data-role="cue" hidden></div>
      <div class="gate" data-role="gate" hidden></div>
      <div class="about-body" data-role="about-body" hidden></div>
    </div>
  `;

  document.documentElement.appendChild(root);
  const closeBtn = shadow.querySelector("button.close");
  closeBtn?.addEventListener("click", () => {
    detailsOpen = false;
    // Synchronously clear content-script enabled + stopClock before SW round-trip
    // so a pending 100ms tick cannot re-show the panel (Hide vs tick race).
    hideHandler?.();
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
  const aboutBtn = shadow.querySelector('[data-role="about-toggle"]');
  aboutBtn?.addEventListener("click", () => {
    detailsOpen = !detailsOpen;
    const body = shadow.querySelector('[data-role="about-body"]');
    if (body instanceof HTMLElement) body.hidden = !detailsOpen;
    if (aboutBtn instanceof HTMLButtonElement) {
      aboutBtn.setAttribute("aria-expanded", detailsOpen ? "true" : "false");
    }
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
  const honestyEl = shadow.querySelector('[data-role="honesty"]');
  const aboutBody = shadow.querySelector('[data-role="about-body"]');
  if (!(panel instanceof HTMLElement)) return;

  const pair = getLanguagePair(vm.languagePairId);
  root.setAttribute("aria-label", pair.assistCopy.label);

  if (badgeEl instanceof HTMLElement) badgeEl.textContent = pair.assistCopy.badge;
  if (honestyEl instanceof HTMLElement) {
    honestyEl.textContent = pair.assistCopy.honestyLine;
  }
  if (aboutBody instanceof HTMLElement) {
    aboutBody.textContent = `${pair.assistCopy.details} ${pair.assistCopy.glossNote}`;
    aboutBody.hidden = !detailsOpen;
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
    hintEl.textContent =
      vm.enabled && vm.liveAssistEnabled && !vm.blocked
        ? pair.assistCopy.clipStageHint
        : "";
  }

  if (glossEl instanceof HTMLElement) {
    if (vm.blocked) {
      glossEl.textContent = "Assist paused · critical topic · use captions";
    } else if (!vm.liveAssistEnabled && vm.enabled) {
      glossEl.textContent = pair.pickerHint ?? "Pending — not live";
    } else if (vm.glossLine) {
      glossEl.textContent = vm.glossLine;
    } else if (vm.activeStep?.kind === "lexical") {
      glossEl.textContent = vm.activeStep.gloss;
    } else if (vm.activeStep?.kind === "fingerspell") {
      glossEl.textContent = `FS · ${vm.activeStep.letter}`;
    } else if (vm.enabled) {
      glossEl.textContent = "Waiting for captions…";
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
      cueEl.textContent = vm.activeCaption;
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
  const theaterCaption = document.querySelector("[data-asl-demo-caption]");
  const theaterTrack = document.querySelector("#asl-demo-track, track[kind='captions']");
  // Explicit players only — no generic `video` (ads / endscreens / thumbs).
  const video = document.querySelector(
    "video[data-asl-demo-video], #asl-demo-video, video.html5-main-video",
  );
  return (
    ytCaption !== null ||
    theaterCaption !== null ||
    theaterTrack !== null ||
    video !== null
  );
}
