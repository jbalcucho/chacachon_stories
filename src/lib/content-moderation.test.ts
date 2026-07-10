import { describe, expect, it } from "vitest";
import {
  moderateRecipeSelection,
  moderateUserText,
} from "@/lib/content-moderation";
import type { RecipeSelectionPayload } from "@/lib/recipe-selection";

function emptySelection(): RecipeSelectionPayload {
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

describe("moderateUserText", () => {
  it("acepta nombres y lugares normales", () => {
    expect(moderateUserText("Nico")).toBeNull();
    expect(moderateUserText("El apartamento de la abuela")).toBeNull();
  });

  it("rechaza URLs y correos", () => {
    expect(moderateUserText("mira https://mal.com")).toMatch(/enlaces/);
    expect(moderateUserText("contacto@mail.com")).toMatch(/correos/);
  });

  it("rechaza HTML", () => {
    expect(moderateUserText("<script>alert(1)</script>")).toMatch(/HTML/);
  });

  it("rechaza términos inapropiados", () => {
    expect(moderateUserText("esto es una mierda")).toMatch(/apropiado/);
  });

  it("rechaza texto vacío", () => {
    expect(moderateUserText("   ")).toMatch(/vacío/);
  });
});

describe("moderateRecipeSelection", () => {
  it("pasa una receta limpia", () => {
    const selection: RecipeSelectionPayload = {
      ...emptySelection(),
      heroes: [
        {
          id: "custom-hero",
          kind: "persona",
          label: "Mateo",
          emoji: "",
        },
      ],
      reto: [
        {
          id: "dil-dormir",
          kind: "dilema",
          label: "Ir a dormir",
          emoji: "",
        },
      ],
    };
    expect(moderateRecipeSelection(selection)).toBeNull();
  });

  it("detecta texto libre problemático en cualquier zona", () => {
    const selection: RecipeSelectionPayload = {
      ...emptySelection(),
      heroes: [
        {
          id: "p-nico",
          kind: "persona",
          label: "Nico",
          emoji: "",
        },
      ],
      reto: [
        {
          id: "custom-reto",
          kind: "dilema",
          label: "visita www.evil.com",
          emoji: "",
        },
      ],
    };
    expect(moderateRecipeSelection(selection)).toMatch(/enlaces/);
  });
});
