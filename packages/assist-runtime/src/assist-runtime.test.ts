import { describe, expect, it } from "vitest";
import { parseSimpleVtt } from "@asl/sync";
import { advanceAssistFrame, emptyAssistClock } from "./index.js";

const HELLO_VTT = `WEBVTT

00:00.000 --> 00:02.000
Hello friends

00:02.000 --> 00:04.500
Welcome to the demo
`;

describe("assist-runtime caption→gloss advance", () => {
  it("stays idle with no active cue", () => {
    const frame = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues: parseSimpleVtt(HELLO_VTT),
      mediaMs: 9000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: "Tier A empty · not human interpretation",
      clock: emptyAssistClock(),
    });
    expect(frame.renderKey).toBe("idle");
    expect(frame.viewModel.activeCaption).toBeNull();
    expect(frame.viewModel.activeStep).toBeNull();
  });

  it("advances gloss when caption cues play", () => {
    const cues = parseSimpleVtt(HELLO_VTT);
    let clock = emptyAssistClock();

    const first = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 500,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    clock = first.clock;
    expect(first.activeCue?.text).toContain("Hello");
    expect(first.viewModel.activeCaption).toContain("Hello");
    expect(
      first.viewModel.glossLine ||
        first.viewModel.activeStep?.kind === "lexical" ||
        first.viewModel.activeStep?.kind === "fingerspell",
    ).toBeTruthy();

    const second = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues,
      mediaMs: 3000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    expect(second.activeCue?.text).toContain("Welcome");
    expect(second.activeCue?.id).not.toBe(first.activeCue?.id);
  });

  it("DOM live cue id change rebuilds playlist like YouTube CC updates", () => {
    let clock = emptyAssistClock();
    const a = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues: [
        {
          id: "dom-hello",
          startMs: 420,
          endMs: 4500,
          text: "Hello friends",
        },
      ],
      mediaMs: 500,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    clock = a.clock;
    expect(a.clock.lastCueId).toBe("dom-hello");

    const b = advanceAssistFrame({
      enabled: true,
      languagePairId: "en-ase",
      cues: [
        {
          id: "dom-welcome",
          startMs: 2920,
          endMs: 7000,
          text: "Welcome to the demo",
        },
      ],
      mediaMs: 3000,
      routingLine: "Assist · Tier B",
      tierAEmptyState: null,
      clock,
    });
    expect(b.clock.lastCueId).toBe("dom-welcome");
    expect(b.viewModel.activeCaption).toContain("Welcome");
  });
});
