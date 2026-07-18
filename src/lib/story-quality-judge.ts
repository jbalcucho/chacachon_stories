import "server-only";

/**
 * Gate 2 (semántico): una sola llamada a un LLM juez, sin autonomía —
 * el llamador (story-generation.server.ts) decide qué hacer con el
 * veredicto, igual que ya decide qué hacer con el gate de regex (Fix 4).
 * Complementa story-quality.ts: el regex atrapa frases literales; el juez
 * atrapa sermón/puente roto/adultos disueltos dichos de formas nuevas.
 */
export type JudgeCriteria = {
  muestra_no_declara: boolean;
  razon_muestra_no_declara: string;
  puente_casa_fantasia: boolean;
  razon_puente: string;
  adultos_reconocibles: boolean;
  razon_adultos: string;
};

export type JudgeVerdict = JudgeCriteria & {
  /** true si la llamada a la API o el parseo del JSON falló (fail-closed sintético, nunca éxito silencioso). */
  callFailed: boolean;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const JUDGE_DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const JUDGE_MAX_TOKENS = 400;

function judgeModel(): string {
  return process.env.JUDGE_MODEL?.trim() || JUDGE_DEFAULT_MODEL;
}

const JUDGE_SYSTEM_PROMPT = `Eres un evaluador editorial estricto. Vas a recibir un cuento infantil completo.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con esta forma exacta:

{
  "muestra_no_declara": boolean,
  "razon_muestra_no_declara": "string corto",
  "puente_casa_fantasia": boolean,
  "razon_puente": "string corto",
  "adultos_reconocibles": boolean,
  "razon_adultos": "string corto"
}

Criterios:
- muestra_no_declara: true si la lección se infiere de las acciones del
  protagonista SIN que ninguna frase generalice un principio transferible
  ("esto/eso hace que todo sea mejor/más fácil", "aprendió/entendió que X es
  bueno/importante", "descubrió el valor de Y"). false SOLO si existe una frase
  así de generalizable.

  IMPORTANTE — esto NO cuenta como declarar la lección, y debe marcarse true:
  - Una sensación física o emocional concreta y momentánea del personaje ("se
    sentía fuerte", "sintió calidez en el pecho", "le supo a gloria", "se sintió
    ligero"), incluso si está conectada a lo que acaba de hacer.
  - Una acción física de cierre sin interpretación (un abrazo, un choque de manos,
    guardar algo, sentarse en calma).
  - Diálogo breve de un adulto que reacciona con calidez sin nombrar un valor
    abstracto ("Lo lograste", "Así se hace", "Qué bien lo hiciste").

  Ejemplos PASS (true) — no declaran nada, solo muestran:
  - "Se sentía fuerte y listo para otra aventura." (sensación momentánea, no
    generaliza nada)
  - "Emiliano chocó los cinco con Lucía sobre la torre terminada." (acción pura)
  - "El brócoli, ahora, le supo a victoria." (sensación específica de ese bocado)

  Ejemplos FAIL (false) — generalizan un principio:
  - "El trabajo en equipo había hecho que todo fuera más fácil." (generaliza)
  - "El mundo real era mucho más grande que cualquier pantalla." (generaliza una
    comparación de valor, no describe una sensación puntual)
  - "Entendió que compartir es mejor que guardarlo todo." (declara la lección
    explícitamente)

  Ante la duda entre un beat emocional legítimo y una generalización: pregúntate
  si la frase seguiría siendo verdadera en CUALQUIER otro cuento con cualquier
  otro personaje (si sí, es una generalización = false; si es específica a este
  momento y este personaje, = true).
- puente_casa_fantasia: true si el cuento ancla una situación real y reconocible de
  casa (con un adulto real presente) ANTES de transformarse en fantasía, y esa
  situación real es identificable incluso sin el disfraz fantástico.
- adultos_reconocibles: true si los adultos del niño (mamá/papá/abuela/etc.) siguen
  siendo reconocibles como personas reales dentro del mundo fantástico (no
  reemplazados por títulos fantásticos que borran su identidad).

Sé estricto: ante la duda, marca false y explica por qué en la razón.`;

function failClosed(reason: string): JudgeVerdict {
  return {
    muestra_no_declara: false,
    razon_muestra_no_declara: reason,
    puente_casa_fantasia: false,
    razon_puente: reason,
    adultos_reconocibles: false,
    razon_adultos: reason,
    callFailed: true,
  };
}

function parseJudgeResponse(raw: string): JudgeVerdict | null {
  let parsed: unknown;
  try {
    // El modelo a veces envuelve el JSON en ```json … ``` pese a la instrucción.
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as Record<string, unknown>;
  const isBool = (v: unknown): v is boolean => typeof v === "boolean";
  const isStr = (v: unknown): v is string => typeof v === "string";

  if (
    !isBool(p.muestra_no_declara) ||
    !isStr(p.razon_muestra_no_declara) ||
    !isBool(p.puente_casa_fantasia) ||
    !isStr(p.razon_puente) ||
    !isBool(p.adultos_reconocibles) ||
    !isStr(p.razon_adultos)
  ) {
    return null;
  }

  return {
    muestra_no_declara: p.muestra_no_declara,
    razon_muestra_no_declara: p.razon_muestra_no_declara,
    puente_casa_fantasia: p.puente_casa_fantasia,
    razon_puente: p.razon_puente,
    adultos_reconocibles: p.adultos_reconocibles,
    razon_adultos: p.razon_adultos,
    callFailed: false,
  };
}

/**
 * Llama a Haiku (temperatura 0) para juzgar un cuento ya generado.
 * Fail-closed: cualquier error de red, HTTP o de parseo se trata como
 * fallo del gate (nunca como aprobación silenciosa).
 */
export async function judgeStoryQuality(
  text: string,
  apiKey: string,
): Promise<JudgeVerdict> {
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: judgeModel(),
        max_tokens: JUDGE_MAX_TOKENS,
        temperature: 0,
        system: JUDGE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });
  } catch (error) {
    return failClosed(
      `Error de red llamando al juez: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return failClosed(`Juez respondió ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  if (!rawText) return failClosed("Juez devolvió una respuesta vacía.");

  const parsed = parseJudgeResponse(rawText);
  if (!parsed) {
    return failClosed(`Juez no devolvió JSON válido: "${rawText.slice(0, 200)}"`);
  }
  return parsed;
}

/** Veredicto → mensajes cortos de fallo, listos para buildQualityRetryReminder(). */
export function judgeVerdictFailures(verdict: JudgeVerdict): string[] {
  if (verdict.callFailed) {
    return [`Juez semántico no disponible, fail-closed: ${verdict.razon_muestra_no_declara}`];
  }

  const failures: string[] = [];
  if (!verdict.muestra_no_declara) {
    failures.push(
      `Sermón disfrazado (juez semántico): ${verdict.razon_muestra_no_declara}`,
    );
  }
  if (!verdict.puente_casa_fantasia) {
    failures.push(
      `Puente casa-fantasía roto (juez semántico): ${verdict.razon_puente}`,
    );
  }
  if (!verdict.adultos_reconocibles) {
    failures.push(
      `Adultos disueltos en fantasía (juez semántico): ${verdict.razon_adultos}`,
    );
  }
  return failures;
}
