/**
 * Plantillas clásicas → pre-llenado del wizard (`?plantilla=slug`).
 * Ver docs/crear-flow.md (B4).
 *
 * Vacío a propósito mientras no hay demos publicados en el estante.
 * Al publicar un cuento demo nuevo, añadir aquí el prefill correspondiente.
 */

export type PlantillaPrefill = {
  slug: string;
  /** Molde clásico del wizard (opcional: cuentos propios solo traen dilema). */
  moldeId: string | null;
  dilemaId: string | null;
  /** Título corto para badges / empty states. */
  label: string;
};

/** Solo clásicos van en `/crear/plantillas`. */
export const CLASSIC_PLANTILLAS: readonly PlantillaPrefill[] = [];

/**
 * Prefills extra (cuentos propios Chacachón).
 * No aparecen en el listado de plantillas tradicionales, pero
 * `?plantilla=slug` sigue funcionando si alguien llega con el enlace.
 */
const OWN_STORY_PREFILLS: readonly PlantillaPrefill[] = [];

const ALL_BY_SLUG = new Map<string, PlantillaPrefill>(
  [...CLASSIC_PLANTILLAS, ...OWN_STORY_PREFILLS].map((p) => [p.slug, p]),
);

export function getPlantillaPrefill(slug: string): PlantillaPrefill | null {
  return ALL_BY_SLUG.get(slug) ?? null;
}

export function isClassicPlantillaSlug(slug: string): boolean {
  return CLASSIC_PLANTILLAS.some((p) => p.slug === slug);
}

export function plantillaSlugToMoldeId(slug: string): string | null {
  return getPlantillaPrefill(slug)?.moldeId ?? null;
}

export function plantillaSlugToDilemaId(slug: string): string | null {
  return getPlantillaPrefill(slug)?.dilemaId ?? null;
}

export function hasPlantillaMolde(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return Boolean(getPlantillaPrefill(slug)?.moldeId);
}

/** Ruta del wizard con plantilla preseleccionada. */
export function plantillaAdaptarHref(slug: string): string {
  return `/crear/adaptar?plantilla=${encodeURIComponent(slug)}`;
}
