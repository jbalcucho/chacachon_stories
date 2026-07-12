import { describe, expect, it } from "vitest";
import {
  assertTrialAiAllowed,
  TrialAiLimitError,
  trialAiCookieAllows,
  utcDayKey,
} from "@/lib/trial-ai-limits";

describe("trial-ai-limits", () => {
  it("allows when cookie is absent", () => {
    expect(trialAiCookieAllows(null)).toBe(true);
  });

  it("blocks when cookie matches today", () => {
    const day = utcDayKey();
    expect(
      trialAiCookieAllows(`chacachon_trial_ai_day=${encodeURIComponent(day)}`, day),
    ).toBe(false);
  });

  it("throws when cookie already used today", () => {
    const day = utcDayKey();
    const prev = process.env.TRIAL_AI_LIMITS_DISABLED;
    process.env.TRIAL_AI_LIMITS_DISABLED = "0";
    try {
      expect(() =>
        assertTrialAiAllowed({
          ip: "1.2.3.4",
          cookieHeader: `chacachon_trial_ai_day=${encodeURIComponent(day)}`,
        }),
      ).toThrow(TrialAiLimitError);
    } finally {
      if (prev === undefined) delete process.env.TRIAL_AI_LIMITS_DISABLED;
      else process.env.TRIAL_AI_LIMITS_DISABLED = prev;
    }
  });

  it("skips limits by default while tuning (unless forced on)", () => {
    const day = utcDayKey();
    const prev = process.env.TRIAL_AI_LIMITS_DISABLED;
    delete process.env.TRIAL_AI_LIMITS_DISABLED;
    try {
      expect(() =>
        assertTrialAiAllowed({
          ip: "9.9.9.9",
          cookieHeader: `chacachon_trial_ai_day=${encodeURIComponent(day)}`,
        }),
      ).not.toThrow();
    } finally {
      if (prev === undefined) delete process.env.TRIAL_AI_LIMITS_DISABLED;
      else process.env.TRIAL_AI_LIMITS_DISABLED = prev;
    }
  });

  it("enforces limits when TRIAL_AI_LIMITS_DISABLED=0", () => {
    const day = utcDayKey();
    const prev = process.env.TRIAL_AI_LIMITS_DISABLED;
    process.env.TRIAL_AI_LIMITS_DISABLED = "0";
    try {
      expect(() =>
        assertTrialAiAllowed({
          ip: "8.8.8.8",
          cookieHeader: `chacachon_trial_ai_day=${encodeURIComponent(day)}`,
        }),
      ).toThrow(TrialAiLimitError);
    } finally {
      if (prev === undefined) delete process.env.TRIAL_AI_LIMITS_DISABLED;
      else process.env.TRIAL_AI_LIMITS_DISABLED = prev;
    }
  });
});
