import type { RecipeSelectionPayload } from "@/lib/recipe-selection";

/** Patrones que no deben llegar al prompt del LLM ni guardarse tal cual. */
const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /https?:\/\//i, reason: "no se permiten enlaces web" },
  { pattern: /\bwww\./i, reason: "no se permiten enlaces web" },
  { pattern: /<[^>]+>/, reason: "no se permiten etiquetas HTML" },
  {
    pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/,
    reason: "no se permiten correos electrónicos",
  },
  {
    pattern: /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
    reason: "no se permiten números de teléfono",
  },
];

/** Términos explícitos o claramente inapropiados para cuentos infantiles. */
const BLOCKED_TERMS = [
  "puta",
  "puto",
  "mierda",
  "pendejo",
  "gonorrea",
  "hijueputa",
  "malparido",
  "verga",
  "pene",
  "vagina",
  "sexo",
  "porn",
  "nazi",
  "suicid",
  "matar",
  "asesin",
];

const RECIPE_ZONES: (keyof RecipeSelectionPayload)[] = [
  "heroes",
  "reto",
  "aprenden",
  "lugar",
  "mascota",
  "acompanantes",
  "rolReto",
  "objeto",
  "molde",
];

function normalizeForModeration(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/**
 * Valida texto libre del usuario (p. ej. «+ Otro»).
 * Devuelve mensaje de error o `null` si es aceptable.
 */
export function moderateUserText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "El texto no puede estar vacío.";

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) return reason;
  }

  const normalized = normalizeForModeration(trimmed);
  for (const term of BLOCKED_TERMS) {
    if (normalized.includes(term)) {
      return "ese texto no es apropiado para un cuento infantil";
    }
  }

  return null;
}

/** Revisa todos los ingredientes de la receta antes de generar. */
export function moderateRecipeSelection(
  selection: RecipeSelectionPayload,
): string | null {
  for (const zone of RECIPE_ZONES) {
    for (const ingredient of selection[zone]) {
      const issue = moderateUserText(ingredient.label);
      if (issue) {
        return `«${ingredient.label}»: ${issue}.`;
      }
    }
  }
  return null;
}
