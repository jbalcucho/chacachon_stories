import { describe, expect, it } from "vitest";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import { parseStoryHeader } from "@/lib/story-markdown";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import { buildStoryPrompt, describeProfile, describeRecipe } from "@/lib/story-prompt";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
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
  it("incluye system prompt editorial y detalles en el mensaje de usuario", () => {
    const { system, user } = buildStoryPrompt({ selection: sampleSelection });
    expect(system).toContain("Había una vez");
    expect(system).toMatch(/PROHIBIDO.*Chacachón|Nadie conoce/i);
    expect(system).toContain("sermón");
    expect(system).toContain("neutro colombiano");
    expect(user).toContain("Nico");
    expect(user).toContain("Había una vez");
    expect(user).toContain("cohesión");
    expect(user).toContain("Neutro colombiano");
    expect(user).toContain("fragmentos de referencia");
  });

  it("usa neutro por defecto aunque no se pase accentCode", () => {
    const { accentCode, system } = buildStoryPrompt({
      selection: sampleSelection,
    });
    expect(accentCode).toBe("neutro");
    expect(system).toContain("neutro colombiano");
  });

  it("aplica instrucciones y few-shot del acento elegido", () => {
    const { system, user, accentCode } = buildStoryPrompt({
      selection: sampleSelection,
      accentCode: "bogota_cachaco",
    });
    expect(accentCode).toBe("bogota_cachaco");
    expect(system).toContain("cachaco");
    expect(user).toContain("Bogotano cachaco");
    expect(user).toContain("Ah carachas");
  });

  it("ignora accentCode inválido y vuelve a neutro", () => {
    const { accentCode } = buildStoryPrompt({
      selection: sampleSelection,
      accentCode: "paisa",
    });
    expect(accentCode).toBe("neutro");
  });

  it("inyecta contexto del perfil familiar cuando se provee", () => {
    const perfil: FamilyProfileDocument = {
      meta: { ciudad: "Bogotá", como_le_dicen_al_hogar: "el apartamento" },
      adultos: [
        {
          id: "a1",
          rol: "mama",
          nombre: "Julie",
          apodo: "Pauleta",
          frases_tipicas: ["Hagan caso"],
        },
      ],
      ninos: [{ id: "n1", nombre: "Nicolás", apodo: "Nico" }],
      mascotas: [{ id: "m1", nombre: "Bingo", personalidad: "ladra fuerte" }],
    };
    const { user } = buildStoryPrompt({ selection: sampleSelection, perfil });
    expect(user).toContain("Contexto de la familia");
    expect(user).toContain("Pauleta");
    expect(user).toContain("Bingo");
    expect(user).toContain("Bogotá");
  });
});

describe("describeProfile", () => {
  it("resume adultos, niños y mascotas sin volcar JSON", () => {
    const lines = describeProfile({
      meta: { ciudad: "Bogotá" },
      adultos: [{ id: "a1", rol: "papa", nombre: "José", apodo: "Chacachón" }],
      ninos: [{ id: "n1", nombre: "Nico" }],
    });
    const text = lines.join(" ");
    expect(text).toContain("Bogotá");
    expect(text).toContain("Chacachón");
    expect(text).toContain("Nico");
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
