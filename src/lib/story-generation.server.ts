import "server-only";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import { parseStoryHeader } from "@/lib/story-markdown";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import { buildStoryPrompt } from "@/lib/story-prompt";

export type StoryGenerationContext = {
  selection: RecipeSelectionSlice;
  perfil?: FamilyProfileDocument | null;
};

export type StorySource = "gemini" | "claude" | "mock";

export type GeneratedStoryDraft = {
  title: string;
  bodyMarkdown: string;
  source: StorySource;
  model: string | null;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet-latest";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_TOKENS = 1600;

function titleFromMarkdown(markdown: string, fallback: string): string {
  const parsed = parseStoryHeader(markdown);
  return parsed.title && parsed.title !== "Cuento" ? parsed.title : fallback;
}

function anthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || ANTHROPIC_DEFAULT_MODEL;
}

function geminiModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ];
  return [...new Set([configured, ...defaults].filter(Boolean) as string[])];
}

async function callClaude(
  ctx: StoryGenerationContext,
  apiKey: string,
): Promise<string> {
  const { system, user } = buildStoryPrompt({
    selection: ctx.selection,
    perfil: ctx.perfil,
  });

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: anthropicModel(),
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  if (!text) throw new Error("Anthropic devolvió una respuesta vacía.");
  return text;
}

async function callGeminiModel(
  ctx: StoryGenerationContext,
  apiKey: string,
  model: string,
): Promise<string> {
  const { system, user } = buildStoryPrompt({
    selection: ctx.selection,
    perfil: ctx.perfil,
  });
  const url = `${GEMINI_BASE_URL}/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.9 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Gemini ${model} ${res.status}: ${detail.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error(`Gemini ${model} devolvió una respuesta vacía.`);
  return text;
}

async function callGemini(
  ctx: StoryGenerationContext,
  apiKey: string,
): Promise<{ markdown: string; model: string }> {
  const candidates = geminiModelCandidates();
  let lastError: Error | null = null;

  for (const model of candidates) {
    try {
      const markdown = await callGeminiModel(ctx, apiKey, model);
      return { markdown, model };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error("[story-generation]", lastError.message);
    }
  }

  throw lastError ?? new Error("Gemini: ningún modelo respondió.");
}

/**
 * Genera un cuento a partir de la receta. Orden de proveedores:
 *   1. Gemini   (GEMINI_API_KEY)   — tiene capa gratuita, ideal para el demo.
 *   2. Claude   (ANTHROPIC_API_KEY)
 *   3. Plantilla local (mock)      — sin ninguna key.
 * Si el proveedor elegido falla, se cae a la plantilla para no romper el flujo.
 */
export async function generateStory(
  ctx: StoryGenerationContext,
): Promise<GeneratedStoryDraft> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const fallbackTitle = "Un cuento de Chacachón";

  if (geminiKey) {
    try {
      const { markdown, model } = await callGemini(ctx, geminiKey);
      return {
        title: titleFromMarkdown(markdown, fallbackTitle),
        bodyMarkdown: markdown,
        source: "gemini",
        model,
      };
    } catch (error) {
      console.error("[story-generation] Gemini falló:", error);
    }
  }

  if (anthropicKey) {
    try {
      const markdown = await callClaude(ctx, anthropicKey);
      return {
        title: titleFromMarkdown(markdown, fallbackTitle),
        bodyMarkdown: markdown,
        source: "claude",
        model: anthropicModel(),
      };
    } catch (error) {
      console.error("[story-generation] Claude falló:", error);
    }
  }

  const markdown = buildMockStoryMarkdown(ctx.selection);
  return {
    title: titleFromMarkdown(markdown, fallbackTitle),
    bodyMarkdown: markdown,
    source: "mock",
    model: null,
  };
}
