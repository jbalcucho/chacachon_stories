import { parseStoryHeader } from "@/lib/story-markdown";
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
  regulationSignalCount: number;
  sermonHitCount: number;
  abstractHitCount: number;
};

export type StoryQualityReport = {
  metrics: StoryQualityMetrics;
  findings: QualityFinding[];
  score: number;
  passed: boolean;
};

const WORD_MIN = 350;
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
  /\bmoraleja:/i,
  /##\s+la moraleja/i,
];

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

const REGULATION_PATTERNS = [
  /\bpatalet(a|ó|ando)\b/i,
  /\bberrinche\b/i,
  /\bse puso brav[oa]\b/i,
  /\b¡?no+!?/i,
  /\bcara de tomate\b/i,
  /\bpate(ó|ando)\b/i,
  /\btir(ó|arse) al piso\b/i,
  /\bme ayudas\b/i,
  /\bsuspiro\b/i,
  /\brespir(ar|ó|ación)\b/i,
  /\bcontó hasta tres\b/i,
  /\bpuños?\b/i,
  /\bnudo\b/i,
  /\bcerró los ojos\b/i,
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

export function analyzeStoryMarkdown(raw: string): StoryQualityReport {
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
  const regulationSignalCount = REGULATION_PATTERNS.reduce(
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

  if (regulationSignalCount < 2) {
    findings.push({
      id: "regulation-low",
      severity: "info",
      message: `Poco modelado de regulación emocional (${regulationSignalCount}; ideal ≥ 2)`,
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
      regulationSignalCount,
      sermonHitCount,
      abstractHitCount,
    },
    findings,
    score,
    passed: errorCount === 0 && warnCount <= 3,
  };
}
