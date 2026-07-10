import { describe, expect, it } from "vitest";
import {
  GenerationLimitError,
  getGenerationDailyLimit,
} from "@/lib/generation-limits";

describe("getGenerationDailyLimit", () => {
  it("usa 3 por defecto", () => {
    const prev = process.env.GENERATION_DAILY_LIMIT;
    delete process.env.GENERATION_DAILY_LIMIT;
    expect(getGenerationDailyLimit()).toBe(3);
    if (prev !== undefined) process.env.GENERATION_DAILY_LIMIT = prev;
  });

  it("respeta variable de entorno válida", () => {
    const prev = process.env.GENERATION_DAILY_LIMIT;
    process.env.GENERATION_DAILY_LIMIT = "5";
    expect(getGenerationDailyLimit()).toBe(5);
    if (prev !== undefined) process.env.GENERATION_DAILY_LIMIT = prev;
    else delete process.env.GENERATION_DAILY_LIMIT;
  });

  it("ignora valores inválidos", () => {
    const prev = process.env.GENERATION_DAILY_LIMIT;
    process.env.GENERATION_DAILY_LIMIT = "abc";
    expect(getGenerationDailyLimit()).toBe(3);
    if (prev !== undefined) process.env.GENERATION_DAILY_LIMIT = prev;
    else delete process.env.GENERATION_DAILY_LIMIT;
  });
});

describe("GenerationLimitError", () => {
  it("expone mensaje legible", () => {
    const err = new GenerationLimitError("Límite alcanzado");
    expect(err.message).toBe("Límite alcanzado");
    expect(err.name).toBe("GenerationLimitError");
  });
});
