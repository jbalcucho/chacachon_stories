import "server-only";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import type { LlmUsage } from "@/lib/generation-telemetry";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import { parseStoryHeader, sanitizeFairyTaleBookends } from "@/lib/story-markdown";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import { buildStoryPrompt } from "@/lib/story-prompt";
import { analyzeStoryMarkdown } from "@/lib/story-quality";
import {
  judgeStoryQuality,
  judgeVerdictFailures,
  type JudgeVerdict,
} from "@/lib/story-quality-judge";

export type StoryGenerationContext = {
  selection: RecipeSelectionSlice;
  perfil?: FamilyProfileDocument | null;
  accentCode?: string | null;
};

export type StorySource = "gemini" | "claude" | "mock";

/** Fuerza un proveedor específico (comparación A/B en desarrollo) saltando el otro
 * por completo -- si el forzado falla o no tiene key, cae directo a mock en vez de
 * probar el proveedor no elegido. Ver /admin y src/lib/dev-provider-override.ts. */
export type ProviderOverride = "gemini" | "claude" | null;

export type GeneratedStoryDraft = {
  title: string;
  bodyMarkdown: string;
  source: StorySource;
  model: string | null;
  usage: LlmUsage | null;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet-latest";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_TOKENS = 2200;

function titleFromMarkdown(markdown: string, fallback: string): string {
  const parsed = parseStoryHeader(markdown);
  return parsed.title && parsed.title !== "Cuento" ? parsed.title : fallback;
}

/**
 * Reglas duras de la biblia editorial (apertura, sermón, autoburla…) que
 * ninguna generación en vivo debe romper. Ver docs/biblia-editorial.md §6.
 */
function qualityGateFailures(markdown: string, heroName: string | null): string[] {
  const report = analyzeStoryMarkdown(markdown, { heroName });
  return report.findings
    .filter((f) => f.severity === "error")
    .map((f) => f.message);
}

function buildQualityRetryReminder(failures: string[]): string {
  return `Tu intento anterior violó estas reglas de la biblia editorial — corrígelas ahora: ${failures.join(" · ")}`;
}

/**
 * % del tráfico que pasa por el gate semántico (Gate 2, Haiku). 0 = apagado.
 * Subir gradualmente vía SEMANTIC_GATE_ENABLED una vez medida la latencia/costo
 * real en producción — ver docs/plan-ajuste-prompt-runtime.md.
 */
function semanticGateRolloutPercent(): number {
  const raw = process.env.SEMANTIC_GATE_ENABLED?.trim();
  if (!raw) return 0;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

function shouldRunSemanticGate(): boolean {
  const percent = semanticGateRolloutPercent();
  if (percent <= 0) return false;
  if (percent >= 100) return true;
  return Math.random() * 100 < percent;
}

/**
 * Margen de gracia del juez semántico: si no responde en este tiempo, se
 * sirve el cuento sin esperarlo (el veredicto tardío solo se loguea para
 * medición, nunca decide un reintento tardío). Medido en producción: el
 * juez responde en ~7-9s, por encima de este margen — es decir, con este
 * valor el timeout se activa en la mayoría de las generaciones. Ver nota
 * en docs/plan-trabajo-chacachon.md §Fase 5.
 */
const JUDGE_GRACE_TIMEOUT_MS = 5000;

/** Log JSON de una línea (mismo patrón que generation-telemetry.ts), consultable en Vercel/Cloud logs. */
function logJudgeVerdict(
  verdict: JudgeVerdict,
  context: {
    heroName: string | null;
    provider: StorySource;
    isRetry: boolean;
    timedOut: boolean;
  },
): void {
  const flagged =
    verdict.callFailed ||
    !verdict.muestra_no_declara ||
    !verdict.puente_casa_fantasia ||
    !verdict.adultos_reconocibles;
  const line = JSON.stringify({
    event: "quality_judge_verdict",
    ...context,
    ...verdict,
  });
  if (flagged) {
    console.warn(`[quality-judge] ${line}`);
  } else {
    console.info(`[quality-judge] ${line}`);
  }
}

const JUDGE_TIMED_OUT = Symbol("judge-timed-out");

/**
 * Gate 1 (regex, gratis/instantáneo) + Gate 2 (semántico, Haiku — solo si
 * hay ANTHROPIC_API_KEY y el rollout lo sortea). Si el regex ya falla, no
 * gasta la llamada al juez: ese texto va a reintento de todos modos.
 *
 * El juez corre con un margen de gracia (JUDGE_GRACE_TIMEOUT_MS): si tarda
 * más, no bloquea al usuario — se trata como "sin fallas" para poder servir
 * el cuento, y el veredicto real se loguea aparte cuando llegue (solo para
 * medición, no reabre la decisión ya tomada).
 */
async function evaluateDraft(
  bodyMarkdown: string,
  heroName: string | null,
  judgeApiKey: string | undefined,
  provider: StorySource,
  isRetry: boolean,
): Promise<string[]> {
  const regexFailures = qualityGateFailures(bodyMarkdown, heroName);
  if (regexFailures.length > 0) return regexFailures;

  if (!judgeApiKey || !shouldRunSemanticGate()) return [];

  const judgePromise = judgeStoryQuality(bodyMarkdown, judgeApiKey);
  const timeoutPromise = new Promise<typeof JUDGE_TIMED_OUT>((resolve) => {
    setTimeout(() => resolve(JUDGE_TIMED_OUT), JUDGE_GRACE_TIMEOUT_MS);
  });

  const raced = await Promise.race([judgePromise, timeoutPromise]);

  if (raced === JUDGE_TIMED_OUT) {
    console.warn(
      `[quality-judge] margen de gracia agotado (${JUDGE_GRACE_TIMEOUT_MS}ms) — sirviendo sin esperar (${provider}${isRetry ? ", reintento" : ""}).`,
    );
    judgePromise
      .then((verdict) =>
        logJudgeVerdict(verdict, { heroName, provider, isRetry, timedOut: true }),
      )
      .catch((error) =>
        console.error("[quality-judge] error tras margen de gracia:", error),
      );
    return [];
  }

  logJudgeVerdict(raced, { heroName, provider, isRetry, timedOut: false });
  return judgeVerdictFailures(raced);
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
  retryReminder: string | null = null,
): Promise<{ markdown: string; usage: LlmUsage | null }> {
  const { system, user: baseUser } = buildStoryPrompt({
    selection: ctx.selection,
    perfil: ctx.perfil,
    accentCode: ctx.accentCode,
  });
  const user = retryReminder ? `${baseUser}\n\n${retryReminder}` : baseUser;

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
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  if (!text) throw new Error("Anthropic devolvió una respuesta vacía.");

  const usage: LlmUsage | null =
    data.usage?.input_tokens != null || data.usage?.output_tokens != null
      ? {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens:
            (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
        }
      : null;

  return { markdown: text, usage };
}

async function callGeminiModel(
  ctx: StoryGenerationContext,
  apiKey: string,
  model: string,
  retryReminder: string | null = null,
): Promise<{ markdown: string; usage: LlmUsage | null }> {
  const { system, user: baseUser } = buildStoryPrompt({
    selection: ctx.selection,
    perfil: ctx.perfil,
    accentCode: ctx.accentCode,
  });
  const user = retryReminder ? `${baseUser}\n\n${retryReminder}` : baseUser;
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
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 1.05,
        topP: 0.95,
      },
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
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error(`Gemini ${model} devolvió una respuesta vacía.`);

  const meta = data.usageMetadata;
  const usage: LlmUsage | null = meta
    ? {
        inputTokens: meta.promptTokenCount,
        outputTokens: meta.candidatesTokenCount,
        totalTokens: meta.totalTokenCount,
      }
    : null;

  return { markdown: text, usage };
}

async function callGemini(
  ctx: StoryGenerationContext,
  apiKey: string,
  retryReminder: string | null = null,
): Promise<{ markdown: string; model: string; usage: LlmUsage | null }> {
  const candidates = geminiModelCandidates();
  let lastError: Error | null = null;

  for (const model of candidates) {
    try {
      const { markdown, usage } = await callGeminiModel(
        ctx,
        apiKey,
        model,
        retryReminder,
      );
      return { markdown, model, usage };
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
 * Si el proveedor elegido falla (error de red/API), se cae al siguiente.
 * `opts.forceProvider` (solo admin, ver /admin) salta ese orden por completo:
 * si el forzado falla o no tiene key configurada, cae directo a mock en vez
 * de probar el otro proveedor — así la comparación A/B nunca se contamina
 * con una llamada silenciosa al proveedor no elegido.
 *
 * Además, cada generación pasa por dos gates de calidad (biblia editorial):
 *   Gate 1 — regex (story-quality.ts): apertura, sermón literal, autoburla…
 *   Gate 2 — semántico (story-quality-judge.ts, Haiku): solo si hay
 *            ANTHROPIC_API_KEY y el rollout de SEMANTIC_GATE_ENABLED lo
 *            sortea; atrapa sermón/puente-roto/adultos-disueltos dichos de
 *            formas que el regex no anticipó. Se salta si Gate 1 ya falló.
 * Si cualquiera de los dos falla, se reintenta UNA vez con el mismo
 * proveedor añadiendo un recordatorio corto. Si el reintento también falla,
 * no se sirve ese texto — se cae directo a la plantilla mock (no se prueba
 * el siguiente proveedor, para no arriesgar el mismo tipo de violación dos
 * veces). Todo fallo se loguea (sin bloquear) para medirlo con datos reales.
 */
export async function generateStory(
  ctx: StoryGenerationContext,
  opts?: { forceProvider?: ProviderOverride },
): Promise<GeneratedStoryDraft> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const forceProvider = opts?.forceProvider ?? null;
  const tryGemini = Boolean(geminiKey) && forceProvider !== "claude";
  const tryClaude = Boolean(anthropicKey) && forceProvider !== "gemini";
  const fallbackTitle = "Un cuento de Chacachón";
  const heroName = ctx.selection.heroes[0]?.label ?? null;
  let qualityGateBlocked = false;

  if (tryGemini && geminiKey) {
    try {
      const first = await callGemini(ctx, geminiKey);
      let bodyMarkdown = sanitizeFairyTaleBookends(first.markdown.trim());
      let model = first.model;
      let usage = first.usage;
      let failures = await evaluateDraft(
        bodyMarkdown,
        heroName,
        anthropicKey,
        "gemini",
        false,
      );

      if (failures.length > 0) {
        console.warn(
          "[story-generation] quality gate falló (gemini), reintentando:",
          failures,
        );
        try {
          const retry = await callGemini(
            ctx,
            geminiKey,
            buildQualityRetryReminder(failures),
          );
          const retryBody = sanitizeFairyTaleBookends(retry.markdown.trim());
          const retryFailures = await evaluateDraft(
            retryBody,
            heroName,
            anthropicKey,
            "gemini",
            true,
          );
          if (retryFailures.length === 0) {
            bodyMarkdown = retryBody;
            model = retry.model;
            usage = retry.usage;
            failures = [];
          } else {
            console.warn(
              "[story-generation] quality gate volvió a fallar tras reintento (gemini):",
              retryFailures,
              "— cae a mock.",
            );
            failures = retryFailures;
          }
        } catch (retryError) {
          console.error(
            "[story-generation] reintento de calidad falló (gemini):",
            retryError,
          );
        }
      }

      if (failures.length === 0) {
        return {
          title: titleFromMarkdown(bodyMarkdown, fallbackTitle),
          bodyMarkdown,
          source: "gemini",
          model,
          usage,
        };
      }
      qualityGateBlocked = true;
    } catch (error) {
      console.error("[story-generation] Gemini falló:", error);
    }
  }

  if (tryClaude && anthropicKey && !qualityGateBlocked) {
    try {
      const first = await callClaude(ctx, anthropicKey);
      let bodyMarkdown = sanitizeFairyTaleBookends(first.markdown.trim());
      let usage = first.usage;
      let failures = await evaluateDraft(
        bodyMarkdown,
        heroName,
        anthropicKey,
        "claude",
        false,
      );

      if (failures.length > 0) {
        console.warn(
          "[story-generation] quality gate falló (claude), reintentando:",
          failures,
        );
        try {
          const retry = await callClaude(
            ctx,
            anthropicKey,
            buildQualityRetryReminder(failures),
          );
          const retryBody = sanitizeFairyTaleBookends(retry.markdown.trim());
          const retryFailures = await evaluateDraft(
            retryBody,
            heroName,
            anthropicKey,
            "claude",
            true,
          );
          if (retryFailures.length === 0) {
            bodyMarkdown = retryBody;
            usage = retry.usage;
            failures = [];
          } else {
            console.warn(
              "[story-generation] quality gate volvió a fallar tras reintento (claude):",
              retryFailures,
              "— cae a mock.",
            );
            failures = retryFailures;
          }
        } catch (retryError) {
          console.error(
            "[story-generation] reintento de calidad falló (claude):",
            retryError,
          );
        }
      }

      if (failures.length === 0) {
        return {
          title: titleFromMarkdown(bodyMarkdown, fallbackTitle),
          bodyMarkdown,
          source: "claude",
          model: anthropicModel(),
          usage,
        };
      }
      qualityGateBlocked = true;
    } catch (error) {
      console.error("[story-generation] Claude falló:", error);
    }
  }

  const markdown = sanitizeFairyTaleBookends(
    buildMockStoryMarkdown(ctx.selection).trim(),
  );
  return {
    title: titleFromMarkdown(markdown, fallbackTitle),
    bodyMarkdown: markdown,
    source: "mock",
    model: null,
    usage: null,
  };
}
