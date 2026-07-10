import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";
import {
  accentLabel,
  accentVoiceInstructions,
  DEFAULT_STORY_ACCENT,
  resolveStoryAccent,
  type StoryAccentCode,
} from "@/lib/story-accent";
import { buildFewShotBlock } from "@/lib/story-prompt-examples";

function names(items: RecipeIngredient[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

/** Lista legible de ingredientes elegidos, reutilizable por prompt y mock. */
export function describeRecipe(selection: RecipeSelectionSlice): string[] {
  const lines: string[] = [];

  if (selection.heroes.length > 0) {
    lines.push(`Protagonistas: ${names(selection.heroes)}.`);
  }
  if (selection.reto[0]) {
    lines.push(`Reto o dilema central: ${selection.reto[0].label}.`);
  }
  if (selection.aprenden.length > 0) {
    lines.push(
      `Qué deben aprender: ${selection.aprenden.map((e) => e.label).join(", ")}.`,
    );
  }
  if (selection.lugar[0]) {
    lines.push(`Lugar donde transcurre: ${selection.lugar[0].label}.`);
  }
  if (selection.mascota[0]) {
    lines.push(`Mascota que aparece: ${selection.mascota[0].label}.`);
  }
  if (selection.acompanantes.length > 0) {
    lines.push(`Acompañantes: ${names(selection.acompanantes)}.`);
  }
  if (selection.rolReto[0]) {
    lines.push(
      `Personaje que encarna el lado difícil del reto: ${selection.rolReto[0].label}.`,
    );
  }
  if (selection.objeto.length > 0) {
    lines.push(`Objetos con protagonismo: ${names(selection.objeto)}.`);
  }
  if (selection.molde[0]) {
    lines.push(
      `Inspirado en el clásico (estructura, no copiar literal): ${selection.molde[0].label}.`,
    );
  }

  return lines;
}

const ROLE_LABELS: Record<string, string> = {
  mama: "Mamá",
  papa: "Papá",
  madrastra: "Madrastra",
  padrastro: "Padrastro",
  cuidador: "Cuidador",
  otro: "Adulto",
};

/** Resume el perfil familiar para el prompt (sin volcar JSON completo). */
export function describeProfile(perfil: FamilyProfileDocument): string[] {
  const lines: string[] = [];
  const meta = perfil.meta;

  if (meta?.ciudad) lines.push(`Ciudad: ${meta.ciudad}.`);
  if (meta?.barrio) lines.push(`Contexto del barrio: ${meta.barrio}.`);
  if (meta?.como_le_dicen_al_hogar) {
    lines.push(`Hogar: ${meta.como_le_dicen_al_hogar}.`);
  }

  for (const adulto of perfil.adultos) {
    const etiqueta = ROLE_LABELS[adulto.rol] ?? "Adulto";
    const nombre = adulto.apodo
      ? `${adulto.nombre} (apodo: ${adulto.apodo})`
      : adulto.nombre;
    const frases = adulto.frases_tipicas?.slice(0, 2) ?? [];
    let line = `${etiqueta}: ${nombre}.`;
    if (frases.length > 0) {
      line += ` Frases típicas (usa 1–2 en diálogo si encajan): «${frases.join("» · «")}».`;
    }
    lines.push(line);
  }

  for (const nino of perfil.ninos) {
    const nombre = nino.apodo
      ? `${nino.nombre} (apodo: ${nino.apodo})`
      : nino.nombre;
    const partes = [`Niño/a: ${nombre}.`];
    const frase = nino.frases_tipicas?.[0];
    if (frase) partes.push(`Suele decir: «${frase}».`);
    if (nino.pantallas?.le_cuesta_soltar) {
      partes.push("Le cuesta soltar pantallas/tablet.");
    }
    if (nino.no_le_gusta?.dormir) {
      partes.push(`Con dormir: ${nino.no_le_gusta.dormir}.`);
    }
    lines.push(partes.join(" "));
  }

  for (const mascota of perfil.mascotas ?? []) {
    let line = `Mascota: ${mascota.nombre}.`;
    if (mascota.personalidad) line += ` ${mascota.personalidad}.`;
    lines.push(line);
  }

  return lines;
}

const STORY_PROMPT_CORE = `Eres Chacachón, autor de cuentos infantiles personalizados para familias en Colombia.

Audiencia: niños de 3 a 7 años, leídos en voz alta por un adulto (a menudo de noche). El adulto debe sonreír con la cotidianidad; el niño debe entender la trama sin explicaciones.

Frases claras, ritmo de lectura en voz alta; diálogos con raya (—).

Estructura narrativa (3 a 5 escenas con encabezado "## "):
1. Mundo — dónde estamos y quién es quién
2. Reto — el dilema aparece (tensión suave, sin miedo fuerte)
3. Complicación — intento fallido o momento difícil (opcional si el cuento es corto)
4. Giro — decisión, ayuda u objeto que cambia el rumbo
5. Cierre — calma; la lección se MUESTRA, nunca se dice como sermón

Reglas estrictas:
- Usa exactamente los nombres y apodos del perfil y la receta; no inventes otros nombres propios principales.
- El reto de la receta es el conflicto central; la lección de la receta solo al cierre, implícita.
- Sin violencia, miedo intenso, castigos humillantes, marcas comerciales ni temas adultos.
- Sin frases tipo "la moraleja es", "lo que aprendimos hoy" o "fin".

Formato de salida OBLIGATORIO en Markdown, sin texto extra antes ni después:
# Título del cuento
> Subtítulo corto y evocador (no repite la moraleja)

## Nombre de la escena
Párrafos...

Extensión: 350–600 palabras. No incluyas listas ni notas del autor.`;

/** System prompt según acento (default: neutro colombiano). */
export function buildStorySystemPrompt(
  accentCode: StoryAccentCode = DEFAULT_STORY_ACCENT,
): string {
  return `${STORY_PROMPT_CORE}

${accentVoiceInstructions(accentCode)}`;
}

/** @deprecated Usar buildStorySystemPrompt(accentCode) */
export const STORY_SYSTEM_PROMPT = buildStorySystemPrompt(DEFAULT_STORY_ACCENT);

export type StoryPromptInput = {
  selection: RecipeSelectionSlice;
  perfil?: FamilyProfileDocument | null;
  accentCode?: string | null;
};

/** Construye los mensajes para la API de IA a partir de receta + perfil + acento. */
export function buildStoryPrompt({
  selection,
  perfil,
  accentCode: requestedAccent,
}: StoryPromptInput): {
  system: string;
  user: string;
  accentCode: StoryAccentCode;
} {
  const accentCode = resolveStoryAccent(requestedAccent);
  const recipe = describeRecipe(selection);
  const profile = perfil ? describeProfile(perfil) : [];

  const userParts = [
    `Acento narrativo elegido: ${accentLabel(accentCode)} (\`${accentCode}\`).`,
    "",
    buildFewShotBlock(accentCode),
    "",
    "Escribe un cuento personalizado con estos ingredientes:",
    "",
    ...recipe.map((line) => `- ${line}`),
  ];

  if (profile.length > 0) {
    userParts.push(
      "",
      "Contexto de la familia (usa apodos y hasta 2 frases típicas en diálogo si encajan; no inventes otros nombres):",
      "",
      ...profile.map((line) => `- ${line}`),
    );
  }

  userParts.push(
    "",
    "Recuerda: arco mundo → reto → complicación → giro → cierre con lección implícita.",
    "Devuelve solo el cuento en el formato Markdown indicado.",
  );

  return {
    system: buildStorySystemPrompt(accentCode),
    user: userParts.join("\n"),
    accentCode,
  };
}
