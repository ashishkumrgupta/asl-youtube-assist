import {
  DEFAULT_LANGUAGE_PAIR_ID,
  conservativeGlossForPair,
  getLanguagePair,
  type LanguagePairId,
} from "@asl/language-pairs";
import { buildPlaylistFromGloss, type AssistPlaylistStep } from "@asl/lexical";
import { stitchIntoCue, stepAtElapsedStitched } from "@asl/stitch";
import { syncToCaptions } from "@asl/sync";
import type { CaptionCue } from "@asl/shared-types";

/**
 * Pure assist-frame advance for content-script + local demo / CI tests.
 * Drives caption→gloss overlay state without live YouTube or chrome APIs.
 */

export interface AssistViewModel {
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

export interface AssistClockState {
  lastCueId: string | null;
  cueStartedAtMediaMs: number | null;
  cachedSteps: readonly AssistPlaylistStep[];
  cachedGlossLine: string | null;
}

export function emptyAssistClock(): AssistClockState {
  return {
    lastCueId: null,
    cueStartedAtMediaMs: null,
    cachedSteps: [],
    cachedGlossLine: null,
  };
}

export interface AssistFrameInput {
  readonly enabled: boolean;
  readonly languagePairId: LanguagePairId | string;
  readonly cues: readonly CaptionCue[];
  readonly mediaMs: number;
  readonly routingLine: string | null;
  readonly tierAEmptyState: string | null;
  readonly clock: AssistClockState;
}

export interface AssistFrameResult {
  readonly clock: AssistClockState;
  readonly viewModel: AssistViewModel;
  readonly activeCue: CaptionCue | null;
  readonly renderKey: string;
}

export function advanceAssistFrame(input: AssistFrameInput): AssistFrameResult {
  const pair = getLanguagePair(input.languagePairId);
  const baseVm = {
    enabled: input.enabled,
    blocked: false,
    gateMessage: null as string | null,
    placeholderMode: !pair.liveAssistEnabled,
    routingLine: input.routingLine,
    tierAEmptyState: input.tierAEmptyState,
    languagePairId: pair.id,
    liveAssistEnabled: pair.liveAssistEnabled,
  };

  if (!input.enabled || !pair.liveAssistEnabled) {
    return {
      clock: emptyAssistClock(),
      activeCue: null,
      renderKey: "off",
      viewModel: {
        ...baseVm,
        activeCaption: null,
        activeStep: null,
        glossLine: null,
      },
    };
  }

  const sync = syncToCaptions(input.cues, input.mediaMs, input.mediaMs, 500);
  const activeCue = sync.activeCue;
  let clock = { ...input.clock };

  if (!activeCue) {
    return {
      clock: emptyAssistClock(),
      activeCue: null,
      renderKey: "idle",
      viewModel: {
        ...baseVm,
        activeCaption: null,
        activeStep: null,
        glossLine: null,
      },
    };
  }

  // Playlist rebuild is keyed on cue id. Callers (esp. YouTube DOM fallback)
  // must keep `id` stable for the lifetime of one visual caption window so
  // prefix growth / sliding endMs do not thrash stitch state. New window ⇒ new id.
  if (clock.lastCueId !== activeCue.id) {
    clock = {
      lastCueId: activeCue.id,
      cueStartedAtMediaMs: activeCue.startMs,
      cachedSteps: [],
      cachedGlossLine: null,
    };
    const pairGloss = conservativeGlossForPair(pair.id, activeCue.text);
    if (pairGloss.live && pairGloss.gloss) {
      const playlist = buildPlaylistFromGloss(pairGloss.gloss);
      const cueDurationMs = Math.max(0, activeCue.endMs - activeCue.startMs);
      const stitched = stitchIntoCue(playlist.steps, cueDurationMs || 2000);
      clock.cachedSteps = stitched.steps;
      clock.cachedGlossLine = pairGloss.gloss.glossLine || null;
    }
  }

  const elapsedInCue = Math.max(
    0,
    input.mediaMs - (clock.cueStartedAtMediaMs ?? activeCue.startMs),
  );
  const step = stepAtElapsedStitched(clock.cachedSteps, elapsedInCue);
  const stepKey =
    step?.kind === "lexical"
      ? `L:${step.gloss}`
      : step?.kind === "fingerspell"
        ? `F:${step.letter}`
        : "none";
  const renderKey = `${activeCue.id}|${stepKey}|${clock.cachedGlossLine ?? ""}`;

  return {
    clock,
    activeCue,
    renderKey,
    viewModel: {
      ...baseVm,
      activeCaption: activeCue.text,
      activeStep: step,
      glossLine: clock.cachedGlossLine,
    },
  };
}

export function defaultPairId(): LanguagePairId {
  return DEFAULT_LANGUAGE_PAIR_ID;
}
