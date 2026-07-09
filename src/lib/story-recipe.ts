import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

/** Tipo de ingrediente — define en qué casillas puede caer. */
export type RecipeKind =
  | "persona"
  | "mascota"
  | "emocion"
  | "dilema"
  | "lugar"
  | "objeto"
  | "molde";

export type RecipeIngredient = {
  id: string;
  kind: RecipeKind;
  label: string;
  emoji: string;
  hint?: string;
};

export type RecipeIngredients = {
  personas: RecipeIngredient[];
  mascotas: RecipeIngredient[];
  emociones: RecipeIngredient[];
  dilemas: RecipeIngredient[];
  lugares: RecipeIngredient[];
  objetos: RecipeIngredient[];
  moldes: RecipeIngredient[];
};

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
  { id: "emo-alegria", kind: "emocion", label: "Alegría", emoji: "😄" },
  { id: "emo-responsabilidad", kind: "emocion", label: "Responsabilidad", emoji: "✅" },
  { id: "emo-respeto", kind: "emocion", label: "Respeto", emoji: "🤝" },
  { id: "emo-valentia", kind: "emocion", label: "Valentía", emoji: "🦁" },
  { id: "emo-paciencia", kind: "emocion", label: "Paciencia", emoji: "🧘" },
  { id: "emo-generosidad", kind: "emocion", label: "Generosidad", emoji: "🎁" },
  { id: "emo-calma", kind: "emocion", label: "Calma", emoji: "🌙" },
  { id: "emo-honestidad", kind: "emocion", label: "Honestidad", emoji: "💬" },
];

/** Dilemas de crianza — el "reto" del cuento. */
export const DILEMAS: RecipeIngredient[] = [
  { id: "dil-dormir", kind: "dilema", label: "Ir a dormir", emoji: "😴", hint: "La batalla de la noche" },
  { id: "dil-pantallas", kind: "dilema", label: "Soltar la pantalla", emoji: "📱", hint: "Un video más…" },
  { id: "dil-respeto", kind: "dilema", label: "Hablar bonito", emoji: "🗣️", hint: "Nada de contestar feo" },
  { id: "dil-orden", kind: "dilema", label: "Ordenar el cuarto", emoji: "🧸", hint: "Juguetes por el piso" },
  { id: "dil-comida", kind: "dilema", label: "Comer de todo", emoji: "🥦", hint: "Las verduras también" },
  { id: "dil-miedos", kind: "dilema", label: "Vencer un miedo", emoji: "🌑", hint: "La oscuridad, el doctor…" },
  { id: "dil-compartir", kind: "dilema", label: "Compartir", emoji: "🤲", hint: "Prestar los juguetes" },
];

/** Lugar / ambientación — cambia por completo el sabor del cuento. */
export const LUGARES: RecipeIngredient[] = [
  { id: "lug-apartamento", kind: "lugar", label: "El apartamento", emoji: "🏢", hint: "Casa, edificio, Bogotá" },
  { id: "lug-abuelos", kind: "lugar", label: "Casa de los abuelos", emoji: "🏠", hint: "Mismo edificio" },
  { id: "lug-parque", kind: "lugar", label: "El parque", emoji: "🌳", hint: "Columpios y charcos" },
  { id: "lug-colegio", kind: "lugar", label: "El colegio", emoji: "🏫", hint: "El Rosario" },
  { id: "lug-finca", kind: "lugar", label: "La finca / el campo", emoji: "🌾", hint: "Fin de semana" },
  { id: "lug-bosque", kind: "lugar", label: "Un bosque de cuento", emoji: "🌲", hint: "Eucaliptos, aventura" },
  { id: "lug-ciudad", kind: "lugar", label: "La ciudad", emoji: "🚌", hint: "Buses, TransMilenio" },
];

/** Objeto o elemento especial — la textura que hace único el cuento. */
export const OBJETOS: RecipeIngredient[] = [
  { id: "obj-tablet", kind: "objeto", label: "La tablet", emoji: "📱" },
  { id: "obj-legos", kind: "objeto", label: "Los Legos", emoji: "🧱" },
  { id: "obj-josefina", kind: "objeto", label: "Josefina (aspiradora)", emoji: "🤖" },
  { id: "obj-caldo", kind: "objeto", label: "El caldo de la abuela", emoji: "🍲" },
  { id: "obj-balon", kind: "objeto", label: "Un balón", emoji: "⚽" },
  { id: "obj-linterna", kind: "objeto", label: "Una linterna", emoji: "🔦" },
];

/** Molde de cuento clásico — el motor de varios cuentos del catálogo. */
export const MOLDES: RecipeIngredient[] = [
  { id: "mol-cerditos", kind: "molde", label: "Los tres cerditos", emoji: "🐷" },
  { id: "mol-caperucita", kind: "molde", label: "Caperucita Roja", emoji: "🧥" },
  { id: "mol-patito", kind: "molde", label: "El patito feo", emoji: "🦆" },
  { id: "mol-ositos", kind: "molde", label: "Ricitos y los ositos", emoji: "🐻" },
  { id: "mol-hansel", kind: "molde", label: "Hansel y Gretel", emoji: "🍬" },
];

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Extrae los "ingredientes" arrastrables desde el perfil familiar. */
export function buildRecipeIngredients(
  perfil: FamilyProfileDocument,
): RecipeIngredients {
  const personas: RecipeIngredient[] = [];

  for (const nino of perfil.ninos) {
    personas.push({
      id: nino.id,
      kind: "persona",
      label: nino.apodo?.trim() || nino.nombre,
      emoji: "🧒",
      hint: "Peque",
    });
  }

  for (const adulto of perfil.adultos) {
    personas.push({
      id: adulto.id,
      kind: "persona",
      label: adulto.apodo?.trim() || adulto.nombre,
      emoji: ADULT_EMOJI[adulto.rol] ?? "🧑",
      hint: ADULT_LABEL[adulto.rol] ?? "Familia",
    });
  }

  for (const cercano of perfil.cercanos ?? []) {
    const nombre = asString(cercano.nombre);
    if (!nombre) continue;
    const relacion = asString(cercano.relacion) ?? "";
    personas.push({
      id: asString(cercano.id) ?? `cercano-${nombre}`,
      kind: "persona",
      label: nombre,
      emoji: CERCANO_EMOJI[relacion] ?? "🧑",
      hint: relacion ? relacion.charAt(0).toUpperCase() + relacion.slice(1) : "Cercano",
    });
  }

  const mascotas: RecipeIngredient[] = (perfil.mascotas ?? []).map((m) => ({
    id: m.id,
    kind: "mascota",
    label: m.nombre,
    emoji: "🐶",
    hint: m.personalidad?.split(";")[0]?.trim() || "Mascota",
  }));

  return {
    personas,
    mascotas,
    emociones: EMOCIONES,
    dilemas: DILEMAS,
    lugares: LUGARES,
    objetos: OBJETOS,
    moldes: MOLDES,
  };
}

export const RECIPE_CUSTOM_LABEL_MAX = 40;

function slugifyRecipeLabel(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "otro"
  );
}

export function isCustomRecipeIngredient(id: string): boolean {
  return id.startsWith("custom-");
}

/** Protagonista escrito a mano (no está en el perfil). */
export function buildCustomProtagonist(label: string): RecipeIngredient | null {
  const trimmed = label.trim().slice(0, RECIPE_CUSTOM_LABEL_MAX);
  if (!trimmed) return null;
  return {
    id: `custom-persona-${slugifyRecipeLabel(trimmed)}`,
    kind: "persona",
    label: trimmed,
    emoji: "✨",
    hint: "Protagonista personalizado",
  };
}

/** Reto escrito a mano (no está en la lista). */
export function buildCustomDilema(label: string): RecipeIngredient | null {
  const trimmed = label.trim().slice(0, RECIPE_CUSTOM_LABEL_MAX);
  if (!trimmed) return null;
  return {
    id: `custom-dilema-${slugifyRecipeLabel(trimmed)}`,
    kind: "dilema",
    label: trimmed,
    emoji: "💭",
    hint: "Reto personalizado",
  };
}

/** Lección escrita a mano (no está en la lista). */
export function buildCustomEmocion(label: string): RecipeIngredient | null {
  const trimmed = label.trim().slice(0, RECIPE_CUSTOM_LABEL_MAX);
  if (!trimmed) return null;
  return {
    id: `custom-emocion-${slugifyRecipeLabel(trimmed)}`,
    kind: "emocion",
    label: trimmed,
    emoji: "💡",
    hint: "Lección personalizada",
  };
}

/** Lugar escrito a mano (no está en la lista). */
export function buildCustomLugar(label: string): RecipeIngredient | null {
  const trimmed = label.trim().slice(0, RECIPE_CUSTOM_LABEL_MAX);
  if (!trimmed) return null;
  return {
    id: `custom-lugar-${slugifyRecipeLabel(trimmed)}`,
    kind: "lugar",
    label: trimmed,
    emoji: "📍",
    hint: "Lugar personalizado",
  };
}

export type RecipeCustomZone = "heroes" | "reto" | "aprenden" | "lugar";

export function buildCustomRecipeIngredient(
  zone: RecipeCustomZone,
  label: string,
): RecipeIngredient | null {
  switch (zone) {
    case "heroes":
      return buildCustomProtagonist(label);
    case "reto":
      return buildCustomDilema(label);
    case "aprenden":
      return buildCustomEmocion(label);
    case "lugar":
      return buildCustomLugar(label);
    default:
      return null;
  }
}
