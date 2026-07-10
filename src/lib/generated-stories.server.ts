import "server-only";
import { randomUUID } from "node:crypto";
import type { RecipeSelectionPayload } from "@/lib/recipe-selection";
import type { GeneratedStoryDraft } from "@/lib/story-generation.server";

export type StoredGeneratedStory = {
  id: string;
  userId: string | null;
  title: string;
  bodyMarkdown: string;
  source: string;
  createdAt: Date;
};

export type SaveGeneratedStoryInput = GeneratedStoryDraft & {
  userId: string | null;
  recipe: RecipeSelectionPayload;
};

export type GeneratedStoryListItem = {
  id: string;
  title: string;
  source: string;
  createdAt: Date;
};

/**
 * Fallback en memoria para el demo cuando no hay DATABASE_URL (o la migración no
 * se aplicó aún). Se cuelga de `globalThis` para compartirse entre la route y la
 * página dentro del mismo proceso (en dev cada ruta es un módulo distinto). No
 * persiste entre reinicios ni entre instancias serverless.
 */
const globalForGenerated = globalThis as unknown as {
  generatedStories: Map<string, StoredGeneratedStory> | undefined;
};

const memoryStore =
  globalForGenerated.generatedStories ??
  (globalForGenerated.generatedStories = new Map<
    string,
    StoredGeneratedStory
  >());

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Solo el dueño puede leer cuentos con `userId`; anónimos legacy solo en dev. */
export function canReadGeneratedStory(
  story: StoredGeneratedStory,
  userId: string | null,
): boolean {
  if (!story.userId) return !isProduction();
  return Boolean(userId && story.userId === userId);
}

function saveToMemory(input: SaveGeneratedStoryInput): string {
  const id = randomUUID();
  memoryStore.set(id, {
    id,
    userId: input.userId,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    source: input.source,
    createdAt: new Date(),
  });
  return id;
}

export async function saveGeneratedStory(
  input: SaveGeneratedStoryInput,
): Promise<string> {
  if (!hasDatabase()) {
    if (isProduction()) {
      throw new Error("DATABASE_URL es obligatorio en producción.");
    }
    return saveToMemory(input);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.generatedStory.create({
      data: {
        userId: input.userId,
        title: input.title,
        bodyMarkdown: input.bodyMarkdown,
        recipe: input.recipe as unknown as object,
        source: input.source,
        model: input.model,
      },
      select: { id: true },
    });
    return row.id;
  } catch (error) {
    if (isProduction()) throw error;
    // Dev sin migración aplicada: fallback en memoria para no bloquear el demo local.
    console.error("[generated-stories] DB falló, uso memoria:", error);
    return saveToMemory(input);
  }
}

export async function getGeneratedStory(
  id: string,
): Promise<StoredGeneratedStory | null> {
  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.generatedStory.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          title: true,
          bodyMarkdown: true,
          source: true,
          createdAt: true,
        },
      });
      if (row) return row;
    } catch {
      // cae al store en memoria
    }
  }
  return memoryStore.get(id) ?? null;
}

export async function getGeneratedStoryForReader(
  id: string,
  userId: string | null,
): Promise<StoredGeneratedStory | null> {
  const story = await getGeneratedStory(id);
  if (!story) return null;
  if (!canReadGeneratedStory(story, userId)) return null;
  return story;
}

/** Lista los cuentos generados del usuario, más recientes primero. */
export async function listGeneratedStoriesForUser(
  userId: string,
): Promise<GeneratedStoryListItem[]> {
  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      return prisma.generatedStory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, source: true, createdAt: true },
      });
    } catch {
      // cae al store en memoria (dev sin migración)
    }
  }

  return [...memoryStore.values()]
    .filter((story) => story.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ id, title, source, createdAt }) => ({
      id,
      title,
      source,
      createdAt,
    }));
}
