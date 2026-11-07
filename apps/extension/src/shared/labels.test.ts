import { describe, expect, it } from "vitest";
import { getLanguagePair } from "@asl/language-pairs";
import {
  PACK_PENDING_SHORT,
  POPSIGN_SOURCE_SHORT,
  REMOTE_SOURCE_LINE,
  VOLUNTEER_SOURCE_SHORT,
} from "@asl/lexical";
import { lintAssistCopy } from "@asl/lint-copy";
import {
  ASSIST_DETAILS,
  ASSIST_DISCLAIMER,
  ASSIST_HONESTY_LINE,
  ASSIST_LABEL,
  ASSIST_LABEL_COPY,
  ASSIST_STATUS_ON,
} from "@asl/shared-types";

describe("extension user-facing copy honesty", () => {
  it("ships ASL assist / partial only", () => {
    expect(ASSIST_LABEL).toBe("ASL assist / partial");
    expect(ASSIST_LABEL_COPY.claimTier).toBe("assist_partial");
  });

  it("compact chrome + About details pass assist copy lint", () => {
    expect(ASSIST_DISCLAIMER).toBe(ASSIST_HONESTY_LINE);
    expect(lintAssistCopy(ASSIST_HONESTY_LINE, "assist")).toEqual([]);
    expect(lintAssistCopy(ASSIST_DETAILS, "assist")).toEqual([]);
    expect(lintAssistCopy(ASSIST_STATUS_ON, "assist")).toEqual([]);
  });

  it("ASL pair chrome (incl. clipStageHint) passes assist copy lint", () => {
    const asl = getLanguagePair("en-ase").assistCopy;
    for (const surface of [
      asl.honestyLine,
      asl.disclaimer,
      asl.details,
      asl.glossNote,
      asl.clipStageHint,
    ]) {
      expect(lintAssistCopy(surface, "assist")).toEqual([]);
    }
    expect(asl.clipStageHint.toLowerCase()).not.toContain("interpreter-grade");
  });

  it("real-video provenance short tags pass assist copy lint", () => {
    for (const surface of [
      PACK_PENDING_SHORT,
      VOLUNTEER_SOURCE_SHORT,
      POPSIGN_SOURCE_SHORT,
      REMOTE_SOURCE_LINE,
    ]) {
      expect(lintAssistCopy(surface, "assist")).toEqual([]);
    }
  });
});
