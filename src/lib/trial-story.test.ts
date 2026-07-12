import { describe, expect, it } from "vitest";
import {
  buildTrialPayload,
  buildTrialSelection,
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
      companionIds: ["mama"],
      companionNames: "Carolina",
      lessonId: "valentia",
    });
    expect(payload.frameLabel).toMatch(/cerditos/i);
    expect(payload.companionLabel).toMatch(/Mamá Carolina/i);
    expect(payload.lessonLabel).toBe("Valentía");
    expect(payload.markdown).toContain("Sofía");
    expect(payload.markdown).toMatch(/cerditos|casita/i);
    expect(payload.markdown).toContain("Mamá Carolina");
  });

  it("allows multiple companions", () => {
    const selection = buildTrialSelection({
      name: "Nico",
      path: "moment",
      momentId: "compartir",
      companionIds: ["mama", "amigo"],
      companionNames: "Ana, Tito",
    });
    expect(selection.acompanantes).toHaveLength(2);
    expect(selection.acompanantes[0]?.label).toMatch(/Mamá Ana/i);
    expect(selection.acompanantes[1]?.label).toMatch(/Amigo\/a Tito/i);
  });

  it("builds a recipe selection for classic AI prompts", () => {
    const selection = buildTrialSelection({
      name: "Sofía",
      path: "classic",
      classicId: "cabritos",
      companionIds: ["mama"],
    });
    expect(selection.heroes[0]?.label).toBe("Sofía");
    expect(selection.molde[0]?.label).toMatch(/cabritos/i);
    expect(selection.molde[0]?.hint).toMatch(/puerta|seña/i);
    expect(selection.acompanantes[0]?.label).toBe("Mamá");
  });
});
