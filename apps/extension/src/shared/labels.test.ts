import { describe, expect, it } from "vitest";
import { lintAssistCopy } from "@asl/lint-copy";
import { ASSIST_DISCLAIMER, ASSIST_LABEL, ASSIST_LABEL_COPY } from "@asl/shared-types";

describe("extension user-facing copy honesty", () => {
  it("ships ASL assist / partial only", () => {
    expect(ASSIST_LABEL).toBe("ASL assist / partial");
    expect(ASSIST_LABEL_COPY.claimTier).toBe("assist_partial");
  });

  it("disclaimer passes assist copy lint", () => {
    expect(lintAssistCopy(ASSIST_DISCLAIMER, "assist")).toEqual([]);
  });
});
