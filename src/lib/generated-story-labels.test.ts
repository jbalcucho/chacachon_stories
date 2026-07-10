import { describe, expect, it } from "vitest";
import {
  formatGeneratedStoryDate,
  labelGeneratedStorySource,
} from "@/lib/generated-story-labels";

describe("labelGeneratedStorySource", () => {
  it("traduce fuentes conocidas", () => {
    expect(labelGeneratedStorySource("gemini")).toBe("IA · Gemini");
    expect(labelGeneratedStorySource("mock")).toBe("Plantilla local");
  });

  it("usa fallback para fuentes desconocidas", () => {
    expect(labelGeneratedStorySource("otro")).toBe("Cuento personalizado");
  });
});

describe("formatGeneratedStoryDate", () => {
  it("formatea en español colombiano", () => {
    const formatted = formatGeneratedStoryDate(new Date("2026-07-10T12:00:00Z"));
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/10/);
  });
});
