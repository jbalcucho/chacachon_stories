import { buildRecipeTitle, type RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";

function names(items: RecipeIngredient[]): string {
  if (items.length === 0) return "la familia";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

function lower(label: string): string {
  const t = label.trim();
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/**
 * Genera un cuento de plantilla a partir de la receta, en el mismo Markdown que
 * lee el reader. Es el fallback cuando no hay ANTHROPIC_API_KEY (modo demo),
 * para que el flujo /crear se pueda mostrar completo de punta a punta.
 */
export function buildMockStoryMarkdown(
  selection: RecipeSelectionSlice,
): string {
  const heroes = names(selection.heroes);
  const heroesPlural = selection.heroes.length !== 1;
  const reto = selection.reto[0]?.label ?? "un día distinto";
  const lugar = selection.lugar[0]?.label ?? "el edificio";
  const lecciones = selection.aprenden.map((e) => lower(e.label));
  const mascota = selection.mascota[0]?.label ?? null;
  const acompanantes =
    selection.acompanantes.length > 0 ? names(selection.acompanantes) : null;
  const objeto = selection.objeto[0]?.label ?? null;
  const rolReto = selection.rolReto[0]?.label ?? null;

  const verbo = (s: string, p: string) => (heroesPlural ? p : s);
  const title = buildRecipeTitle(selection) ?? `La aventura de ${heroes}`;
  const subtitle = `Un cuento de Chacachón sobre ${lower(reto)}`;

  const leccionFrase =
    lecciones.length > 0
      ? `Esa noche, entre risas, ${heroes} ${verbo("aprendió", "aprendieron")} algo de ${lecciones.join(" y ")}.`
      : `Esa noche ${heroes} ${verbo("se durmió", "se durmieron")} con una sonrisa.`;

  const parts: string[] = [
    `# ${title}`,
    "",
    `> ${subtitle}`,
    "",
    "## El comienzo",
    "",
    `En ${lower(lugar)} empezaba un día como cualquiera, pero ${heroes} ${verbo("presentía", "presentían")} que algo especial estaba por pasar. ${acompanantes ? `${acompanantes} también ${verbo("andaba", "andaban")} por ahí.` : ""}`.trim(),
    "",
    "## El reto",
    "",
    `De pronto apareció ${lower(reto)}. ${rolReto ? `${rolReto} hacía la parte más difícil de la historia,` : "No era fácil,"} y ${heroes} ${verbo("tuvo", "tuvieron")} que pensar muy bien qué hacer.${mascota ? ` Menos mal ${mascota} estaba cerca para dar ánimo.` : ""}`,
    "",
    "## El momento clave",
    "",
    `${objeto ? `Con ayuda de ${lower(objeto)}, ` : ""}${heroes} ${verbo("respiró", "respiraron")} hondo y ${verbo("decidió", "decidieron")} enfrentarlo con calma. Poco a poco, lo que parecía enorme se volvió posible.`,
    "",
    "## El final",
    "",
    `${leccionFrase} Y en ${lower(lugar)}, todo volvió a estar tranquilo… hasta la próxima aventura.`,
    "",
    "---",
    "",
    "Y colorín colorado, este cuento de Chacachón se ha terminado.",
  ];

  return parts.join("\n");
}
