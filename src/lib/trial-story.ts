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

export const TRIAL_STORY_STORAGE_KEY = "chacachon.trialStory.v3";
export const TRIAL_NAME_MAX = 24;
export const TRIAL_COMPANION_NAME_MAX = 40;

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
    lessonId: "empatia",
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
    lessonId: "valentia",
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
    lessonId: "respeto",
    place: "el charco del parque",
  },
  {
    id: "cabritos",
    label: "El lobo y los siete cabritos",
    hint: "Grimm suave: cuidar la puerta de casa",
    lessonId: "prudencia",
    place: "el apartamento",
  },
];

export const TRIAL_COMPANIONS: TrialCompanion[] = [
  { id: "mama", label: "Mamá" },
  { id: "papa", label: "Papá" },
  { id: "hermano", label: "Hermano/a" },
  { id: "abuelo", label: "Abuelo/a" },
  { id: "amigo", label: "Amigo/a" },
];

export const TRIAL_LESSONS: TrialLesson[] = [
  { id: "respeto", label: "Respeto" },
  { id: "responsabilidad", label: "Responsabilidad" },
  { id: "habitos", label: "Buenos hábitos" },
  { id: "prudencia", label: "Prudencia" },
  { id: "valentia", label: "Valentía" },
  { id: "empatia", label: "Empatía" },
  { id: "autoestima", label: "Autoestima" },
  { id: "generosidad", label: "Generosidad" },
];

/** @deprecated Prefer TRIAL_MOMENTS — kept for old tests/call sites. */
export const TRIAL_CHALLENGES = TRIAL_MOMENTS.map((m) => ({
  id: m.id,
  label: m.label,
  lesson: TRIAL_LESSONS.find((l) => l.id === m.lessonId)?.label ?? "Respeto",
}));

export type TrialStoryInput = {
  name: string;
  path: TrialPath;
  momentId?: string | null;
  classicId?: string | null;
  /** Uno o varios roles (mamá, papá…). */
  companionIds?: string[] | null;
  /** Nombre opcional por rol: { mama: "Carolina", amigo: "Tito" }. */
  companionNameById?: Record<string, string> | null;
  /**
   * @deprecated Usar companionNameById. Se acepta por compatibilidad.
   * Si viene un solo acompañante, se interpreta como su nombre.
   */
  companionNames?: string | null;
  /** @deprecated usar companionIds */
  companionId?: string | null;
  lessonId?: string | null;
};

export type TrialStoryPayload = TrialStoryInput & {
  markdown: string;
  createdAt: string;
  frameLabel: string;
  lessonLabel: string;
  companionLabel: string | null;
  source?: "gemini" | "claude" | "mock";
};

const CLASSIC_BEATS: Record<string, string> = {
  cerditos:
    "Tres intentos de construir; lo fácil cae; lo firme queda; el niño es el héroe constructor; tono suave sin violencia.",
  caperucita:
    "Camino a casa de la abuela; tentación de un atajo; elegir el camino seguro; sin terror ni sangre.",
  renacuajo:
    "Guiño a Pombo: ganas de pasear vs consejo de volver a casa; escuchar con cariño; sin verso obligado.",
  cabritos:
    "Mamá sale; alguien intenta engañar en la puerta; seña o voz verdadera; la puerta se queda segura; sin horror.",
};

function ing(
  id: string,
  kind: "persona" | "dilema" | "emocion" | "lugar" | "molde",
  label: string,
  hint = "",
) {
  return { id, kind, label, emoji: "", ...(hint ? { hint } : {}) };
}

/** Receta mínima para el prompt IA del trial. */
export function buildTrialSelection(input: TrialStoryInput) {
  const resolved = resolveTrialDefaults(input);
  const heroes = [ing("trial-hero", "persona", input.name)];
  const aprenden = [
    ing(`trial-emo-${resolved.lesson.id}`, "emocion", resolved.lesson.label),
  ];
  const lugar = [ing("trial-lugar", "lugar", resolved.place)];
  const nameById = resolveCompanionNameById(input);
  const acompanantes = resolved.companions.map((c) => {
    const personal = normalizeCompanionNames(nameById[c.id]);
    const label = personal ? `${c.label} ${personal}` : c.label;
    return ing(`trial-comp-${c.id}`, "persona", label);
  });

  if (input.path === "classic") {
    const classic = getTrialClassic(input.classicId);
    return {
      heroes,
      reto: [
        ing(
          `trial-reto-${classic.id}`,
          "dilema",
          `Remix suave de «${classic.label}»`,
        ),
      ],
      aprenden,
      lugar,
      mascota: [],
      acompanantes,
      rolReto: [],
      objeto: [],
      molde: [
        ing(
          `trial-molde-${classic.id}`,
          "molde",
          classic.label,
          CLASSIC_BEATS[classic.id] ?? classic.hint,
        ),
      ],
    };
  }

  const moment = getTrialMoment(input.momentId);
  return {
    heroes,
    reto: [ing(`trial-reto-${moment.id}`, "dilema", moment.label)],
    aprenden,
    lugar,
    mascota: [],
    acompanantes,
    rolReto: [],
    objeto: [],
    molde: [],
  };
}

export function normalizeTrialName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > TRIAL_NAME_MAX) return null;
  if (moderateUserText(name)) return null;
  return name;
}

export function normalizeCompanionNames(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > TRIAL_COMPANION_NAME_MAX) return null;
  if (moderateUserText(name)) return null;
  return name;
}

export function resolveCompanionNameById(
  input: TrialStoryInput,
): Record<string, string> {
  const fromMap: Record<string, string> = {};
  for (const [id, value] of Object.entries(input.companionNameById ?? {})) {
    const normalized = normalizeCompanionNames(value);
    if (normalized) fromMap[id] = normalized;
  }
  const ids = resolveCompanionIds(input);
  // Compat: un solo string libre solo aplica si hay un acompañante.
  if (ids.length === 1 && input.companionNames && !fromMap[ids[0]]) {
    const normalized = normalizeCompanionNames(input.companionNames);
    if (normalized) fromMap[ids[0]] = normalized;
  }
  return fromMap;
}

export function joinSpanishList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
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

export function resolveCompanionIds(input: TrialStoryInput): string[] {
  if (input.companionIds && input.companionIds.length > 0) {
    return input.companionIds.filter((id) => getTrialCompanion(id));
  }
  if (input.companionId && getTrialCompanion(input.companionId)) {
    return [input.companionId];
  }
  return [];
}

export function formatCompanionLabel(
  companions: TrialCompanion[],
  nameById: Record<string, string> | null | undefined,
): string | null {
  if (companions.length === 0) return null;
  const parts = companions.map((c) => {
    const personal = normalizeCompanionNames(nameById?.[c.id]);
    return personal ? `${c.label.toLowerCase()} ${personal}` : c.label.toLowerCase();
  });
  return joinSpanishList(parts);
}

/** Rol en frase posesiva natural: «su mamá Carolina». */
const COMPANION_ROLE_NATURAL: Record<string, string> = {
  mama: "mamá",
  papa: "papá",
  hermano: "hermano",
  abuelo: "abuelo",
  amigo: "amigo",
};

function companionPossessivePart(
  companion: TrialCompanion,
  nameById: Record<string, string> | null | undefined,
): string {
  const role =
    COMPANION_ROLE_NATURAL[companion.id] ?? companion.label.toLowerCase();
  const personal = normalizeCompanionNames(nameById?.[companion.id]);
  return personal ? `su ${role} ${personal}` : `su ${role}`;
}

/** «junto a su mamá Carolina y a su papá Luis» */
export function formatCompanionAlongside(
  companions: TrialCompanion[],
  nameById: Record<string, string> | null | undefined,
): string | null {
  if (companions.length === 0) return null;
  const parts = companions.map((c) => companionPossessivePart(c, nameById));
  if (parts.length === 1) return `junto a ${parts[0]}`;
  if (parts.length === 2) return `junto a ${parts[0]} y a ${parts[1]}`;
  return `junto a ${parts.slice(0, -1).join(", a ")} y a ${parts[parts.length - 1]}`;
}

/** Resumen narrativo editable en la UI del trial. */
export function buildTrialStoryBlurb(input: TrialStoryInput): string {
  const hero = input.name.trim() || "el protagonista";
  const resolved = resolveTrialDefaults(input);
  const alongside = formatCompanionAlongside(
    resolved.companions,
    resolveCompanionNameById(input),
  );
  const withWho = alongside ? ` ${alongside}` : "";
  const action =
    input.path === "classic"
      ? `entra en un cuento inspirado en «${resolved.frameLabel}»`
      : `enfrenta el reto «${resolved.frameLabel}»`;
  return `Se va a crear una historia donde ${hero}${withWho} ${action}. En el camino practican ${resolved.lesson.label.toLowerCase()}.`;
}

export function getTrialLesson(id: string | null | undefined): TrialLesson {
  return TRIAL_LESSONS.find((l) => l.id === id) ?? TRIAL_LESSONS[0];
}

export function resolveTrialDefaults(input: TrialStoryInput): {
  frameLabel: string;
  place: string;
  lesson: TrialLesson;
  companions: TrialCompanion[];
  companionLabel: string | null;
} {
  const companions = resolveCompanionIds(input)
    .map((id) => getTrialCompanion(id))
    .filter((c): c is TrialCompanion => Boolean(c));
  const companionLabel = formatCompanionLabel(
    companions,
    resolveCompanionNameById(input),
  );

  if (input.path === "classic") {
    const classic = getTrialClassic(input.classicId);
    const lesson = getTrialLesson(input.lessonId ?? classic.lessonId);
    return {
      frameLabel: classic.label,
      place: classic.place,
      lesson,
      companions,
      companionLabel,
    };
  }
  const moment = getTrialMoment(input.momentId);
  const lesson = getTrialLesson(input.lessonId ?? moment.lessonId);
  return {
    frameLabel: moment.label,
    place: moment.place,
    lesson,
    companions,
    companionLabel,
  };
}

function withCompanion(base: string, companionLabel: string | null): string {
  if (!companionLabel) return base;
  return `${base} ${companionLabel} iba cerca, sin apurar.`;
}

function buildMomentStory(
  name: string,
  moment: TrialMoment,
  lesson: TrialLesson,
  companionLabel: string | null,
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
    withCompanion(open, companionLabel),
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
  companionLabel: string | null,
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
        companionLabel,
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
        companionLabel,
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

  if (classic.id === "renacuajo") {
    return [
      `# ${name} y el renacuajo paseador`,
      "",
      `> Un guiño al clásico de Rafael Pombo, con ${name} de protagonista.`,
      "",
      "## El comienzo",
      "",
      withCompanion(
        `Cerca de ${classic.place}, un renacuajo muy elegante se acomodó el cuello y dijo: «Hoy salgo a pasear». ${name} lo escuchó atento.`,
        companionLabel,
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

  // cabritos (Grimm, versión suave)
  return [
    `# ${name} y los siete cabritos`,
    "",
    `> Un guiño a Grimm, con ${name} cuidando la puerta de casa.`,
    "",
    "## El comienzo",
    "",
    withCompanion(
      `En ${classic.place}, mamá cabra salió un ratito. «No abran si la voz no es la mía», dijo. ${name} quedó atento junto a los cabritos.`,
      companionLabel,
    ),
    "",
    "## El reto",
    "",
    `Alguien tocó con voz dulce… demasiado dulce. Quería entrar. ${name} sintió un no-sé-qué: ¿era mamá de verdad?`,
    "",
    "## El momento clave",
    "",
    `${name} pidió la seña de casa (la canción, el golpecito, la palabra secreta). El engaño se quedó afuera. La puerta siguió segura.`,
    "",
    "## El final",
    "",
    `Cuando mamá volvió, hubo abrazo y merienda. ${name} practicó ${lesson.label.toLowerCase()}. En ${classic.place}, la casa quedó en paz… hasta el próximo cuento de Chacachón.`,
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

  const { lesson, companionLabel } = resolveTrialDefaults(input);

  if (input.path === "classic") {
    return buildClassicStory(
      input.name,
      getTrialClassic(input.classicId),
      lesson,
      companionLabel,
    );
  }

  return buildMomentStory(
    input.name,
    getTrialMoment(input.momentId),
    lesson,
    companionLabel,
  );
}

export function buildTrialPayload(input: TrialStoryInput): TrialStoryPayload {
  const resolved = resolveTrialDefaults(input);
  const companionIds = resolveCompanionIds(input);
  const companionNameById = resolveCompanionNameById(input);
  return {
    name: input.name,
    path: input.path,
    momentId: input.path === "moment" ? getTrialMoment(input.momentId).id : null,
    classicId:
      input.path === "classic" ? getTrialClassic(input.classicId).id : null,
    companionIds,
    companionNameById,
    companionNames: null,
    companionId: companionIds[0] ?? null,
    lessonId: resolved.lesson.id,
    markdown: buildTrialStoryMarkdown(input),
    createdAt: new Date().toISOString(),
    frameLabel: resolved.frameLabel,
    lessonLabel: resolved.lesson.label,
    companionLabel: resolved.companionLabel,
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
  window.sessionStorage.removeItem("chacachon.trialStory.v2");
}
