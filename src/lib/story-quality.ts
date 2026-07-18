import {
  parseStoryHeader,
  paragraphStartsWithFairyOpening,
} from "@/lib/story-markdown";
import { splitIntoSentences } from "@/lib/story-paragraph-split";

export type QualitySeverity = "error" | "warn" | "info";

export type QualityFinding = {
  id: string;
  severity: QualitySeverity;
  message: string;
};

export type StoryQualityMetrics = {
  wordCount: number;
  sceneCount: number;
  sentenceCount: number;
  avgSentenceWords: number;
  maxParagraphSentences: number;
  dialogueLineCount: number;
  dialogueRatio: number;
  sensoryAnchorCount: number;
  sermonHitCount: number;
  abstractHitCount: number;
};

export type StoryQualityReport = {
  metrics: StoryQualityMetrics;
  findings: QualityFinding[];
  score: number;
  passed: boolean;
};

const WORD_MIN = 400;
const WORD_MAX = 600;
const SCENE_MIN = 3;
const SCENE_MAX = 5;
const AVG_SENTENCE_WARN = 22;
const MAX_PARAGRAPH_SENTENCES_WARN = 5;
const DIALOGUE_RATIO_WARN = 0.12;

const SERMON_PATTERNS = [
  /\bla moraleja es\b/i,
  /\blo que aprendimos\b/i,
  /\by desde ese día\b/i,
  /\baprendieron\s+—/i,
  /\baprendieron que\b/i,
  /\baprendió que\b/i,
  /\bentendió que\b/i,
  /\bentendieron que\b/i,
  /\bmoraleja:/i,
  /##\s+la moraleja/i,
];

/** Autoburla del héroe (permitida solo en villanos/objetos/secundarios, ver STORY_PROMPT_CORE). */
const SELF_DEPRECATION_PATTERNS = [
  /\bqué menso\b/i,
  /\bqué mensa\b/i,
  /\bqué tonto\b/i,
  /\bqué tonta\b/i,
  /\bqué bruto\b/i,
  /\bqué bruta\b/i,
  /\bqué torpe\b/i,
  /\bqué chambón\b/i,
  /\bqué chambona\b/i,
];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ABSTRACT_PATTERNS = [
  /\bestaba triste\b/i,
  /\bestaba feliz\b/i,
  /\bera (un lugar |muy )?bonit[oa]\b/i,
  /\bestaba enojad[oa]\b/i,
  /\bse sintió (triste|feliz|enojad[oa])\b/i,
];

const SENSORY_PATTERNS = [
  /\bolía a\b/i,
  /\bolor a\b/i,
  /\bsonido\b/i,
  /\bsonó\b/i,
  /\bzumb(a|aba|ando)\b/i,
  /\bladr(ó|aba|ando)\b/i,
  /\bfrí[oa]\b/i,
  /\bcaliente\b/i,
  /\blluvia\b/i,
  /\blluvizna\b/i,
  /\btextura\b/i,
  /\bpegajos[oa]\b/i,
  /\bsuave\b/i,
  /\básper[oa]\b/i,
  /\bchanclas\b/i,
  /\bpijama\b/i,
  /\bcafé\b/i,
  /\bpan tostado\b/i,
  /\bbarro\b/i,
  /\bsudor\b/i,
  /\bestómago\b/i,
  /\bpecho\b/i,
  /\bhombros\b/i,
];

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return raw;
  return raw.slice(end + 4).trimStart();
}

function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches?.length ?? 0;
}

function paragraphChunks(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("## ") && p !== "---");
}

/**
 * Primer párrafo narrativo, incluso si el modelo lo pegó sin línea en blanco
 * bajo un `## ` (paragraphChunks descarta ese chunk entero en ese caso).
 */
function firstNarrativeParagraph(body: string): string {
  const chunks = body
    .split(/\n\n+/)
    .map((c) => c.trim())
    .filter((c) => c && c !== "---");

  for (const chunk of chunks) {
    if (!chunk.startsWith("## ")) return chunk;
    const newlineIndex = chunk.indexOf("\n");
    if (newlineIndex === -1) continue;
    const rest = chunk.slice(newlineIndex + 1).trim();
    if (rest) return rest;
  }
  return "";
}

export type AnalyzeStoryOptions = {
  /** Nombre del niño protagonista, para el heurístico de autoburla (Fix 4). */
  heroName?: string | null;
};

export function analyzeStoryMarkdown(
  raw: string,
  options: AnalyzeStoryOptions = {},
): StoryQualityReport {
  const stripped = stripFrontmatter(raw);
  const parsed = parseStoryHeader(stripped);
  const body = parsed.body;
  const findings: QualityFinding[] = [];

  const scenes = body.match(/^## .+/gm) ?? [];
  const sceneCount = scenes.length;

  const paragraphs = paragraphChunks(body);
  const sentences = paragraphs.flatMap((p) => splitIntoSentences(p));
  const sentenceCount = sentences.length;
  const wordCount = countWords(body);

  const sentenceWordCounts = sentences.map((s) => countWords(s));
  const avgSentenceWords =
    sentenceCount > 0
      ? Math.round(
          (sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceCount) * 10,
        ) / 10
      : 0;

  const paragraphSentenceCounts = paragraphs.map((p) =>
    splitIntoSentences(p).length,
  );
  const maxParagraphSentences =
    paragraphSentenceCounts.length > 0
      ? Math.max(...paragraphSentenceCounts)
      : 0;

  const dialogueLineCount = (body.match(/^—/gm) ?? []).length;
  const dialogueRatio =
    sentenceCount > 0 ? dialogueLineCount / sentenceCount : 0;

  const sensoryAnchorCount = SENSORY_PATTERNS.reduce(
    (sum, re) => sum + (body.match(re)?.length ?? 0),
    0,
  );
  const sermonHitCount = SERMON_PATTERNS.reduce(
    (sum, re) => sum + (body.match(re)?.length ?? 0),
    0,
  );
  const abstractHitCount = ABSTRACT_PATTERNS.reduce(
    (sum, re) => sum + (body.match(re)?.length ?? 0),
    0,
  );

  if (wordCount < WORD_MIN) {
    findings.push({
      id: "words-low",
      severity: "warn",
      message: `Palabras: ${wordCount} (objetivo ${WORD_MIN}–${WORD_MAX})`,
    });
  } else if (wordCount > WORD_MAX) {
    findings.push({
      id: "words-high",
      severity: "warn",
      message: `Palabras: ${wordCount} (objetivo ${WORD_MIN}–${WORD_MAX})`,
    });
  }

  if (sceneCount > 0 && (sceneCount < SCENE_MIN || sceneCount > SCENE_MAX)) {
    findings.push({
      id: "scenes",
      severity: "warn",
      message: `Escenas: ${sceneCount} (recomendado ${SCENE_MIN}–${SCENE_MAX})`,
    });
  }

  if (avgSentenceWords > AVG_SENTENCE_WARN) {
    findings.push({
      id: "sentence-length",
      severity: "warn",
      message: `Promedio de palabras por oración: ${avgSentenceWords} (ideal ≤ ${AVG_SENTENCE_WARN})`,
    });
  }

  if (maxParagraphSentences > MAX_PARAGRAPH_SENTENCES_WARN) {
    findings.push({
      id: "paragraph-density",
      severity: "warn",
      message: `Párrafo más denso: ${maxParagraphSentences} oraciones (ideal ≤ ${MAX_PARAGRAPH_SENTENCES_WARN})`,
    });
  }

  if (dialogueRatio < DIALOGUE_RATIO_WARN) {
    findings.push({
      id: "dialogue-low",
      severity: "info",
      message: `Poco diálogo con raya (${Math.round(dialogueRatio * 100)}% de oraciones)`,
    });
  }

  if (sensoryAnchorCount < 4) {
    findings.push({
      id: "sensory-low",
      severity: "warn",
      message: `Pocas anclas sensoriales detectadas (${sensoryAnchorCount}; objetivo ≥ 4)`,
    });
  }

  if (sermonHitCount > 0) {
    findings.push({
      id: "sermon",
      severity: "error",
      message: `Posible sermón detectado (${sermonHitCount} coincidencias)`,
    });
  }

  if (abstractHitCount > 2) {
    findings.push({
      id: "abstract",
      severity: "warn",
      message: `Descripciones abstractas (${abstractHitCount}; preferir cuerpo/entorno)`,
    });
  }

  if (parsed.subtitle && /\bmoraleja\b/i.test(parsed.subtitle)) {
    findings.push({
      id: "subtitle-moral",
      severity: "error",
      message: "El subtítulo incluye moraleja explícita",
    });
  }

  const firstParagraph = firstNarrativeParagraph(body);
  if (firstParagraph && !paragraphStartsWithFairyOpening(firstParagraph)) {
    findings.push({
      id: "opening-missing",
      severity: "error",
      message: `Apertura sin "Había una vez" / "Era una vez": "${firstParagraph.slice(0, 60)}…"`,
    });
  }

  const heroName = options.heroName?.trim();
  if (heroName) {
    const heroNameRe = new RegExp(`\\b${escapeRegExp(heroName)}\\b`, "i");
    const selfDeprecatingParagraph = paragraphs.find((p) => {
      const hasSelfDeprecation = SELF_DEPRECATION_PATTERNS.some((re) =>
        re.test(p),
      );
      if (!hasSelfDeprecation) return false;
      return heroNameRe.test(p) || /\byo\b/i.test(p);
    });
    if (selfDeprecatingParagraph) {
      findings.push({
        id: "self-deprecation",
        severity: "error",
        message: `Posible autoburla del protagonista (${heroName}): "${selfDeprecatingParagraph.slice(0, 80)}…"`,
      });
    }
  }

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warnCount = findings.filter((f) => f.severity === "warn").length;

  let score = 100;
  score -= errorCount * 25;
  score -= warnCount * 8;
  score = Math.max(0, score);

  return {
    metrics: {
      wordCount,
      sceneCount,
      sentenceCount,
      avgSentenceWords,
      maxParagraphSentences,
      dialogueLineCount,
      dialogueRatio,
      sensoryAnchorCount,
      sermonHitCount,
      abstractHitCount,
    },
    findings,
    score,
    passed: errorCount === 0 && warnCount <= 3,
  };
}
