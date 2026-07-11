import {
  adultRoleSchema,
  newEntityId,
  type FamilyProfileDocument,
} from "@/lib/family-profile-schema";
import type { z } from "zod";

export type AdultRole = z.infer<typeof adultRoleSchema>;

export type FamilyMemberKind = "nino" | "adulto" | "mascota";

export type ChildTraitId =
  | "pantallas"
  | "dormir"
  | "colegio"
  | "comida"
  | "juegos";

export type FamilyChildDraft = {
  id: string;
  kind: "nino";
  nombre: string;
  apodo: string;
  orden: number;
  traits: ChildTraitId[];
};

export type FamilyAdultDraft = {
  id: string;
  kind: "adulto";
  nombre: string;
  apodo: string;
  rol: AdultRole;
  frase: string;
};

export type FamilyPetDraft = {
  id: string;
  kind: "mascota";
  nombre: string;
  personalidad: string;
};

export type FamilyMemberDraft =
  | FamilyChildDraft
  | FamilyAdultDraft
  | FamilyPetDraft;

export type FamilyHomeDraft = {
  ciudad: string;
  hogar: string;
  apellido: string;
};

export type FamilyBuilderState = {
  home: FamilyHomeDraft;
  ninos: FamilyChildDraft[];
  adultos: FamilyAdultDraft[];
  mascotas: FamilyPetDraft[];
};

export const HOME_LABEL_CHIPS = [
  "el apartamento",
  "la casa",
  "la finca",
  "el piso",
] as const;

export const CHILD_TRAIT_OPTIONS: {
  id: ChildTraitId;
  label: string;
  hint: string;
}[] = [
  {
    id: "pantallas",
    label: "Le cuestan las pantallas",
    hint: "Tablet / YouTube / juegos",
  },
  {
    id: "dormir",
    label: "No quiere dormir",
    hint: "Rutina de noche",
  },
  {
    id: "colegio",
    label: "Colegio / rutina",
    hint: "Mañanas, uniforme, tarea",
  },
  {
    id: "comida",
    label: "Quisquilloso con la comida",
    hint: "Verduras, mesa…",
  },
  {
    id: "juegos",
    label: "Le encanta jugar",
    hint: "Legos, parque, inventos",
  },
];

export const ADULT_ROLE_OPTIONS: { id: AdultRole; label: string }[] = [
  { id: "mama", label: "Mamá" },
  { id: "papa", label: "Papá" },
  { id: "cuidador", label: "Cuidador/a" },
  { id: "madrastra", label: "Madrastra" },
  { id: "padrastro", label: "Padrastro" },
  { id: "otro", label: "Otro adulto" },
];

export const FAMILY_WIZARD_STEPS = [
  { id: "ninos", title: "Niños", hint: "¿Para quién es el cuento?" },
  { id: "adultos", title: "Adultos", hint: "¿Quiénes viven en casa?" },
  { id: "hogar", title: "Hogar", hint: "¿Cómo le dicen a casa?" },
  { id: "sabor", title: "Sabor", hint: "Mascotas, frases y detalles" },
  { id: "listo", title: "Listo", hint: "Guarda y crea un cuento" },
] as const;

export type FamilyWizardStepId = (typeof FAMILY_WIZARD_STEPS)[number]["id"];

export function emptyFamilyBuilderState(): FamilyBuilderState {
  return {
    home: { ciudad: "", hogar: "el apartamento", apellido: "" },
    ninos: [],
    adultos: [],
    mascotas: [],
  };
}

export function createChildDraft(
  partial?: Partial<FamilyChildDraft>,
): FamilyChildDraft {
  return {
    id: partial?.id ?? newEntityId("nino"),
    kind: "nino",
    nombre: partial?.nombre ?? "",
    apodo: partial?.apodo ?? "",
    orden: partial?.orden ?? 1,
    traits: partial?.traits ?? [],
  };
}

export function createAdultDraft(
  partial?: Partial<FamilyAdultDraft>,
): FamilyAdultDraft {
  return {
    id: partial?.id ?? newEntityId("adulto"),
    kind: "adulto",
    nombre: partial?.nombre ?? "",
    apodo: partial?.apodo ?? "",
    rol: partial?.rol ?? "mama",
    frase: partial?.frase ?? "",
  };
}

export function createPetDraft(
  partial?: Partial<FamilyPetDraft>,
): FamilyPetDraft {
  return {
    id: partial?.id ?? newEntityId("mascota"),
    kind: "mascota",
    nombre: partial?.nombre ?? "",
    personalidad: partial?.personalidad ?? "",
  };
}

function traitsFromChildDoc(
  child: NonNullable<FamilyProfileDocument["ninos"]>[number],
): ChildTraitId[] {
  const traits: ChildTraitId[] = [];
  if (child.pantallas?.le_cuesta_soltar) traits.push("pantallas");
  if (child.no_le_gusta?.dormir) traits.push("dormir");
  if (child.no_le_gusta?.comida?.length) traits.push("comida");
  if (child.gustos?.juegos?.length) traits.push("juegos");
  if (
    typeof child.extra === "object" &&
    child.extra &&
    Array.isArray((child.extra as { traits?: unknown }).traits)
  ) {
    for (const t of (child.extra as { traits: string[] }).traits) {
      if (
        t === "pantallas" ||
        t === "dormir" ||
        t === "colegio" ||
        t === "comida" ||
        t === "juegos"
      ) {
        if (!traits.includes(t)) traits.push(t);
      }
    }
  } else if (
    typeof child.extra === "object" &&
    child.extra &&
    (child.extra as { colegio?: boolean }).colegio
  ) {
    traits.push("colegio");
  }
  return traits;
}

export function familyBuilderFromDocument(
  doc: FamilyProfileDocument | null | undefined,
): FamilyBuilderState {
  if (!doc) return emptyFamilyBuilderState();

  const ninos = [...(doc.ninos ?? [])]
    .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
    .map((n, index) =>
      createChildDraft({
        id: n.id,
        nombre: n.nombre,
        apodo: n.apodo ?? "",
        orden: n.orden ?? index + 1,
        traits: traitsFromChildDoc(n),
      }),
    );

  const adultos = (doc.adultos ?? []).map((a) =>
    createAdultDraft({
      id: a.id,
      nombre: a.nombre,
      apodo: a.apodo ?? "",
      rol: a.rol,
      frase: a.frases_tipicas?.[0] ?? "",
    }),
  );

  const mascotas = (doc.mascotas ?? []).map((m) =>
    createPetDraft({
      id: m.id,
      nombre: m.nombre,
      personalidad: m.personalidad ?? "",
    }),
  );

  return {
    home: {
      ciudad: doc.meta?.ciudad ?? "",
      hogar: doc.meta?.como_le_dicen_al_hogar ?? "el apartamento",
      apellido: doc.meta?.apellido_hogar ?? "",
    },
    ninos,
    adultos,
    mascotas,
  };
}

function applyChildTraits(child: FamilyChildDraft) {
  const traits = new Set(child.traits);
  return {
    pantallas: traits.has("pantallas")
      ? { le_cuesta_soltar: true }
      : undefined,
    no_le_gusta:
      traits.has("dormir") || traits.has("comida")
        ? {
            dormir: traits.has("dormir") ? "le cuesta ir a dormir" : undefined,
            comida: traits.has("comida") ? ["verduras"] : undefined,
          }
        : undefined,
    gustos: traits.has("juegos")
      ? { juegos: ["jugar en casa"] }
      : undefined,
    extra: {
      traits: child.traits,
      colegio: traits.has("colegio") ? true : undefined,
    },
  };
}

export function familyBuilderToDocument(
  state: FamilyBuilderState,
): FamilyProfileDocument {
  const ninos = state.ninos
    .filter((n) => n.nombre.trim())
    .map((n, index) => {
      const traitFields = applyChildTraits(n);
      return {
        id: n.id,
        nombre: n.nombre.trim(),
        apodo: n.apodo.trim() || undefined,
        orden: index + 1,
        ...traitFields,
      };
    });

  const adultos = state.adultos
    .filter((a) => a.nombre.trim())
    .map((a) => ({
      id: a.id,
      rol: a.rol,
      nombre: a.nombre.trim(),
      apodo: a.apodo.trim() || undefined,
      frases_tipicas: a.frase.trim() ? [a.frase.trim()] : undefined,
    }));

  const mascotas = state.mascotas
    .filter((m) => m.nombre.trim())
    .map((m) => ({
      id: m.id,
      nombre: m.nombre.trim(),
      personalidad: m.personalidad.trim() || undefined,
    }));

  return {
    meta: {
      ciudad: state.home.ciudad.trim() || undefined,
      apellido_hogar: state.home.apellido.trim() || undefined,
      como_le_dicen_al_hogar: state.home.hogar.trim() || undefined,
      codigo_acento: "neutro",
    },
    adultos,
    ninos,
    mascotas: mascotas.length > 0 ? mascotas : undefined,
  };
}

export function displayName(member: {
  nombre: string;
  apodo?: string;
}): string {
  return (member.apodo ?? "").trim() || member.nombre.trim() || "Sin nombre";
}

export function adultRoleLabel(rol: AdultRole): string {
  return ADULT_ROLE_OPTIONS.find((o) => o.id === rol)?.label ?? rol;
}

/** Una línea viva: prueba de valor del perfil. */
export function buildFamilyPreviewSentence(state: FamilyBuilderState): string {
  const hogar = state.home.hogar.trim() || "casa";
  const kids = state.ninos
    .filter((n) => n.nombre.trim() || n.apodo.trim())
    .map(displayName);
  const adults = state.adultos
    .filter((a) => a.nombre.trim() || a.apodo.trim())
    .map(displayName);
  const pets = state.mascotas
    .filter((m) => m.nombre.trim())
    .map((m) => m.nombre.trim());

  const people = [...kids, ...adults];
  if (people.length === 0 && pets.length === 0) {
    return "Aún no hay nadie en casa. Añade a tu familia para personalizar los cuentos.";
  }

  const peoplePart =
    people.length === 1
      ? people[0]
      : people.length === 2
        ? `${people[0]} y ${people[1]}`
        : `${people.slice(0, -1).join(", ")} y ${people[people.length - 1]}`;

  let sentence = `En ${hogar} viven ${peoplePart}`;
  if (pets.length === 1) sentence += `, con ${pets[0]}`;
  else if (pets.length > 1)
    sentence += `, con ${pets.slice(0, -1).join(", ")} y ${pets[pets.length - 1]}`;
  sentence += ".";

  if (state.home.ciudad.trim()) {
    sentence += ` Ciudad: ${state.home.ciudad.trim()}.`;
  }

  return sentence;
}

export type FamilyReadiness = {
  ready: boolean;
  missing: string[];
  completeness: number;
};

export function assessFamilyReadiness(
  state: FamilyBuilderState,
): FamilyReadiness {
  const missing: string[] = [];
  const kidsOk = state.ninos.some((n) => n.nombre.trim());
  const adultsOk = state.adultos.some((a) => a.nombre.trim());

  if (!kidsOk) missing.push("Al menos un niño con nombre");
  if (!adultsOk) missing.push("Al menos un adulto con nombre");

  let score = 0;
  if (kidsOk) score += 35;
  if (adultsOk) score += 35;
  if (state.home.hogar.trim()) score += 10;
  if (state.home.ciudad.trim()) score += 5;
  if (state.mascotas.some((m) => m.nombre.trim())) score += 5;
  if (state.adultos.some((a) => a.frase.trim())) score += 5;
  if (state.ninos.some((n) => n.traits.length > 0)) score += 5;

  return {
    ready: missing.length === 0,
    missing,
    completeness: Math.min(100, score),
  };
}

export function reorderChildren(
  ninos: FamilyChildDraft[],
  fromId: string,
  toId: string,
): FamilyChildDraft[] {
  const from = ninos.findIndex((n) => n.id === fromId);
  const to = ninos.findIndex((n) => n.id === toId);
  if (from < 0 || to < 0 || from === to) return ninos;
  const next = [...ninos];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((n, index) => ({ ...n, orden: index + 1 }));
}

export function moveChild(ninos: FamilyChildDraft[], id: string, dir: -1 | 1) {
  const index = ninos.findIndex((n) => n.id === id);
  if (index < 0) return ninos;
  const target = index + dir;
  if (target < 0 || target >= ninos.length) return ninos;
  return reorderChildren(ninos, id, ninos[target].id);
}
