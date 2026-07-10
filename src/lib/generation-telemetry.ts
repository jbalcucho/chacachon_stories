import type { StorySource } from "@/lib/story-generation.server";

/** Tokens reportados por el proveedor (si vienen en la respuesta). */
export type LlmUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type GenerationTelemetryEvent = {
  event: "story_generation";
  userId: string;
  storyId: string;
  source: StorySource;
  model: string | null;
  durationMs: number;
  bodyChars: number;
  estimatedUsd: number;
  usage: LlmUsage | null;
  alert: boolean;
};

/**
 * Precios aproximados USD / 1M tokens (referencia para alertas, no facturación).
 * Ajustar cuando pases a plan de pago (A8).
 */
const USD_PER_MILLION: Record<
  StorySource,
  { input: number; output: number }
> = {
  gemini: { input: 0.1, output: 0.4 },
  claude: { input: 3, output: 15 },
  mock: { input: 0, output: 0 },
};

/** ~4 chars ≈ 1 token cuando el proveedor no reporta usage. */
export function estimateTokensFromText(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function getGenerationCostAlertUsd(): number {
  const raw = process.env.GENERATION_COST_ALERT_USD;
  if (!raw) return 0.05;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0.05;
  return parsed;
}

/** Estima costo en USD a partir de usage real o del tamaño del markdown. */
export function estimateGenerationUsd(input: {
  source: StorySource;
  bodyMarkdown: string;
  usage?: LlmUsage | null;
}): number {
  const rates = USD_PER_MILLION[input.source];
  let inputTokens = input.usage?.inputTokens;
  let outputTokens = input.usage?.outputTokens;

  if (input.usage?.totalTokens && inputTokens == null && outputTokens == null) {
    outputTokens = Math.ceil(input.usage.totalTokens * 0.7);
    inputTokens = input.usage.totalTokens - outputTokens;
  }

  if (inputTokens == null || outputTokens == null) {
    outputTokens = estimateTokensFromText(input.bodyMarkdown);
    inputTokens = Math.ceil(outputTokens * 1.5);
  }

  return (
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output
  );
}

export function buildGenerationTelemetry(input: {
  userId: string;
  storyId: string;
  source: StorySource;
  model: string | null;
  durationMs: number;
  bodyMarkdown: string;
  usage?: LlmUsage | null;
}): GenerationTelemetryEvent {
  const estimatedUsd = estimateGenerationUsd({
    source: input.source,
    bodyMarkdown: input.bodyMarkdown,
    usage: input.usage,
  });
  const alert = estimatedUsd >= getGenerationCostAlertUsd();

  return {
    event: "story_generation",
    userId: input.userId,
    storyId: input.storyId,
    source: input.source,
    model: input.model,
    durationMs: input.durationMs,
    bodyChars: input.bodyMarkdown.length,
    estimatedUsd: Number(estimatedUsd.toFixed(6)),
    usage: input.usage ?? null,
    alert,
  };
}

/** Log JSON en una línea (Vercel / Cloud logs). Alerta si supera umbral. */
export function logGenerationTelemetry(event: GenerationTelemetryEvent): void {
  const line = JSON.stringify(event);
  if (event.alert) {
    console.warn(`[generation-cost-alert] ${line}`);
  } else {
    console.info(`[generation] ${line}`);
  }
}
