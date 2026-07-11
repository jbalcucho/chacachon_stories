/**
 * Cuento de prueba sin login: mock local (sessionStorage).
 * Diferenciador: momento de casa O clásico conocido + personalización opcional.
 */

import { moderateUserText } from "@/lib/content-moderation";
import {
  parseBodyBlocks,
  parseStoryHeader,
  splitBlocksForPagination,
} from "@/lib/story-markdown";
import type { PersonalizedStoryContent } from "@/lib/story-reader";

export const TRIAL_STORY_STORAGE_KEY = "chacachon.trialStory.v2";
export const TRIAL_NAME_MAX = 24;

export type TrialPath = "moment" | "classic";

export type TrialMoment = {
  id: string;
  label: string;
  lessonId: string;
  place: string;
};

export type TrialClassic = {
  id: string;
  label: string;
  hint: string;
  lessonId: string;
  place: string;
};

export type TrialCompanion = {
  id: string;
  label: string;
};

export type TrialLesson = {
  id: string;
  label: string;
};

export const TRIAL_MOMENTS: TrialMoment[] = [
  {
    id: "pantallas",
    label: "Menos pantallas",
    lessonId: "responsabilidad",
    place: "la sala",
  },
  {
    id: "dormir",
    label: "Es hora de dormir",
    lessonId: "calma",
    place: "el apartamento",
  },
  {
    id: "compartir",
    label: "Debemos compartir",
    lessonId: "generosidad",
    place: "el cuarto de juegos",
  },
  {
    id: "verduras",
    label: "Comer verduras",
    lessonId: "habitos",
    place: "la mesa",
  },
];

export const TRIAL_CLASSICS: TrialClassic[] = [
  {
    id: "cerditos",
    label: "Los tres cerditos",
    hint: "Con tu niño como héroe",
    lessonId: "constancia",
    place: "las casitas del barrio",
  },
  {
    id: "caperucita",
    label: "Caperucita",
    hint: "Camino a casa de la abuela",
    lessonId: "prudencia",
    place: "el camino al edificio",
  },
  {
    id: "renacuajo",
    label: "El renacuajo paseador",
    hint: "Clásico de Pombo, con tu casa",
    lessonId: "escuchar",
    place: "el charco del parque",
  },
];

export const TRIAL_COMPANIONS: TrialCompanion[] = [
  { id: "mama", label: "Mamá" },
  { id: "papa", label: "Papá" },
  { id: "hermano", label: "Hermano/a" },
  { id: "bingo", label: "Bingo" },
];

export const TRIAL_LESSONS: TrialLesson[] = [
  { id: "calma", label: "Calma" },
  { id: "responsabilidad", label: "Responsabilidad" },
  { id: "generosidad", label: "Generosidad" },
  { id: "habitos", label: "Buenos hábitos" },
  { id: "constancia", label: "Constancia" },
  { id: "prudencia", label: "Prudencia" },
  { id: "escuchar", label: "Escuchar con cariño" },
  { id: "valentia", label: "Valentía" },
];

/** @deprecated Prefer TRIAL_MOMENTS — kept for old tests/call sites. */
export const TRIAL_CHALLENGES = TRIAL_MOMENTS.map((m) => ({
  id: m.id,
  label: m.label,
  lesson: TRIAL_LESSONS.find((l) => l.id === m.lessonId)?.label ?? "Calma",
}));

export type TrialStoryInput = {
  name: string;
  path: TrialPath;
  momentId?: string | null;
  classicId?: string | null;
  companionId?: string | null;
  lessonId?: string | null;
};

export type TrialStoryPayload = TrialStoryInput & {
  markdown: string;
  createdAt: string;
  frameLabel: string;
  lessonLabel: string;
  companionLabel: string | null;
};

export function normalizeTrialName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > TRIAL_NAME_MAX) return null;
  if (moderateUserText(name)) return null;
  return name;
}

export function getTrialMoment(id: string | null | undefined): TrialMoment {
  return TRIAL_MOMENTS.find((m) => m.id === id) ?? TRIAL_MOMENTS[0];
}

export function getTrialClassic(id: string | null | undefined): TrialClassic {
  return TRIAL_CLASSICS.find((c) => c.id === id) ?? TRIAL_CLASSICS[0];
}

export function getTrialCompanion(
  id: string | null | undefined,
): TrialCompanion | null {
  if (!id) return null;
  return TRIAL_COMPANIONS.find((c) => c.id === id) ?? null;
}

export function getTrialLesson(id: string | null | undefined): TrialLesson {
  return TRIAL_LESSONS.find((l) => l.id === id) ?? TRIAL_LESSONS[0];
}

export function resolveTrialDefaults(input: TrialStoryInput): {
  frameLabel: string;
  place: string;
  lesson: TrialLesson;
  companion: TrialCompanion | null;
} {
  const companion = getTrialCompanion(input.companionId);
  if (input.path === "classic") {
    const classic = getTrialClassic(input.classicId);
    const lesson = getTrialLesson(input.lessonId ?? classic.lessonId);
    return {
      frameLabel: classic.label,
      place: classic.place,
      lesson,
      companion,
    };
  }
  const moment = getTrialMoment(input.momentId);
  const lesson = getTrialLesson(input.lessonId ?? moment.lessonId);
  return {
    frameLabel: moment.label,
    place: moment.place,
    lesson,
    companion,
  };
}

function withCompanion(base: string, companion: TrialCompanion | null): string {
  if (!companion) return base;
  return `${base} ${companion.label} iba cerca, sin apurar.`;
}

function buildMomentStory(
  name: string,
  moment: TrialMoment,
  lesson: TrialLesson,
  companion: TrialCompanion | null,
): string {
  const title = `${name} y ${moment.label.toLowerCase()}`;

  let open: string;
  let middle: string;
  switch (moment.id) {
    case "dormir":
      open = `En ${moment.place}, ${name} todavía tenía los ojos bien abiertos. La noche pedía calma, no otra ronda de juegos.`;
      middle = `${name} respiró como un dragón suave, contó tres estrellas y dejó que la almohada ganara la batalla.`;
      break;
    case "compartir":
      open = `En ${moment.place}, ${name} tenía el juguete favorito bien pegado al pecho. Compartir sonaba… difícil.`;
      middle = `${name} soltó un poquito el juguete, lo pasó con las dos manos y descubrió que el juego crecía cuando iba de a dos.`;
      break;
    case "verduras":
      open = `En ${moment.place}, el plato traía verde brillante. ${name} miró el brócoli como si fuera un dragón pequeño.`;
      middle = `${name} probó un bocado de valiente, después otro. El dragón verde no era tan feroz… ¡hasta pidió más!`;
      break;
    case "pantallas":
    default:
      open = `En ${moment.place}, ${name} apretaba la tablet como un tesoro. Había llegado la hora de menos pantallas… y no era fácil.`;
      middle = `${name} puso la tablet a dormir primero. Después jugó un rato sin botones, solo con las manos y la risa.`;
      break;
  }

  return [
    `# ${title}`,
    "",
    `> Un momento de casa, con ${name} en el centro.`,
    "",
    "## El comienzo",
    "",
    withCompanion(open, companion),
    "",
    "## El reto",
    "",
    `El reto no era un monstruo: era aguantar un poquito más. ${name} quería hacerlo a su manera.`,
    "",
    "## El momento clave",
    "",
    middle,
    "",
    "## El final",
    "",
    `Esa noche, ${name} aprendió un poco de ${lesson.label.toLowerCase()}. En ${moment.place}, todo volvió a estar en paz… hasta la próxima historia de Chacachón.`,
    "",
    "---",
    "",
    "Y colorín colorado, este cuento de Chacachón se ha terminado.",
  ].join("\n");
}

function buildClassicStory(
  name: string,
  classic: TrialClassic,
  lesson: TrialLesson,
  companion: TrialCompanion | null,
): string {
  if (classic.id === "cerditos") {
    return [
      `# ${name} y los tres cerditos`,
      "",
      `> Como el clásico, pero con ${name} en tu casa.`,
      "",
      "## El comienzo",
      "",
      withCompanion(
        `Había una vez tres casitas cerca de ${classic.place}. ${name} quería construir la más firme de todas.`,
        companion,
      ),
      "",
      "## El reto",
      "",
      `Llegó un soplido fuerte —casi un lobo de ciudad— y las casitas flojas temblaron. ${name} no se rindió.`,
      "",
      "## El momento clave",
      "",
      `${name} eligió ladrillo a ladrillo: despacio, con cuidado. Lo fácil se caía; lo bien hecho se quedó.`,
      "",
      "## El final",
      "",
      `Así ${name} aprendió ${lesson.label.toLowerCase()}. Y en ${classic.place}, la casita buena aguantó… hasta el próximo cuento de Chacachón.`,
      "",
      "---",
      "",
      "Y colorín colorado, este cuento de Chacachón se ha terminado.",
    ].join("\n");
  }

  if (classic.id === "caperucita") {
    return [
      `# ${name} camino a casa`,
      "",
      `> Un guiño a Caperucita, con ${name} de protagonista.`,
      "",
      "## El comienzo",
      "",
      withCompanion(
        `${name} salió con una canasta hacia ${classic.place}. Había que llegar donde la abuela, sin perder el rumbo.`,
        companion,
      ),
      "",
      "## El reto",
      "",
      `Alguien en el camino ofreció un atajo demasiado dulce. ${name} sintió un no-sé-qué en la panza.`,
      "",
      "## El momento clave",
      "",
      `${name} eligió el camino conocido, saludó a los vecinos y llegó completo, canasta y todo.`,
      "",
      "## El final",
      "",
      `Ese día ${name} practicó ${lesson.label.toLowerCase()}. En casa de la abuela hubo abrazo… y otro cuento de Chacachón esperando.`,
      "",
      "---",
      "",
      "Y colorín colorado, este cuento de Chacachón se ha terminado.",
    ].join("\n");
  }

  return [
    `# ${name} y el renacuajo paseador`,
    "",
    `> Un guiño al clásico de Rafael Pombo, con ${name} de protagonista.`,
    "",
    "## El comienzo",
    "",
    withCompanion(
      `Cerca de ${classic.place}, un renacuajo muy elegante se acomodó el cuello y dijo: «Hoy salgo a pasear». ${name} lo escuchó atento.`,
      companion,
    ),
    "",
    "## El reto",
    "",
    `La mamá rana pidió cuidado: no tan lejos, no tan solo. Pero el renacuajo quería verse en todas las calles del parque.`,
    "",
    "## El momento clave",
    "",
    `${name} recordó el consejo a tiempo: mejor volver cuando la voz de casa llama. El paseo corto también puede ser grande.`,
    "",
    "## El final",
    "",
    `Así ${name} practicó ${lesson.label.toLowerCase()}. En ${classic.place} quedó la lección… y ganas de otro cuento de Chacachón.`,
    "",
    "---",
    "",
    "Y colorín colorado, este cuento de Chacachón se ha terminado.",
  ].join("\n");
}

export function buildTrialStoryMarkdown(input: TrialStoryInput): string;
/** @deprecated Legacy (name, challengeId) signature. */
export function buildTrialStoryMarkdown(
  name: string,
  challengeId: string,
): string;
export function buildTrialStoryMarkdown(
  inputOrName: TrialStoryInput | string,
  challengeId?: string,
): string {
  const input: TrialStoryInput =
    typeof inputOrName === "string"
      ? {
          name: inputOrName,
          path: "moment",
          momentId: challengeId ?? "dormir",
        }
      : inputOrName;

  const { lesson, companion } = resolveTrialDefaults(input);

  if (input.path === "classic") {
    return buildClassicStory(
      input.name,
      getTrialClassic(input.classicId),
      lesson,
      companion,
    );
  }

  return buildMomentStory(
    input.name,
    getTrialMoment(input.momentId),
    lesson,
    companion,
  );
}

export function buildTrialPayload(input: TrialStoryInput): TrialStoryPayload {
  const resolved = resolveTrialDefaults(input);
  return {
    name: input.name,
    path: input.path,
    momentId: input.path === "moment" ? getTrialMoment(input.momentId).id : null,
    classicId:
      input.path === "classic" ? getTrialClassic(input.classicId).id : null,
    companionId: resolved.companion?.id ?? null,
    lessonId: resolved.lesson.id,
    markdown: buildTrialStoryMarkdown(input),
    createdAt: new Date().toISOString(),
    frameLabel: resolved.frameLabel,
    lessonLabel: resolved.lesson.label,
    companionLabel: resolved.companion?.label ?? null,
  };
}

export function trialMarkdownToContent(
  markdown: string,
): PersonalizedStoryContent {
  const parsed = parseStoryHeader(markdown);
  return {
    title: parsed.title,
    subtitle: null,
    blocks: splitBlocksForPagination(parseBodyBlocks(parsed.body)),
  };
}

export function saveTrialStory(payload: TrialStoryPayload): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    TRIAL_STORY_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function readTrialStory(): TrialStoryPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(TRIAL_STORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrialStoryPayload;
    if (!parsed?.name || !parsed?.markdown) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTrialStory(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TRIAL_STORY_STORAGE_KEY);
  window.sessionStorage.removeItem("chacachon.trialStory.v1");
}
