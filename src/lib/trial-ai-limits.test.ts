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
    expect(() =>
      assertTrialAiAllowed({
        ip: "1.2.3.4",
        cookieHeader: `chacachon_trial_ai_day=${encodeURIComponent(day)}`,
      }),
    ).toThrow(TrialAiLimitError);
  });
});
