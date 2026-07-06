import type { StoryStatus, StoryVariant } from "@prisma/client";

export type StoryCard = {
  slug: string;
  title: string;
  description: string | null;
  moraleja: string | null;
  familyTag: string | null;
  htmlPath: string | null;
  variant: StoryVariant;
  status: StoryStatus;
};

/** Fallback when DATABASE_URL is not configured (local preview, CI build). */
export const STORY_CATALOG_FALLBACK: StoryCard[] = [
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
    htmlPath: null,
    variant: "APARTMENT",
    status: "DRAFT",
  },
];

export async function getPublishedStories(): Promise<StoryCard[]> {
  if (!process.env.DATABASE_URL) {
    return STORY_CATALOG_FALLBACK.filter((s) => s.status === "PUBLISHED");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.story.findMany({
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
  } catch {
    return STORY_CATALOG_FALLBACK.filter((s) => s.status === "PUBLISHED");
  }
}

export async function getLibraryStories(): Promise<StoryCard[]> {
  if (!process.env.DATABASE_URL) {
    return STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.story.findMany({
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
  } catch {
    return STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon");
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
