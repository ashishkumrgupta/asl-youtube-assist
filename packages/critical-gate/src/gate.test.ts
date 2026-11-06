import { describe, expect, it } from "vitest";
import {
  GATE_STUB_NOTICE,
  detectCriticalDomains,
  evaluateCriticalGate,
  isCriticalDomainBlocked,
} from "./index.js";

describe("critical-domain hard gate", () => {
  it("detects health/legal/safety tokens", () => {
    expect(detectCriticalDomains(["medical", "vlog"])).toEqual(["health"]);
    expect(detectCriticalDomains(["court-hearing"])).toEqual(["legal"]);
    expect(detectCriticalDomains(["emergency-alert"])).toEqual(["safety"]);
  });

  it("blocks unsupervised assist when critical and no human path", () => {
    const result = evaluateCriticalGate({
      domains: ["diagnosis", "tips"],
      humanPathAvailable: false,
    });
    expect(result.blocked).toBe(true);
    expect(result.matchedDomains).toContain("health");
    expect(result.userMessage?.toLowerCase()).toContain("not an interpreter");
    expect(result.userMessage?.toLowerCase()).toContain("captions");
    expect(
      isCriticalDomainBlocked({ domains: ["legal"], humanPathAvailable: false }),
    ).toBe(true);
  });

  it("user copy discloses keyword stub / not content understanding", () => {
    const result = evaluateCriticalGate({
      domains: ["medical"],
      humanPathAvailable: false,
    });
    expect(result.userMessage).toContain(GATE_STUB_NOTICE);
    expect(result.userMessage?.toLowerCase()).toContain("not content understanding");
    expect(result.userMessage?.toLowerCase()).toContain("keyword");
  });

  it("does not block entertainment topics", () => {
    const result = evaluateCriticalGate({
      domains: ["comedy", "music"],
      humanPathAvailable: false,
    });
    expect(result.blocked).toBe(false);
    expect(result.reason).toBeNull();
  });

  it("allows assist UI when human path exists (still honest copy)", () => {
    const result = evaluateCriticalGate({
      domains: ["health"],
      humanPathAvailable: true,
    });
    expect(result.blocked).toBe(false);
    expect(result.userMessage?.toLowerCase()).toContain("human interpretation");
    expect(result.userMessage).toContain(GATE_STUB_NOTICE);
  });
});
