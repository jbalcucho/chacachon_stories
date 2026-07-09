import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

export type ProfileCompletion = {
  percent: number;
  hint: string;
};

type CompletionCheck = {
  weight: number;
  hint: string;
  optional?: boolean;
  done: (perfil: FamilyProfileDocument) => boolean;
};

const CHECKS: CompletionCheck[] = [
  {
    weight: 20,
    hint: "Agrega al menos un niño",
    done: (p) => p.ninos.some((n) => n.nombre.trim().length > 0),
  },
  {
    weight: 20,
    hint: "Agrega un adulto (mamá, papá…)",
    done: (p) => p.adultos.some((a) => a.nombre.trim().length > 0),
  },
  {
    weight: 15,
    hint: "Cuéntanos tu ciudad o barrio",
    done: (p) =>
      Boolean(p.meta?.ciudad?.trim() || p.meta?.barrio?.trim()),
  },
  {
    weight: 15,
    hint: "¿Cómo le dicen a tu casa?",
    done: (p) =>
      Boolean(
        p.meta?.como_le_dicen_al_hogar?.trim() ||
          p.meta?.apellido_hogar?.trim(),
      ),
  },
  {
    weight: 15,
    hint: "Agrega una frase típica de la familia",
    done: (p) => {
      const people = [...p.adultos, ...p.ninos];
      return people.some((person) => (person.frases_tipicas?.length ?? 0) > 0);
    },
  },
  {
    weight: 15,
    hint: "Opcional: agrega tu mascota",
    optional: true,
    done: (p) => (p.mascotas?.length ?? 0) > 0,
  },
];

export function computeFamilyProfileCompletion(
  perfil: FamilyProfileDocument | null | undefined,
): ProfileCompletion {
  if (!perfil) {
    return { percent: 0, hint: "Agrega tu familia para empezar" };
  }

  let percent = 0;
  let firstMissing: string | null = null;
  let onlyOptionalMissing = true;

  for (const check of CHECKS) {
    if (check.done(perfil)) {
      percent += check.weight;
    } else if (!firstMissing) {
      firstMissing = check.hint;
    }
    if (!check.done(perfil) && !check.optional) {
      onlyOptionalMissing = false;
    }
  }

  if (percent >= 100) {
    return { percent: 100, hint: "Perfil listo" };
  }

  if (onlyOptionalMissing && firstMissing?.startsWith("Opcional")) {
    return { percent, hint: firstMissing };
  }

  return {
    percent,
    hint: firstMissing ?? "Completa tu perfil familiar",
  };
}

export function buildCrearPreviews(
  perfil: FamilyProfileDocument | null | undefined,
): Record<"vida" | "tradicional" | "perfil", string> {
  const apellido = perfil?.meta?.apellido_hogar?.trim() || "García";
  const nino = perfil?.ninos?.[0]?.nombre?.trim() || "Mateo";
  const hogar = perfil?.meta?.como_le_dicen_al_hogar?.trim() || "tu casa";

  return {
    vida: `Ejemplo: Una noche en la casa de los ${apellido}, cuando ${nino} no quiso apagar la tablet…`,
    tradicional: `Ejemplo: Los tres cerditos de la familia ${apellido}`,
    perfil: `Ejemplo: Los cuentos suenan a ${hogar}, con sus nombres y frases.`,
  };
}
