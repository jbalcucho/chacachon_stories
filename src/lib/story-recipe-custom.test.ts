import { describe, expect, it } from "vitest";
import {
  buildCustomDilema,
  buildCustomEmocion,
  buildCustomLugar,
  buildCustomProtagonist,
  buildCustomRecipeIngredient,
  isCustomRecipeIngredient,
  RECIPE_CUSTOM_LABEL_MAX,
} from "@/lib/story-recipe";

describe("custom recipe ingredients", () => {
  it("builds a custom protagonist with stable id", () => {
    const ing = buildCustomProtagonist("  La profe Diana  ");
    expect(ing).toMatchObject({
      kind: "persona",
      label: "La profe Diana",
      emoji: "✨",
    });
    expect(ing?.id).toBe("custom-persona-la-profe-diana");
    expect(isCustomRecipeIngredient(ing!.id)).toBe(true);
  });

  it("builds a custom dilema", () => {
    const ing = buildCustomDilema("No querer bañarse");
    expect(ing).toMatchObject({
      kind: "dilema",
      label: "No querer bañarse",
      emoji: "💭",
    });
    expect(ing?.id).toBe("custom-dilema-no-querer-banarse");
  });

  it("builds custom lección and lugar", () => {
    expect(buildCustomEmocion("Pedir perdón")).toMatchObject({
      kind: "emocion",
      label: "Pedir perdón",
      emoji: "💡",
    });
    expect(buildCustomLugar("La casa de la tía")).toMatchObject({
      kind: "lugar",
      label: "La casa de la tía",
      emoji: "📍",
    });
  });

  it("routes zones through buildCustomRecipeIngredient", () => {
    expect(buildCustomRecipeIngredient("aprenden", "Empatía")?.kind).toBe(
      "emocion",
    );
    expect(buildCustomRecipeIngredient("lugar", "El parque del barrio")?.kind).toBe(
      "lugar",
    );
    expect(buildCustomRecipeIngredient("heroes", "")).toBeNull();
  });

  it("rejects empty labels", () => {
    expect(buildCustomProtagonist("   ")).toBeNull();
    expect(buildCustomDilema("")).toBeNull();
  });

  it("truncates long labels", () => {
    const long = "a".repeat(RECIPE_CUSTOM_LABEL_MAX + 10);
    const ing = buildCustomProtagonist(long);
    expect(ing?.label.length).toBe(RECIPE_CUSTOM_LABEL_MAX);
  });
});
