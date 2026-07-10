import { describeRecipe } from "@/lib/story-prompt";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import { parseBodyBlocks, parseStoryHeader } from "@/lib/story-markdown";

/** Ingredientes que recibirá la IA, en lenguaje legible para padres. */
export function buildRecipePreviewBullets(
  selection: RecipeSelectionSlice,
): string[] {
  return describeRecipe(selection);
}

/**
 * Primeros párrafos de un cuento de ejemplo (plantilla local, sin llamar a la IA).
 * Sirve para que el adulto imagine el tono antes de confirmar.
 */
export function buildRecipePreviewExcerpt(
  selection: RecipeSelectionSlice,
  maxParagraphs = 2,
): string[] {
  const markdown = buildMockStoryMarkdown(selection);
  const { body } = parseStoryHeader(markdown);
  const blocks = parseBodyBlocks(body);
  const paragraphs: string[] = [];

  for (const block of blocks) {
    if (block.type !== "paragraph") continue;
    const text = block.text.trim();
    if (!text || /^Y colorín colorado/i.test(text)) continue;
    paragraphs.push(text);
    if (paragraphs.length >= maxParagraphs) break;
  }

  return paragraphs;
}
