import { describe, expect, it } from "vitest";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";
import {
  buildRecipePreviewBullets,
  buildRecipePreviewExcerpt,
} from "@/lib/recipe-preview";

function ing(
  id: string,
  kind: RecipeIngredient["kind"],
  label: string,
): RecipeIngredient {
  return { id, kind, label, emoji: "" };
}

const sampleSelection: RecipeSelectionSlice = {
  heroes: [ing("p-nico", "persona", "Nico")],
  reto: [ing("dil-dormir", "dilema", "Ir a dormir")],
  aprenden: [ing("emo-calma", "emocion", "Calma")],
  lugar: [ing("lug-apto", "lugar", "El apartamento")],
  mascota: [ing("mas-perro", "mascota", "Bingo")],
  acompanantes: [],
  rolReto: [],
  objeto: [],
  molde: [],
};

describe("buildRecipePreviewBullets", () => {
  it("lista ingredientes clave de la receta", () => {
    const bullets = buildRecipePreviewBullets(sampleSelection);
    expect(bullets.some((b) => b.includes("Nico"))).toBe(true);
    expect(bullets.some((b) => b.includes("Ir a dormir"))).toBe(true);
    expect(bullets.some((b) => b.includes("Bingo"))).toBe(true);
  });
});

describe("buildRecipePreviewExcerpt", () => {
  it("devuelve párrafos de ejemplo sin llamar a la IA", () => {
    const excerpt = buildRecipePreviewExcerpt(sampleSelection);
    expect(excerpt.length).toBeGreaterThan(0);
    expect(excerpt.join(" ")).toMatch(/Nico/i);
  });

  it("respeta el máximo de párrafos", () => {
    expect(buildRecipePreviewExcerpt(sampleSelection, 1)).toHaveLength(1);
  });
});
