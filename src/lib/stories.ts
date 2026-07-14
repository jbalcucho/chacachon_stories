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
    slug: "valentina-el-valle-de-los-susurros",
    title: "Valentina y la linterna del Valle de los Susurros",
    description: "Una noche para encontrar el camino de vuelta a casa",
    moraleja: "calma",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "samuel-el-sendero-de-las-luciernagas",
    title: "Samuel y el Sendero de las Luciérnagas",
    description: "El farolero de los destellos en la finca",
    moraleja: "valentía",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "isabella-el-valle-de-los-ecos",
    title: "El Valle de los Ecos Perdidos",
    description: "Un reino donde las miradas se quedan atrapadas",
    moraleja: "respeto",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "tomas-el-espejo-de-los-ecos",
    title: "Tomás y el Espejo de los Ecos",
    description: "Un farol necesita manos amigas, no luces de bolsillo",
    moraleja: "paciencia",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "manuela-el-banquete-del-valle-colorido",
    title: "El banquete del Valle Colorido",
    description: "Una aventura llena de sabores mágicos",
    moraleja: "alegría",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "andres-el-reino-de-las-hortalizas",
    title: "El Reino de las Hortalizas Gigantes",
    description: "La misión de Andrés en la huerta del abuelo",
    moraleja: "honestidad",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "camila-el-valle-de-los-bolos-saltarines",
    title: "El Valle de los Bolos Saltarines",
    description: "Un tesoro que solo brilla cuando se reparte",
    moraleja: "generosidad",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "emiliano-el-guardian-de-la-ciudad-zigzag",
    title: "El Guardián de la Ciudad Zigzag",
    description: "Donde las piezas encajan mejor cuando se prestan",
    moraleja: "respeto",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "luciana-el-reino-de-las-piezas-perdidas",
    title: "El Reino de las Piezas Perdidas",
    description: "Un mundo donde cada ladrillo es un tesoro",
    moraleja: "responsabilidad",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "joaquin-el-rincon-oscuro",
    title: "El Caballero de la Linterna Reluciente",
    description: "Un viaje al Reino del Rincón Oscuro",
    moraleja: "valentía",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "cerditos-la-torre-bien-hecha",
    title: "La Fortaleza de los Mil Bloques",
    description: "Donde cada pieza tiene su lugar bajo el sol",
    moraleja: "responsabilidad",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "caperucita-el-camino-del-mandado",
    title: "El secreto de la Sopa de Estrellas",
    description: "Una travesía por el Bosque del Rumor",
    moraleja: "respeto",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "ricitos-las-cosas-prestadas",
    title: "La Vereda de las Mil Delicias",
    description: "Un festín para los que saben pedir permiso",
    moraleja: "respeto",
    familyTag: "chacachon",
    htmlPath: null,
    variant: "NARRATIVE",
    status: "PUBLISHED",
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

export function isReadableLibraryStory(story: StoryCard): boolean {
  return story.status === "PUBLISHED" && Boolean(story.openPath);
}

function filterReadableLibraryStories(stories: StoryCard[]): StoryCard[] {
  return stories.filter(isReadableLibraryStory);
}

async function fetchLibraryStoriesFromDb(): Promise<StoryCard[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.story.findMany({
    where: { familyTag: "chacachon", status: "PUBLISHED" },
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
      return filterReadableLibraryStories(
        STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon"),
      );
    }
    try {
      return filterReadableLibraryStories(await fetchLibraryStoriesFromDb());
    } catch {
      return filterReadableLibraryStories(
        STORY_CATALOG_FALLBACK.filter((s) => s.familyTag === "chacachon"),
      );
    }
  },
  ["library-stories-v2-readable"],
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
