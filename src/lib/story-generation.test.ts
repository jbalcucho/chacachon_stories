import { describe, expect, it } from "vitest";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import { parseStoryHeader } from "@/lib/story-markdown";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import { buildStoryPrompt, describeRecipe } from "@/lib/story-prompt";
import type { RecipeIngredient } from "@/lib/story-recipe";

function ing(
  id: string,
  kind: RecipeIngredient["kind"],
  label: string,
): RecipeIngredient {
  return { id, kind, label, emoji: "" };
}

function emptySelection(): RecipeSelectionSlice {
  return {
    heroes: [],
    reto: [],
    aprenden: [],
    lugar: [],
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
  };
}

const sampleSelection: RecipeSelectionSlice = {
  ...emptySelection(),
  heroes: [ing("p-nico", "persona", "Nico")],
  reto: [ing("dil-dormir", "dilema", "Ir a dormir")],
  aprenden: [ing("emo-calma", "emocion", "Calma")],
  lugar: [ing("lug-apto", "lugar", "El apartamento")],
  mascota: [ing("mas-perro", "mascota", "Bingo")],
};

describe("describeRecipe", () => {
  it("lista protagonistas, reto, lección y lugar", () => {
    const lines = describeRecipe(sampleSelection).join("\n");
    expect(lines).toContain("Nico");
    expect(lines).toContain("Ir a dormir");
    expect(lines).toContain("Calma");
    expect(lines).toContain("El apartamento");
    expect(lines).toContain("Bingo");
  });

  it("omite zonas vacías", () => {
    const lines = describeRecipe({
      ...emptySelection(),
      heroes: [ing("p-ana", "persona", "Ana")],
      reto: [ing("dil-x", "dilema", "un reto")],
    });
    expect(lines.some((l) => l.startsWith("Objetos"))).toBe(false);
    expect(lines.some((l) => l.startsWith("Mascota"))).toBe(false);
  });
});

describe("buildStoryPrompt", () => {
  it("incluye system prompt y detalles en el mensaje de usuario", () => {
    const { system, user } = buildStoryPrompt(sampleSelection);
    expect(system).toContain("Chacachón");
    expect(user).toContain("Nico");
    expect(user).toContain("cuento");
  });
});

describe("buildMockStoryMarkdown", () => {
  it("genera un markdown parseable con título, subtítulo y escenas", () => {
    const markdown = buildMockStoryMarkdown(sampleSelection);
    const parsed = parseStoryHeader(markdown);
    expect(parsed.title.length).toBeGreaterThan(0);
    expect(parsed.title).not.toBe("Cuento");
    expect(parsed.subtitle).toBeTruthy();
    expect(markdown).toContain("## ");
    expect(markdown).toContain("Nico");
  });

  it("funciona con selección mínima (solo protagonista y reto)", () => {
    const markdown = buildMockStoryMarkdown({
      ...emptySelection(),
      heroes: [ing("p-ana", "persona", "Ana")],
      reto: [ing("dil-x", "dilema", "compartir los juguetes")],
    });
    expect(markdown).toContain("Ana");
    expect(markdown).toContain("compartir los juguetes");
  });
});
