import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

export type RecipeCategory = "personaje" | "mascota" | "emocion" | "dilema";

export type RecipeIngredient = {
  id: string;
  label: string;
  emoji: string;
  hint?: string;
};

export type RecipeIngredients = {
  personajes: RecipeIngredient[];
  mascotas: RecipeIngredient[];
  emociones: RecipeIngredient[];
  dilemas: RecipeIngredient[];
};

export const HEROES_MAX = 3;
export const EMOCIONES_MAX = 2;

const ADULT_EMOJI: Record<string, string> = {
  mama: "👩",
  papa: "👨",
  madrastra: "👩",
  padrastro: "👨",
  cuidador: "🧑",
  otro: "🧑",
};

const ADULT_LABEL: Record<string, string> = {
  mama: "Mamá",
  papa: "Papá",
  madrastra: "Madrastra",
  padrastro: "Padrastro",
  cuidador: "Cuidador/a",
  otro: "Familia",
};

const CERCANO_EMOJI: Record<string, string> = {
  abuela: "👵",
  abuelo: "👴",
  tia: "👩",
  tio: "👨",
  prima: "🧒",
  primo: "🧒",
};

/** Emociones y lecciones — lista curada, no depende del perfil. */
export const EMOCIONES: RecipeIngredient[] = [
  { id: "emo-alegria", label: "Alegría", emoji: "😄" },
  { id: "emo-responsabilidad", label: "Responsabilidad", emoji: "✅" },
  { id: "emo-respeto", label: "Respeto", emoji: "🤝" },
  { id: "emo-valentia", label: "Valentía", emoji: "🦁" },
  { id: "emo-paciencia", label: "Paciencia", emoji: "🧘" },
  { id: "emo-generosidad", label: "Generosidad", emoji: "🎁" },
  { id: "emo-calma", label: "Calma", emoji: "🌙" },
  { id: "emo-honestidad", label: "Honestidad", emoji: "💬" },
];

/** Dilemas de crianza — el "reto" del cuento. */
export const DILEMAS: RecipeIngredient[] = [
  { id: "dil-dormir", label: "Ir a dormir", emoji: "😴", hint: "La batalla de la noche" },
  { id: "dil-pantallas", label: "Soltar la pantalla", emoji: "📱", hint: "Un video más…" },
  { id: "dil-respeto", label: "Hablar bonito", emoji: "🗣️", hint: "Nada de contestar feo" },
  { id: "dil-orden", label: "Ordenar el cuarto", emoji: "🧸", hint: "Juguetes por el piso" },
  { id: "dil-comida", label: "Comer de todo", emoji: "🥦", hint: "Las verduras también" },
  { id: "dil-miedos", label: "Vencer un miedo", emoji: "🌑", hint: "La oscuridad, el doctor…" },
  { id: "dil-compartir", label: "Compartir", emoji: "🤲", hint: "Prestar los juguetes" },
];

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Extrae los "ingredientes" arrastrables desde el perfil familiar. */
export function buildRecipeIngredients(
  perfil: FamilyProfileDocument,
): RecipeIngredients {
  const personajes: RecipeIngredient[] = [];

  for (const nino of perfil.ninos) {
    personajes.push({
      id: nino.id,
      label: nino.apodo?.trim() || nino.nombre,
      emoji: "🧒",
      hint: "Peque",
    });
  }

  for (const adulto of perfil.adultos) {
    personajes.push({
      id: adulto.id,
      label: adulto.apodo?.trim() || adulto.nombre,
      emoji: ADULT_EMOJI[adulto.rol] ?? "🧑",
      hint: ADULT_LABEL[adulto.rol] ?? "Familia",
    });
  }

  for (const cercano of perfil.cercanos ?? []) {
    const nombre = asString(cercano.nombre);
    if (!nombre) continue;
    const relacion = asString(cercano.relacion) ?? "";
    personajes.push({
      id: asString(cercano.id) ?? `cercano-${nombre}`,
      label: nombre,
      emoji: CERCANO_EMOJI[relacion] ?? "🧑",
      hint: relacion ? relacion.charAt(0).toUpperCase() + relacion.slice(1) : "Cercano",
    });
  }

  const mascotas: RecipeIngredient[] = (perfil.mascotas ?? []).map((m) => ({
    id: m.id,
    label: m.nombre,
    emoji: "🐶",
    hint: m.personalidad?.split(";")[0]?.trim() || "Mascota",
  }));

  return { personajes, mascotas, emociones: EMOCIONES, dilemas: DILEMAS };
}
