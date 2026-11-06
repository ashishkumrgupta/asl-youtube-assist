import { describe, expect, it } from "vitest";
import { assistOverlayDefaults } from "./index.js";
import { parseRuntimeMessage } from "./messages.js";

describe("parseRuntimeMessage (fail-closed)", () => {
  it("accepts well-formed toggle / pair / get_state", () => {
    expect(parseRuntimeMessage({ type: "GET_STATE" })).toEqual({
      type: "GET_STATE",
    });
    expect(parseRuntimeMessage({ type: "TOGGLE_OVERLAY", enabled: true })).toEqual({
      type: "TOGGLE_OVERLAY",
      enabled: true,
    });
    expect(
      parseRuntimeMessage({ type: "SET_LANGUAGE_PAIR", languagePairId: "en-ase" }),
    ).toEqual({ type: "SET_LANGUAGE_PAIR", languagePairId: "en-ase" });
  });

  it("rejects malformed or overlong pair ids and unknown types", () => {
    expect(
      parseRuntimeMessage({
        type: "SET_LANGUAGE_PAIR",
        languagePairId: "en-ase<script>",
      }),
    ).toBeNull();
    expect(
      parseRuntimeMessage({ type: "SET_LANGUAGE_PAIR", languagePairId: "ALL" }),
    ).toBeNull();
    expect(parseRuntimeMessage({ type: "TOGGLE_OVERLAY", enabled: "yes" })).toBeNull();
    expect(parseRuntimeMessage({ type: "PWN" })).toBeNull();
    expect(parseRuntimeMessage(null)).toBeNull();
  });

  it("accepts STATE with overlay defaults shape", () => {
    const state = assistOverlayDefaults({ enabled: true });
    expect(parseRuntimeMessage({ type: "STATE", state })?.type).toBe("STATE");
  });
});
