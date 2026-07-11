import { describe, expect, it } from "vitest";
import {
  buildTrialPayload,
  buildTrialStoryMarkdown,
  normalizeTrialName,
  trialMarkdownToContent,
} from "@/lib/trial-story";

describe("trial-story", () => {
  it("rejects empty or oversized names", () => {
    expect(normalizeTrialName("")).toBeNull();
    expect(normalizeTrialName("   ")).toBeNull();
    expect(normalizeTrialName("A".repeat(25))).toBeNull();
    expect(normalizeTrialName("  Nico  ")).toBe("Nico");
  });

  it("builds a moment story with the child name", () => {
    const md = buildTrialStoryMarkdown("Luna", "dormir");
    expect(md).toContain("Luna");
    expect(md).toMatch(/dormir|calma/i);
    const content = trialMarkdownToContent(md);
    expect(content.title.length).toBeGreaterThan(0);
    expect(content.blocks.length).toBeGreaterThan(0);
  });

  it("builds a classic remix with optional companion and lesson", () => {
    const payload = buildTrialPayload({
      name: "Sofía",
      path: "classic",
      classicId: "cerditos",
      companionId: "mama",
      lessonId: "constancia",
    });
    expect(payload.frameLabel).toMatch(/cerditos/i);
    expect(payload.companionLabel).toBe("Mamá");
    expect(payload.lessonLabel).toBe("Constancia");
    expect(payload.markdown).toContain("Sofía");
    expect(payload.markdown).toMatch(/cerditos|casita/i);
    expect(payload.markdown).toContain("Mamá");
  });

  it("allows skipping extras on a house moment", () => {
    const payload = buildTrialPayload({
      name: "Nico",
      path: "moment",
      momentId: "trancon",
    });
    expect(payload.companionLabel).toBeNull();
    expect(payload.lessonLabel).toMatch(/paciencia/i);
    expect(payload.markdown).toMatch(/trancón|carro/i);
  });
});
