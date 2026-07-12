import { describe, expect, it } from "vitest";
import {
  buildTrialPayload,
  buildTrialSelection,
  buildTrialStoryBlurb,
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
      companionNameById: { mama: "Carolina" },
      lessonId: "valentia",
    });
    expect(payload.frameLabel).toMatch(/cerditos/i);
    expect(payload.companionLabel).toMatch(/mamá Carolina/i);
    expect(payload.companionNameById).toEqual({ mama: "Carolina" });
    expect(payload.lessonLabel).toBe("Valentía");
    expect(payload.markdown).toContain("Sofía");
    expect(payload.markdown).toMatch(/cerditos|casita/i);
    expect(payload.markdown).toMatch(/mamá Carolina/i);
  });

  it("allows multiple companions with a name each", () => {
    const selection = buildTrialSelection({
      name: "Nico",
      path: "moment",
      momentId: "compartir",
      companionIds: ["mama", "amigo"],
      companionNameById: { mama: "Ana", amigo: "Tito" },
    });
    expect(selection.acompanantes).toHaveLength(2);
    expect(selection.acompanantes[0]?.label).toMatch(/Mamá Ana/i);
    expect(selection.acompanantes[1]?.label).toMatch(/Amigo\/a Tito/i);
  });

  it("builds a narrative blurb for the trial summary", () => {
    const blurb = buildTrialStoryBlurb({
      name: "Nico",
      path: "moment",
      ageBandId: "6-8",
      momentId: "pantallas",
      companionIds: ["mama", "papa"],
      companionNameById: { mama: "Carolina", papa: "Luis" },
      lessonId: "responsabilidad",
    });
    expect(blurb).toBe(
      "Se va a crear una historia donde Nico, de 6 a 8 años, junto a su mamá Carolina y a su papá Luis enfrenta el reto «Menos pantallas». En el camino practican responsabilidad.",
    );
  });

  it("includes an optional pet in the blurb and recipe", () => {
    const input = {
      name: "Nico",
      path: "moment" as const,
      ageBandId: "3-5",
      momentId: "compartir",
      companionIds: ["mama"],
      companionNameById: { mama: "Carolina" },
      petId: "perro",
      petName: "Bingo",
      lessonId: "generosidad",
    };
    expect(buildTrialStoryBlurb(input)).toBe(
      "Se va a crear una historia donde Nico, de 3 a 5 años, junto a su mamá Carolina, y con su perro Bingo enfrenta el reto «Debemos compartir». En el camino practican generosidad.",
    );
    const selection = buildTrialSelection(input);
    expect(selection.mascota).toHaveLength(1);
    expect(selection.mascota[0]?.label).toBe("Bingo");
    expect(selection.mascota[0]?.hint).toBe("perro");
    expect(selection.heroes[0]?.hint).toMatch(/3–5|3-5|Edad 3/i);
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
