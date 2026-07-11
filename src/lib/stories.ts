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
const STORY_CATALOG_SEEDS: Omit<StoryCard, "openPath">[] = [];

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
