import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import {
  interpolateProfile,
  resolveProfileVariables,
  type TemplateVariables,
} from "@/lib/interpolation";

type PhraseRule = {
  from: string;
  to: (vars: TemplateVariables) => string;
};

/** Frases completas — orden largo → corto. */
const PHRASE_RULES: PhraseRule[] = [
  {
    from: "Jardín Miska Muska",
    to: (v) => v.colegio_anterior,
  },
  {
    from: "El Rosario",
    to: (v) => v.colegio_actual,
  },
  {
    from: "Familia Chacachón",
    to: (v) => `Familia ${v.apellido_hogar}`,
  },
  {
    from: "familia Chacachón",
    to: (v) => `familia ${v.apellido_hogar}`,
  },
  {
    from: "el apartamento",
    to: (v) => v.hogar,
  },
  {
    from: "Bogotá",
    to: (v) => v.ciudad,
  },
];

type WordRule = {
  pattern: RegExp;
  to: (vars: TemplateVariables) => string;
};

/** Nombres fijos del canon Chacachón → perfil activo. */
const WORD_RULES: WordRule[] = [
  { pattern: /\bSimónchin\b/g, to: (v) => v.niño_2 },
  { pattern: /\bNicolás\b/g, to: (v) => v.niño_1_nombre },
  { pattern: /\bNico\b/g, to: (v) => v.niño_1 },
  { pattern: /\bPauleta\b/g, to: (v) => v.mama },
  { pattern: /\bJulie\b/g, to: (v) => v.mama_nombre },
  { pattern: /\bChacachón\b/g, to: (v) => v.papa },
  { pattern: /\bJosé\b/g, to: (v) => v.papa_nombre },
  { pattern: /\bBetty\b/g, to: (v) => v.abuela_nombre },
  { pattern: /\bOrlando\b/g, to: (v) => v.abuelo_nombre },
  { pattern: /\bBingo\b/g, to: (v) => v.mascota_1 },
  { pattern: /\bMora\b/g, to: (v) => v.mascota_2 },
];

function applyPhraseRules(text: string, vars: TemplateVariables): string {
  let result = text;
  for (const rule of PHRASE_RULES) {
    const replacement = rule.to(vars);
    if (!replacement) continue;
    result = result.split(rule.from).join(replacement);
  }
  return result;
}

function applyWordRules(text: string, vars: TemplateVariables): string {
  let result = text;
  for (const rule of WORD_RULES) {
    const replacement = rule.to(vars);
    if (!replacement) continue;
    result = result.replace(rule.pattern, replacement);
  }
  return result;
}

/**
 * Personaliza texto de cuento:
 * 1. Interpola `{{clave}}` del perfil
 * 2. Sustituye nombres del canon Chacachón (markdown fuente)
 */
export function personalizeStoryText(
  text: string,
  perfil: FamilyProfileDocument,
  options: {
    useCanonReplacements?: boolean;
    familyTag?: string | null;
  } = {},
): string {
  const canonFamilies = new Set(["chacachon", undefined, null]);
  const useCanon =
    options.useCanonReplacements !== false &&
    canonFamilies.has(options.familyTag ?? "chacachon");
  const vars = resolveProfileVariables(perfil);

  let result = interpolateProfile(text, perfil, {
    escape: false,
    missingMarker: false,
  });

  if (useCanon) {
    result = applyPhraseRules(result, vars);
    result = applyWordRules(result, vars);
  }

  return result;
}
