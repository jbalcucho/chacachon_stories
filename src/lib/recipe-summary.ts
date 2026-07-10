import type { RecipeIngredient } from "@/lib/story-recipe";
import {
  plantillaSlugToDilemaId,
  plantillaSlugToMoldeId,
} from "@/lib/story-plantillas";

export type RecipeSelectionSlice = {
  heroes: RecipeIngredient[];
  reto: RecipeIngredient[];
  aprenden: RecipeIngredient[];
  lugar: RecipeIngredient[];
  mascota: RecipeIngredient[];
  acompanantes: RecipeIngredient[];
  rolReto: RecipeIngredient[];
  objeto: RecipeIngredient[];
  molde: RecipeIngredient[];
};

export type RecipeChecklistItem = {
  key: string;
  label: string;
  done: boolean;
};

export {
  hasPlantillaMolde,
  plantillaSlugToDilemaId,
  plantillaSlugToMoldeId,
} from "@/lib/story-plantillas";

export function getStepBlocker(
  zoneKey: keyof RecipeSelectionSlice,
  selection: RecipeSelectionSlice,
  optional = false,
): string | null {
  if (optional) return null;
  const items = selection[zoneKey];
  if (items.length > 0) return null;

  const labels: Partial<Record<keyof RecipeSelectionSlice, string>> = {
    heroes: "Elige al menos un protagonista para continuar",
    reto: "Elige el reto del cuento o escribe uno con «+ Otro»",
    aprenden: "Elige qué aprenden o escríbelo con «+ Otro»",
    lugar: "Elige dónde pasa o escríbelo con «+ Otro»",
    molde: "Elige un molde o toca «Omitir»",
  };

  return labels[zoneKey] ?? "Completa este paso para continuar";
}

export type RecipeWizardStep = {
  id: string;
  zoneKey?: keyof RecipeSelectionSlice;
  title: string;
  subtitle: string;
  optional?: boolean;
};

export function buildRecipeWizardSteps(
  promoteMolde: boolean,
): RecipeWizardStep[] {
  const steps: RecipeWizardStep[] = [
    {
      id: "heroes",
      zoneKey: "heroes",
      title: "Paso 1 · Los protagonistas",
      subtitle:
        "Elige quién sale en el cuento (hasta 3). Usa tu perfil o toca «+ Otro».",
    },
    {
      id: "reto",
      zoneKey: "reto",
      title: "Paso 2 · El reto",
      subtitle:
        "¿Qué dilema quieres abordar? Elige uno o escríbelo con «+ Otro».",
    },
    {
      id: "aprenden",
      zoneKey: "aprenden",
      title: "Paso 3 · La lección",
      subtitle:
        "¿Qué quieres que aprendan? Elige hasta 2 o escríbelo con «+ Otro».",
    },
    {
      id: "lugar",
      zoneKey: "lugar",
      title: "Paso 4 · El lugar",
      subtitle: "¿Dónde transcurre la historia? Elige uno o usa «+ Otro».",
    },
  ];

  if (promoteMolde) {
    steps.push({
      id: "molde",
      zoneKey: "molde",
      title: "Paso 5 · El clásico",
      subtitle: "Basado en un cuento tradicional. Puedes cambiarlo o dejarlo así.",
      optional: true,
    });
  }

  steps.push({
    id: "extras",
    title: promoteMolde ? "Paso 6 · Toques extra" : "Paso 5 · Toques extra",
    subtitle: "Opcional: mascota, acompañantes, objeto especial y más.",
    optional: true,
  });

  steps.push({
    id: "review",
    title: promoteMolde ? "Paso 7 · Tu cuento" : "Paso 6 · Tu cuento",
    subtitle: "Revisa la receta, elige el acento y mira la vista previa antes de crear.",
    optional: true,
  });

  return steps;
}

export function isWizardStepDone(
  step: RecipeWizardStep,
  selection: RecipeSelectionSlice,
): boolean {
  if (step.id === "review" || step.id === "extras") return true;
  if (!step.zoneKey) return true;
  if (step.optional) return true;
  return selection[step.zoneKey].length > 0;
}

/** Paso confirmado al pulsar Siguiente (no solo por tener chips por defecto). */
export function isWizardStepConfirmed(
  stepIndex: number,
  furthestConfirmedIndex: number,
): boolean {
  return stepIndex <= furthestConfirmedIndex;
}

/** Solo se puede volver a pasos ya confirmados. */
export function canNavigateToWizardStep(
  targetIndex: number,
  currentIndex: number,
  furthestConfirmedIndex: number,
): boolean {
  return (
    targetIndex !== currentIndex &&
    targetIndex >= 0 &&
    targetIndex <= furthestConfirmedIndex
  );
}

function joinNames(items: RecipeIngredient[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

function formatPlacePhrase(label: string): string {
  const trimmed = label.trim();
  if (/^(el|la|los|las|un|una)\s/i.test(trimmed)) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }
  return trimmed.toLowerCase();
}

function formatRetoPhrase(label: string): string {
  const trimmed = label.trim().toLowerCase();
  if (/^(ir a|no |solta|vencer|hablar|ordenar|comer|compartir)/.test(trimmed)) {
    return trimmed;
  }
  return `el reto de ${trimmed}`;
}

export function buildRecipeChecklist(
  selection: RecipeSelectionSlice,
): RecipeChecklistItem[] {
  return [
    { key: "heroes", label: "Protagonistas", done: selection.heroes.length > 0 },
    { key: "reto", label: "Reto", done: selection.reto.length > 0 },
    {
      key: "aprenden",
      label: "Lección",
      done: selection.aprenden.length > 0,
    },
    { key: "lugar", label: "Lugar", done: selection.lugar.length > 0 },
  ];
}

export function countChecklistDone(items: RecipeChecklistItem[]): number {
  return items.filter((i) => i.done).length;
}

export function getRecipeBlocker(selection: RecipeSelectionSlice): string | null {
  if (selection.heroes.length === 0) {
    return "Falta: elige al menos un protagonista";
  }
  if (selection.reto.length === 0) {
    return "Falta: elige el reto del cuento";
  }
  return null;
}

export function buildRecipeTitle(selection: RecipeSelectionSlice): string | null {
  const hero = selection.heroes[0];
  const reto = selection.reto[0];
  if (!hero || !reto) return null;

  if (selection.molde[0]) {
    return `${selection.molde[0].label} con ${hero.label}`;
  }

  return `La aventura de ${hero.label}: ${reto.label}`;
}

export function buildRecipeSynopsis(
  selection: RecipeSelectionSlice,
): string | null {
  const heroes = selection.heroes;
  const reto = selection.reto[0];
  if (heroes.length === 0 || !reto) return null;

  const names = joinNames(heroes);
  const verb = heroes.length === 1 ? "protagoniza" : "protagonizan";
  const parts: string[] = [];

  let opener = `Esta noche ${names} ${verb} un cuento para leer en familia`;
  if (selection.lugar[0]) {
    opener += `, con escenario en ${formatPlacePhrase(selection.lugar[0].label)}`;
  }
  parts.push(`${opener}.`);

  let conflict = `La historia gira en torno a ${formatRetoPhrase(reto.label)}`;
  if (selection.aprenden.length > 0) {
    const lessons = selection.aprenden
      .map((e) => e.label.toLowerCase())
      .join(" y ");
    conflict += `, y al cerrar la lectura queda la idea de ${lessons}`;
  }
  parts.push(`${conflict}.`);

  const extras: string[] = [];
  if (selection.mascota.length > 0) {
    extras.push(`${selection.mascota[0].label} también tiene su momento`);
  }
  if (selection.acompanantes.length > 0) {
    const who = joinNames(selection.acompanantes);
    extras.push(
      selection.acompanantes.length === 1
        ? `${who} acompaña la aventura`
        : `${who} acompañan la aventura`,
    );
  }
  if (selection.rolReto.length > 0) {
    extras.push(
      `${selection.rolReto[0].label} encarna el lado difícil del reto`,
    );
  }
  if (selection.objeto.length > 0) {
    const objs = joinNames(selection.objeto);
    extras.push(
      selection.objeto.length === 1
        ? `${objs} aparece como detalle especial`
        : `${objs} aparecen como detalles especiales`,
    );
  }
  if (selection.molde.length > 0) {
    extras.push(`todo con un guiño a «${selection.molde[0].label}»`);
  }
  if (extras.length > 0) {
    parts.push(`${extras.join("; ")}.`);
  }

  parts.push(
    "Humor familiar, escenas concretas y una moraleja sin sermón — así lo imagina Chacachón.",
  );

  return parts.join(" ");
}

type SuggestionRule = {
  retoId: string;
  lessonIds: string[];
  text: string;
};

const SUGGESTION_RULES: SuggestionRule[] = [
  {
    retoId: "dil-dormir",
    lessonIds: ["emo-paciencia", "emo-calma"],
    text: "Muchas familias combinan «ir a dormir» con paciencia o calma.",
  },
  {
    retoId: "dil-pantallas",
    lessonIds: ["emo-responsabilidad", "emo-paciencia"],
    text: "Para soltar la pantalla suele ayudar hablar de responsabilidad y paciencia.",
  },
  {
    retoId: "dil-respeto",
    lessonIds: ["emo-respeto", "emo-honestidad"],
    text: "Si el reto es hablar bonito, respeto e honestidad van muy bien juntos.",
  },
  {
    retoId: "dil-miedos",
    lessonIds: ["emo-valentia", "emo-calma"],
    text: "Para vencer un miedo, valentía y calma son una buena mezcla.",
  },
  {
    retoId: "dil-compartir",
    lessonIds: ["emo-generosidad", "emo-respeto"],
    text: "Cuando toca compartir, generosidad y respeto suelen acompañarse.",
  },
];

export function getRecipeSuggestion(
  selection: RecipeSelectionSlice,
): string | null {
  const retoId = selection.reto[0]?.id;
  if (!retoId) return null;

  const rule = SUGGESTION_RULES.find((r) => r.retoId === retoId);
  if (!rule) return null;

  const hasLesson = selection.aprenden.some((e) =>
    rule.lessonIds.includes(e.id),
  );
  if (hasLesson) return null;

  const labels = rule.lessonIds
    .map((id) => selection.aprenden.find((e) => e.id === id)?.label)
    .filter(Boolean);
  if (labels.length > 0) return null;

  return rule.text;
}

export function personAvatarInitial(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function personAvatarHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

export function buildInitialRecipeSelection(
  ingredients: {
    personas: RecipeIngredient[];
    dilemas: RecipeIngredient[];
    emociones: RecipeIngredient[];
    lugares: RecipeIngredient[];
    moldes: RecipeIngredient[];
  },
  plantillaSlug?: string | null,
): RecipeSelectionSlice {
  const selection: RecipeSelectionSlice = {
    heroes: ingredients.personas.slice(0, 1),
    reto: ingredients.dilemas.filter((d) => d.id === "dil-dormir"),
    aprenden: ingredients.emociones.filter((e) => e.id === "emo-responsabilidad"),
    lugar: ingredients.lugares.filter((l) => l.id === "lug-apartamento"),
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
  };

  if (plantillaSlug) {
    const dilemaId = plantillaSlugToDilemaId(plantillaSlug);
    if (dilemaId) {
      const dilema = ingredients.dilemas.find((d) => d.id === dilemaId);
      if (dilema) selection.reto = [dilema];
    }

    const moldeId = plantillaSlugToMoldeId(plantillaSlug);
    if (moldeId) {
      const molde = ingredients.moldes.find((m) => m.id === moldeId);
      if (molde) selection.molde = [molde];
    }
  }

  return selection;
}
