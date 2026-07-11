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
  it("no tiene plantillas clásicas mientras el estante está vacío", () => {
    expect(CLASSIC_PLANTILLAS).toHaveLength(0);
    expect(getPlantillaPrefill("cerditos-del-edificio")).toBeNull();
    expect(hasPlantillaMolde("el-lobo-y-las-palabras")).toBe(false);
    expect(isClassicPlantillaSlug("cerditos-del-edificio")).toBe(false);
    expect(plantillaSlugToMoldeId("operacion-a-dormir")).toBeNull();
    expect(plantillaSlugToDilemaId("operacion-a-dormir")).toBeNull();
  });

  it("arma href del wizard", () => {
    expect(plantillaAdaptarHref("cerditos-del-edificio")).toBe(
      "/crear/adaptar?plantilla=cerditos-del-edificio",
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
