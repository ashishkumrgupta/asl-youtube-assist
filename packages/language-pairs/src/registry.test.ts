import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANGUAGE_PAIR_ID,
  LANGUAGE_PAIRS,
  MULTILANG_CLAIM_NOTE,
  clipPackForPair,
  conservativeGlossForPair,
  disabledLanguagePairs,
  fingerspellForPair,
  getLanguagePair,
  indianSignLanguagePair,
  isLivePairId,
  isPickerPairId,
  liveLanguagePairs,
  pickerLanguagePairs,
} from "./index.js";

describe("language-pair registry (ASL live + ISL pending)", () => {
  it("defaults to en-ase; ISL is ins; Irish isg absent from registry", () => {
    expect(DEFAULT_LANGUAGE_PAIR_ID).toBe("en-ase");
    expect(indianSignLanguagePair().signLanguageIso).toBe("ins");
    expect(indianSignLanguagePair().displayName).toContain("Indian");
    expect(
      LANGUAGE_PAIRS.some(
        (p) => (p as { signLanguageIso: string }).signLanguageIso === "isg",
      ),
    ).toBe(false);
    expect(LANGUAGE_PAIRS.some((p) => p.id.includes("isg"))).toBe(false);
    expect(MULTILANG_CLAIM_NOTE.toLowerCase()).toContain("irish");
    expect(MULTILANG_CLAIM_NOTE.toLowerCase()).toContain("out of scope");
  });

  it("picker shows ASL live + ISL pending; only ASL is live assist", () => {
    expect(pickerLanguagePairs().map((p) => p.id)).toEqual(["en-ase", "en-ins"]);
    expect(liveLanguagePairs().map((p) => p.id)).toEqual(["en-ase"]);
    expect(isLivePairId("en-ase")).toBe(true);
    expect(isLivePairId("en-ins")).toBe(false);
    expect(isPickerPairId("en-ins")).toBe(true);
    expect(indianSignLanguagePair().uiStatus).toBe("pending");
    expect(indianSignLanguagePair().liveAssistEnabled).toBe(false);
    expect(indianSignLanguagePair().pickerHint?.toLowerCase()).toContain("pending");
    expect(disabledLanguagePairs().length).toBeGreaterThan(0);
  });

  it("ISL copy refuses ASL mix and live product claims", () => {
    const isl = getLanguagePair("en-ins");
    const blob =
      `${isl.assistCopy.label} ${isl.assistCopy.disclaimer} ${isl.assistCopy.glossNote}`.toLowerCase();
    expect(blob).toContain("indian sign language");
    expect(blob).toContain("not asl");
    expect(blob).toContain("pending");
    expect(blob).not.toContain("irish");
    expect(isl.assetNamespace).toBe("ins");
    expect(clipPackForPair("en-ins").assetNamespace).toBe("ins");
    expect(clipPackForPair("en-ase").assetNamespace).toBe("ase");
  });

  it("does not run ASL gloss/fingerspell under ISL pair id", () => {
    const gloss = conservativeGlossForPair("en-ins", "What do you want today?");
    expect(gloss.live).toBe(false);
    expect(gloss.gloss).toBeNull();

    const fs = fingerspellForPair("en-ins", "Ravi");
    expect(fs.live).toBe(false);
    expect(fs.steps).toHaveLength(0);
    expect(fs.tableStatus).toBe("blocked_pending");

    const aslGloss = conservativeGlossForPair("en-ase", "What do you want today?");
    expect(aslGloss.live).toBe(true);
    expect(aslGloss.gloss?.glossLine).toContain("TODAY");
  });
});
