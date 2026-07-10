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
  it("mapea clásicos a molde y dilema", () => {
    expect(plantillaSlugToMoldeId("cerditos-del-edificio")).toBe("mol-cerditos");
    expect(plantillaSlugToDilemaId("cerditos-del-edificio")).toBe("dil-miedos");
    expect(hasPlantillaMolde("el-lobo-y-las-palabras")).toBe(true);
    expect(isClassicPlantillaSlug("cerditos-del-edificio")).toBe(true);
  });

  it("prellena cuentos propios solo con dilema", () => {
    expect(plantillaSlugToMoldeId("operacion-a-dormir")).toBeNull();
    expect(plantillaSlugToDilemaId("operacion-a-dormir")).toBe("dil-dormir");
    expect(isClassicPlantillaSlug("operacion-a-dormir")).toBe(false);
  });

  it("arma href del wizard", () => {
    expect(plantillaAdaptarHref("cerditos-del-edificio")).toBe(
      "/crear/adaptar?plantilla=cerditos-del-edificio",
    );
  });

  it("lista al menos dos clásicos", () => {
    expect(CLASSIC_PLANTILLAS.length).toBeGreaterThanOrEqual(2);
  });
});

describe("buildInitialRecipeSelection + plantilla", () => {
  it("prellena molde y reto desde ?plantilla=", () => {
    const selection = buildInitialRecipeSelection(
      ingredients,
      "cerditos-del-edificio",
    );
    expect(selection.molde[0]?.id).toBe("mol-cerditos");
    expect(selection.reto[0]?.id).toBe("dil-miedos");
    expect(selection.heroes[0]?.label).toBe("Nico");
  });

  it("ignora slug desconocido sin romper defaults", () => {
    const selection = buildInitialRecipeSelection(ingredients, "no-existe");
    expect(selection.molde).toHaveLength(0);
    expect(selection.reto[0]?.id).toBe("dil-dormir");
  });

  it("resuelve label legible", () => {
    expect(getPlantillaPrefill("el-lobo-y-las-palabras")?.label).toBe(
      "Caperucita Roja",
    );
  });
});
