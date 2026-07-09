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
  if (!hasDatabase()) return saveToMemory(input);

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
    // p.ej. migración aún no aplicada: no rompas el demo, guarda en memoria.
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
