import { describe, expect, it } from "vitest";
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
});
