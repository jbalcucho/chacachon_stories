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
    if (selection.molde[0].hint) {
      lines.push(`Andamiaje del clásico a respetar: ${selection.molde[0].hint}.`);
    }
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

Audiencia: cuentos familiares para niños de hasta ~12 años (lectura en voz alta o propia según la edad). Cualquier edad puede disfrutarlos; el foco es infancia / preadolescencia temprana. Humor de doble audiencia: el adulto sonríe con la cotidianidad; el niño entiende la trama sin explicaciones. No escribas versiones para adultos.

Frases en su mayoría cortas o medias; párrafos de 2–4 oraciones; ritmo de lectura en voz alta. Diálogos con raya (—), turnos breves, alternando narración y voz. Aire entre beats (no muros de texto). El cierre baja el volumen.

Estructura narrativa (andamiaje recomendado, 3 a 5 escenas con encabezado "## "):
1. Mundo — dónde estamos y quién es quién
2. Reto — el dilema aparece (tensión acorde a la edad, sin terror)
3. Complicación — intento fallido o momento difícil (opcional si el cuento es corto)
4. Giro — decisión, ayuda u objeto que cambia el rumbo
5. Cierre — calma; la lección se MUESTRA, nunca se dice como sermón

Técnica opcional (no obligatoria): abrir con una pequeña curiosidad o anomalía cotidiana (algo fuera de lugar en la casa/rutina) que el niño quiera resolver. Úsala solo si encaja con el reto; no fuerces objetos mágicos ni misterios en cada cuento.

Mínimo de calidad (obligatorio aunque fusiones escenas):
- Deseo o conflicto claro para el niño.
- Causa–efecto: lo que pasa sigue de lo que hacen los personajes.
- Cierre en calma; sin sermón.
Variantes válidas si la receta pide molde clásico (p. ej. tres intentos) u otra forma coherente.

Reglas estrictas:
- Usa exactamente los nombres y apodos del perfil y la receta; no inventes otros nombres propios principales.
- Reconocimiento familiar: el protagonista actúa (hace, decide, siente). Integra 1–2 marcas de dinámica familiar y como máximo 1–2 frases típicas en diálogo. No vuelques el perfil ni inventes parientes/datos no dados.
- Mundo reconocible y sensorial: 1–3 anclas concretas por escena (olor, sonido, textura, temperatura, clima, gesto de rutina). Evita descripciones abstractas ("era bonito", "estaba triste"): muéstralo en el cuerpo y el entorno. Prioridad: familia → lugar del perfil → Colombia → genérico cálido. No fuerces Bogotá ni satures objetos/jerga locales.
- El reto de la receta es el conflicto que el niño reconoce (deseo/frustración); la lección («qué aprenden») solo al cierre, mostrada en conducta o vínculo — no declarada. Una frase de insight del niño en su voz está bien; monólogos correctivos o "la moraleja es…" no.
- Regulación emocional visible: cuando el protagonista se frustre o tema, no lo resuelvas por arte de magia. Muestra la señal física (puños apretados, cara caliente, nudo en el estómago) y una acción concreta para calmarse (un suspiro largo, cerrar los ojos, soltar los hombros) antes de decidir. Prefiere el lenguaje en positivo (qué hacer), no en negativo (qué evitar).
- Humor de reconocimiento: 1–2 momentos cómicos de situación cotidiana (no chistes sueltos ni ridiculizar al niño). Límites firmes sin humillación; cansancio parental OK, cinismo hiriente no.
- Sin violencia, miedo intenso, castigos humillantes, marcas comerciales ni temas adultos.
- Sin frases tipo "la moraleja es", "lo que aprendimos hoy", "y desde ese día" ni subtítulos morales.

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
      "Contexto de la familia (apodos; máx. 1–2 frases típicas en diálogo si encajan; 1–2 marcas de dinámica; no inventes nombres ni vuelques toda la ficha):",
      "",
      ...profile.map((line) => `- ${line}`),
    );
  }

  userParts.push(
    "",
    "Recuerda: andamiaje mundo → reto → (complicación) → giro → cierre; mínimo: deseo/conflicto claro, causa–efecto y calma con lección implícita.",
    "Devuelve solo el cuento en el formato Markdown indicado.",
  );

  return {
    system: buildStorySystemPrompt(accentCode),
    user: userParts.join("\n"),
    accentCode,
  };
}
