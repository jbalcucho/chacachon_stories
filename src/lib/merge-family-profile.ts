import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

/** Fusiona capa editable sobre perfil existente sin perder cercanos/casa/extra. */
export function mergeFamilyProfile(
  existing: FamilyProfileDocument | null | undefined,
  incoming: FamilyProfileDocument,
): FamilyProfileDocument {
  if (!existing) return incoming;

  return {
    ...existing,
    meta: { ...existing.meta, ...incoming.meta },
    adultos: incoming.adultos,
    ninos: incoming.ninos,
    mascotas: incoming.mascotas ?? existing.mascotas,
    cercanos: existing.cercanos,
    casa: existing.casa,
    extra: mergeExtra(existing.extra, incoming.extra),
  };
}

function mergeExtra(
  existing: FamilyProfileDocument["extra"],
  incoming: FamilyProfileDocument["extra"],
): FamilyProfileDocument["extra"] {
  if (!existing && !incoming) return undefined;
  const base = (existing ?? {}) as Record<string, unknown>;
  const patch = (incoming ?? {}) as Record<string, unknown>;
  const colegio = {
    ...(base.colegio as Record<string, unknown> | undefined),
    ...(patch.colegio as Record<string, unknown> | undefined),
  };
  return { ...base, ...patch, colegio };
}
