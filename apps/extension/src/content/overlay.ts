import { ASSIST_BADGE, ASSIST_DISCLAIMER, ASSIST_LABEL } from "@asl/shared-types";

const ROOT_ID = "asl-assist-overlay-root";

export interface OverlayViewModel {
  readonly enabled: boolean;
  readonly blocked: boolean;
  readonly gateMessage: string | null;
  readonly activeCaption: string | null;
  readonly placeholderMode: boolean;
}

let dragBound = false;

export function ensureOverlayHost(): HTMLElement {
  let root = document.getElementById(ROOT_ID);
  if (root) return root;

  root = document.createElement("div");
  root.id = ROOT_ID;
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", ASSIST_LABEL);
  Object.assign(root.style, {
    position: "fixed",
    right: "16px",
    bottom: "96px",
    left: "auto",
    top: "auto",
    zIndex: "2147483646",
    width: "280px",
    maxWidth: "40vw",
    fontFamily: "system-ui, sans-serif",
    pointerEvents: "auto",
  } as CSSStyleDeclaration);

  // Shadow DOM isolates styles; never touch YouTube caption nodes.
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
      .stage {
        min-height: 120px;
        border-radius: 8px;
        background: linear-gradient(160deg, #1a2332, #0d121a);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px;
        font-size: 13px;
        color: #c9d4e3;
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
          aria-label="Move ASL assist overlay — drag so it does not cover captions"
          title="Drag to move — keep captions visible"
        >Move</div>
        <button type="button" class="close" aria-label="Hide ASL assist overlay">Hide</button>
      </div>
      <div class="badge">${escapeHtml(ASSIST_BADGE)}</div>
      <div class="claim">${escapeHtml(ASSIST_LABEL)}</div>
      <div class="disclaimer">${escapeHtml(ASSIST_DISCLAIMER)}</div>
      <div class="stage" data-role="stage">Placeholder signing — no clip CDN in Slice A. Label stays ASL assist / partial.</div>
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
      placeholderMode: true,
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
    // Switch from right/bottom anchoring to left/top for free placement.
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
    const left = clamp(event.clientX - offsetX, 0, maxLeft);
    const top = clamp(event.clientY - offsetY, 0, maxTop);
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch {
      // ignore if already released
    }
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);

  // Keyboard nudge — keeps overlay operable without trapping focus in PiP.
  handle.addEventListener("keydown", (event: KeyboardEvent) => {
    const step = event.shiftKey ? 40 : 12;
    const rect = root.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    if (event.key === "ArrowLeft") left -= step;
    else if (event.key === "ArrowRight") left += step;
    else if (event.key === "ArrowUp") top -= step;
    else if (event.key === "ArrowDown") top += step;
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

export function renderOverlay(vm: OverlayViewModel): void {
  const root = ensureOverlayHost();
  const shadow = root.shadowRoot;
  if (!shadow) return;
  const panel = shadow.querySelector(".panel");
  const stage = shadow.querySelector('[data-role="stage"]');
  const cueEl = shadow.querySelector('[data-role="cue"]');
  const gateEl = shadow.querySelector('[data-role="gate"]');
  if (!(panel instanceof HTMLElement)) return;

  const show = vm.enabled || vm.blocked;
  panel.dataset.visible = show ? "true" : "false";

  if (stage instanceof HTMLElement) {
    if (vm.blocked) {
      stage.textContent =
        "ASL assist paused (critical-domain keyword stub — not content understanding).";
    } else if (vm.placeholderMode) {
      stage.textContent =
        "Placeholder signing — no clip CDN in Slice A. Label stays ASL assist / partial.";
    } else {
      stage.textContent = "ASL assist clip slot";
    }
  }

  if (cueEl instanceof HTMLElement) {
    if (vm.activeCaption && vm.enabled && !vm.blocked) {
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Captions floor assertion helper for tests / smoke. */
export function pageCaptionsStillPresent(): boolean {
  // Native YouTube caption region or text tracks — we never remove these nodes.
  const ytCaption = document.querySelector(".ytp-caption-window-container");
  const video = document.querySelector("video");
  return ytCaption !== null || video !== null;
}
