import { describe, expect, it } from "vitest";
import {
  buildGenerationTelemetry,
  estimateGenerationUsd,
  estimateTokensFromText,
  getGenerationCostAlertUsd,
} from "@/lib/generation-telemetry";

describe("estimateTokensFromText", () => {
  it("estima ~1 token cada 4 caracteres", () => {
    expect(estimateTokensFromText("abcd")).toBe(1);
    expect(estimateTokensFromText("abcdefgh")).toBe(2);
  });
});

describe("estimateGenerationUsd", () => {
  it("mock cuesta 0", () => {
    expect(
      estimateGenerationUsd({
        source: "mock",
        bodyMarkdown: "hola ".repeat(200),
      }),
    ).toBe(0);
  });

  it("usa usage del proveedor cuando existe", () => {
    const usd = estimateGenerationUsd({
      source: "gemini",
      bodyMarkdown: "x",
      usage: { inputTokens: 1_000_000, outputTokens: 1_000_000 },
    });
    // 0.1 + 0.4 = 0.5
    expect(usd).toBeCloseTo(0.5, 5);
  });
});

describe("buildGenerationTelemetry", () => {
  it("marca alert cuando el costo supera el umbral", () => {
    const prev = process.env.GENERATION_COST_ALERT_USD;
    process.env.GENERATION_COST_ALERT_USD = "0.01";

    const event = buildGenerationTelemetry({
      userId: "u1",
      storyId: "s1",
      source: "claude",
      model: "claude-3-5-sonnet-latest",
      durationMs: 1200,
      bodyMarkdown: "cuento",
      usage: { inputTokens: 100_000, outputTokens: 50_000 },
    });

    expect(event.alert).toBe(true);
    expect(event.event).toBe("story_generation");
    expect(event.estimatedUsd).toBeGreaterThan(0.01);

    if (prev !== undefined) process.env.GENERATION_COST_ALERT_USD = prev;
    else delete process.env.GENERATION_COST_ALERT_USD;
  });
});

describe("getGenerationCostAlertUsd", () => {
  it("usa 0.05 por defecto", () => {
    const prev = process.env.GENERATION_COST_ALERT_USD;
    delete process.env.GENERATION_COST_ALERT_USD;
    expect(getGenerationCostAlertUsd()).toBe(0.05);
    if (prev !== undefined) process.env.GENERATION_COST_ALERT_USD = prev;
  });
});
