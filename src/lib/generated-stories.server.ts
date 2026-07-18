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
  hiddenAt: Date | null;
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
  hiddenAt: Date | null;
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
    hiddenAt: null,
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
          hiddenAt: true,
        },
      });
      if (row) return row;
    } catch {
      // cae al store en memoria
    }
  }
  return memoryStore.get(id) ?? null;
}

/** Dueño único que puede editar/ocultar/borrar -- null (legacy/anon) nunca califica. */
function assertOwnedByUser(
  story: StoredGeneratedStory | null,
  userId: string,
): story is StoredGeneratedStory {
  return Boolean(story) && story!.userId === userId;
}

export type UpdateGeneratedStoryInput = {
  title?: string;
  bodyMarkdown?: string;
};

/** El dueño edita el texto de su propio cuento (ver docs/plan-trabajo-chacachon.md). */
export async function updateGeneratedStory(
  id: string,
  userId: string,
  input: UpdateGeneratedStoryInput,
): Promise<boolean> {
  const data: Record<string, string> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.bodyMarkdown !== undefined) data.bodyMarkdown = input.bodyMarkdown;
  if (Object.keys(data).length === 0) return true;

  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const result = await prisma.generatedStory.updateMany({
        where: { id, userId },
        data,
      });
      return result.count > 0;
    } catch (error) {
      if (isProduction()) throw error;
    }
  }

  const story = memoryStore.get(id) ?? null;
  if (!assertOwnedByUser(story, userId)) return false;
  memoryStore.set(id, { ...story, ...input });
  return true;
}

/** Ocultar/reactivar sin borrar -- reversible por el dueño en cualquier momento. */
export async function setGeneratedStoryHidden(
  id: string,
  userId: string,
  hidden: boolean,
): Promise<boolean> {
  const hiddenAt = hidden ? new Date() : null;

  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const result = await prisma.generatedStory.updateMany({
        where: { id, userId },
        data: { hiddenAt },
      });
      return result.count > 0;
    } catch (error) {
      if (isProduction()) throw error;
    }
  }

  const story = memoryStore.get(id) ?? null;
  if (!assertOwnedByUser(story, userId)) return false;
  memoryStore.set(id, { ...story, hiddenAt });
  return true;
}

/** Borrado definitivo -- el dueño confirma explícitamente en la UI (no hay deshacer). */
export async function deleteGeneratedStory(
  id: string,
  userId: string,
): Promise<boolean> {
  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const result = await prisma.generatedStory.deleteMany({
        where: { id, userId },
      });
      return result.count > 0;
    } catch (error) {
      if (isProduction()) throw error;
    }
  }

  const story = memoryStore.get(id) ?? null;
  if (!assertOwnedByUser(story, userId)) return false;
  memoryStore.delete(id);
  return true;
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
        select: {
          id: true,
          title: true,
          source: true,
          createdAt: true,
          hiddenAt: true,
        },
      });
    } catch {
      // cae al store en memoria (dev sin migración)
    }
  }

  return [...memoryStore.values()]
    .filter((story) => story.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ id, title, source, createdAt, hiddenAt }) => ({
      id,
      title,
      source,
      createdAt,
      hiddenAt,
    }));
}
