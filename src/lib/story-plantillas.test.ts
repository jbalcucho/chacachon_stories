import { describe, expect, it } from "vitest";
import {
  CLASSIC_PLANTILLAS,
  getPlantillaPrefill,
  hasPlantillaMolde,
  isClassicPlantillaSlug,
  plantillaAdaptarHref,
  plantillaSlugToDilemaId,
  plantillaSlugToMoldeId,
} from "@/lib/story-plantillas";
import { buildInitialRecipeSelection } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";

function ing(
  id: string,
  kind: RecipeIngredient["kind"],
  label: string,
): RecipeIngredient {
  return { id, kind, label, emoji: "" };
}

const ingredients = {
  personas: [ing("p-nico", "persona", "Nico")],
  dilemas: [
    ing("dil-dormir", "dilema", "Ir a dormir"),
    ing("dil-miedos", "dilema", "Vencer un miedo"),
    ing("dil-respeto", "dilema", "Hablar bonito"),
  ],
  emociones: [ing("emo-responsabilidad", "emocion", "Responsabilidad")],
  lugares: [ing("lug-apartamento", "lugar", "El apartamento")],
  moldes: [
    ing("mol-cerditos", "molde", "Los tres cerditos"),
    ing("mol-caperucita", "molde", "Caperucita Roja"),
  ],
};

describe("story-plantillas", () => {
  it("tiene los 3 clásicos del corpus semilla (Fase 2)", () => {
    expect(CLASSIC_PLANTILLAS).toHaveLength(3);
    expect(getPlantillaPrefill("cerditos-la-torre-bien-hecha")).toEqual({
      slug: "cerditos-la-torre-bien-hecha",
      moldeId: "mol-cerditos",
      dilemaId: "dil-orden",
      label: "Los tres cerditos",
    });
    expect(hasPlantillaMolde("cerditos-la-torre-bien-hecha")).toBe(true);
    expect(isClassicPlantillaSlug("caperucita-el-camino-del-mandado")).toBe(
      true,
    );
    expect(plantillaSlugToMoldeId("ricitos-las-cosas-prestadas")).toBe(
      "mol-ositos",
    );
    expect(plantillaSlugToDilemaId("ricitos-las-cosas-prestadas")).toBe(
      "dil-respeto",
    );
  });

  it("slug desconocido devuelve null / false", () => {
    expect(getPlantillaPrefill("no-existe")).toBeNull();
    expect(hasPlantillaMolde("no-existe")).toBe(false);
    expect(isClassicPlantillaSlug("no-existe")).toBe(false);
    expect(plantillaSlugToMoldeId("no-existe")).toBeNull();
    expect(plantillaSlugToDilemaId("no-existe")).toBeNull();
  });

  it("arma href del wizard", () => {
    expect(plantillaAdaptarHref("cerditos-la-torre-bien-hecha")).toBe(
      "/crear/adaptar?plantilla=cerditos-la-torre-bien-hecha",
    );
  });
});

describe("buildInitialRecipeSelection + plantilla", () => {
  it("ignora slug sin prefill y usa defaults", () => {
    const selection = buildInitialRecipeSelection(
      ingredients,
      "cerditos-del-edificio",
    );
    expect(selection.molde).toHaveLength(0);
    expect(selection.reto[0]?.id).toBe("dil-dormir");
    expect(selection.heroes[0]?.label).toBe("Nico");
  });

  it("ignora slug desconocido sin romper defaults", () => {
    const selection = buildInitialRecipeSelection(ingredients, "no-existe");
    expect(selection.molde).toHaveLength(0);
    expect(selection.reto[0]?.id).toBe("dil-dormir");
  });
});
