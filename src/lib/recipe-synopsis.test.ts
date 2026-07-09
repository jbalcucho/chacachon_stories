import { describe, expect, it } from "vitest";
import { buildRecipeSynopsis } from "@/lib/recipe-summary";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";

const hero = (label: string): RecipeIngredient => ({
  id: `p-${label}`,
  kind: "persona",
  label,
  emoji: "🧒",
});

const dilema = (label: string): RecipeIngredient => ({
  id: `d-${label}`,
  kind: "dilema",
  label,
  emoji: "😴",
});

const emocion = (label: string): RecipeIngredient => ({
  id: `e-${label}`,
  kind: "emocion",
  label,
  emoji: "✅",
});

const lugar = (label: string): RecipeIngredient => ({
  id: `l-${label}`,
  kind: "lugar",
  label,
  emoji: "🏢",
});

function baseSelection(
  overrides: Partial<RecipeSelectionSlice> = {},
): RecipeSelectionSlice {
  return {
    heroes: [hero("Nico")],
    reto: [dilema("Ir a dormir")],
    aprenden: [emocion("Responsabilidad")],
    lugar: [lugar("El apartamento")],
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
    ...overrides,
  };
}

describe("buildRecipeSynopsis", () => {
  it("builds a multi-sentence preview with place and lesson", () => {
    const synopsis = buildRecipeSynopsis(baseSelection());
    expect(synopsis).toContain("Esta noche Nico protagoniza");
    expect(synopsis).toContain("escenario en el apartamento");
    expect(synopsis).toContain("ir a dormir");
    expect(synopsis).toContain("responsabilidad");
    expect(synopsis).toContain("Chacachón");
  });

  it("includes optional extras when present", () => {
    const synopsis = buildRecipeSynopsis(
      baseSelection({
        heroes: [hero("Nico"), hero("Simónchin")],
        mascota: [
          { id: "m1", kind: "mascota", label: "Firulais", emoji: "🐶" },
        ],
        molde: [
          { id: "mol1", kind: "molde", label: "Los tres cerditos", emoji: "🐷" },
        ],
      }),
    );
    expect(synopsis).toContain("Nico y Simónchin protagonizan");
    expect(synopsis).toContain("Firulais también tiene su momento");
    expect(synopsis).toContain("Los tres cerditos");
  });

  it("returns null without protagonists or reto", () => {
    expect(buildRecipeSynopsis(baseSelection({ heroes: [] }))).toBeNull();
    expect(buildRecipeSynopsis(baseSelection({ reto: [] }))).toBeNull();
  });
});
