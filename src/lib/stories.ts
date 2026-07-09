import type { StoryStatus, StoryVariant } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { withOpenPaths } from "@/lib/story-content-index";

export type StoryCard = {
  slug: string;
  title: string;
  description: string | null;
  moraleja: string | null;
  familyTag: string | null;
  htmlPath: string | null;
  openPath: string | null;
  variant: StoryVariant;
  status: StoryStatus;
};

/** Fallback when DATABASE_URL is not configured (local preview, CI build). */
const STORY_CATALOG_SEEDS: Omit<StoryCard, "openPath">[] = [
  {
    slug: "el-lobo-y-las-palabras",
    title: "El lobo de las palabras feas",
    description:
      "Vereda, bosque de eucaliptos y tres casitas. Bingo es el lobo, Betty la abuelita.",
    moraleja: "Cuidar las palabras y no contestarle feo a mamá y papá.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-el-lobo-y-las-palabras.html",
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "cerditos-del-edificio",
    title: "Los Tres Cerditos del Edificio",
    description:
      "Ascensor, mismo piso que la abuelita Betty, y Bingo en el pasillo.",
    moraleja:
      "Las palabras feas alimentan al lobo; el respeto protege la casa.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-cerditos-caperucita.html",
    variant: "APARTMENT",
    status: "PUBLISHED",
  },
  {
    slug: "operacion-a-dormir",
    title: "Operación A Dormir",
    description:
      "Nico, Simónchin, Josefina la aspiradora y la batalla nocturna del apartamento.",
    moraleja: "La rutina de noche: tablet, chanclas, chichi y la lista de Pauleta.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-operacion-a-dormir.html",
    variant: "APARTMENT",
    status: "PUBLISHED",
  },
  {
    slug: "el-ascensor-de-las-sorpresas",
    title: "El ascensor de las sorpresas",
    description:
      "Piso 11, botón equivocado y un viaje inesperado con Betty y Bingo.",
    moraleja: "En el edificio también se aprende a esperar con paciencia.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "APARTMENT",
    status: "DRAFT",
  },
  {
    slug: "pauleta-y-el-tren-del-bosque",
    title: "Pauleta y el tren del bosque",
    description:
      "De la vereda al bosque de eucaliptos en un tren de fantasía rolo.",
    moraleja: "La imaginación abre caminos cuando el camino se pone largo.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "DRAFT",
  },
  {
    slug: "mision-mercado-paloquemao",
    title: "Misión en Paloquemao",
    description:
      "Lista de compras, frutas de colores y un desafío entre pasillos.",
    moraleja: "Ayudar en casa también puede ser una aventura en familia.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "DRAFT",
  },
  {
    slug: "nico-dia-sin-pantallas",
    title: "El día sin pantallas de Nico",
    description:
      "Un domingo en Chapinero sin tablet: Legos, charcos, columpios y una familia que se mira de verdad.",
    moraleja:
      "Desconectarse un rato deja espacio para jugar juntos… y para verse de verdad.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-nico-dia-sin-pantallas.html",
    variant: "APARTMENT",
    status: "PUBLISHED",
  },
  {
    slug: "chacachon-en-la-luna",
    title: "Chacachón en la luna",
    description:
      "Cuento piloto: la familia imagina un viaje nocturno más allá de Bogotá.",
    moraleja: "Soñar en voz alta también es leer un cuento.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "PILOT",
    status: "DRAFT",
  },
];

export const STORY_CATALOG_FALLBACK: StoryCard[] = withOpenPaths(
  STORY_CATALOG_SEEDS.map((story) => ({ ...story, openPath: null })),
);

function attachOpenPaths(
  rows: Omit<StoryCard, "openPath">[],
): StoryCard[] {
  return withOpenPaths(rows.map((story) => ({ ...story, openPath: null })));
}

export async function getPublishedStories(): Promise<StoryCard[]> {
  if (!process.env.DATABASE_URL) {
    return STORY_CATALOG_FALLBACK.filter((s) => s.status === "PUBLISHED");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.story.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        title: true,
        description: true,
        moraleja: true,
        familyTag: true,
        htmlPath: true,
        variant: true,
        status: true,
      },
    });
    return attachOpenPaths(rows);
  } catch {
    return STORY_CATALOG_FALLBACK.filter((s) => s.status === "PUBLISHED");
  }
}

async function fetchLibraryStoriesFromDb(): Promise<StoryCard[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.story.findMany({
    where: { familyTag: "chacachon" },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      moraleja: true,
      familyTag: true,
      htmlPath: true,
      variant: true,
      status: true,
    },
  });
  return attachOpenPaths(rows);
}

const getCachedLibraryStories = unstable_cache(
  async () => {
    if (!process.env.DATABASE_URL) {
      return STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon");
    }
    try {
      return await fetchLibraryStoriesFromDb();
    } catch {
      return STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon");
    }
  },
  ["library-stories-v1"],
  { revalidate: 300, tags: ["library-stories"] },
);

export async function getLibraryStories(): Promise<StoryCard[]> {
  return getCachedLibraryStories();
}

/** Catálogo completo (todos los estados) para vistas administrativas. */
export async function getAllStoriesForAdmin(): Promise<StoryCard[]> {
  if (!process.env.DATABASE_URL) {
    return STORY_CATALOG_FALLBACK;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.story.findMany({
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
      select: {
        slug: true,
        title: true,
        description: true,
        moraleja: true,
        familyTag: true,
        htmlPath: true,
        variant: true,
        status: true,
      },
    });
    return attachOpenPaths(rows);
  } catch {
    return STORY_CATALOG_FALLBACK;
  }
}

export function statusLabel(status: StoryStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "Publicado";
    case "DRAFT":
      return "En preparación";
    default:
      return status;
  }
}

export function variantLabel(variant: StoryVariant): string {
  switch (variant) {
    case "NARRATIVE":
      return "Narrativo";
    case "APARTMENT":
      return "Apartamento";
    case "PILOT":
      return "Piloto";
    default:
      return variant;
  }
}

export async function getPublishedStoryBySlug(
  slug: string,
): Promise<StoryCard | null> {
  if (!process.env.DATABASE_URL) {
    const story = STORY_CATALOG_FALLBACK.find((s) => s.slug === slug);
    return story?.status === "PUBLISHED" ? story : null;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const story = await prisma.story.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        moraleja: true,
        familyTag: true,
        htmlPath: true,
        variant: true,
        status: true,
      },
    });
    return story?.status === "PUBLISHED"
      ? attachOpenPaths([story])[0] ?? null
      : null;
  } catch {
    const story = STORY_CATALOG_FALLBACK.find((s) => s.slug === slug);
    return story?.status === "PUBLISHED" ? story : null;
  }
}
