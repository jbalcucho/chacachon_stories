import { splitIntoSentences } from "@/lib/story-paragraph-split";

export type StoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" };

export type ParsedStoryMarkdown = {
  title: string;
  subtitle: string | null;
  body: string;
};

const UNORDERED_ITEM = /^\s*[-*]\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+\.\s+(.*)$/;
/** Escena corta: «El comienzo». Frases largas con ## no son títulos. */
const SCENE_HEADING_MAX_CHARS = 48;
const SCENE_HEADING_MAX_WORDS = 6;

/**
 * Encabezado del cuento: título (`# `), subtítulo (`> …`) y cuerpo.
 * El frontmatter ya debe venir removido por el llamador.
 */
export function parseStoryHeader(rawBody: string): ParsedStoryMarkdown {
  const lines = rawBody.split(/\r?\n/);
  let index = 0;
  let title = "Cuento";
  let subtitle: string | null = null;

  while (index < lines.length && lines[index] === "") index += 1;

  if (lines[index]?.startsWith("# ")) {
    title = lines[index].slice(2).trim();
    index += 1;
  }

  while (index < lines.length && lines[index] === "") index += 1;

  if (lines[index]?.startsWith("> ")) {
    const quoteLines: string[] = [];
    while (lines[index]?.startsWith("> ")) {
      quoteLines.push(lines[index].slice(2).trim());
      index += 1;
    }
    subtitle = quoteLines.join(" · ");
  }

  while (
    index < lines.length &&
    (lines[index] === "" || lines[index] === "---")
  ) {
    index += 1;
  }

  return {
    title,
    subtitle,
    body: lines.slice(index).join("\n").trim(),
  };
}

function matchListItem(line: string): { text: string; ordered: boolean } | null {
  const ordered = ORDERED_ITEM.exec(line);
  if (ordered) return { text: ordered[1].trim(), ordered: true };
  const unordered = UNORDERED_ITEM.exec(line);
  if (unordered) return { text: unordered[1].trim(), ordered: false };
  return null;
}

/** Solo etiquetas cortas de escena; evita pintar párrafos narrativos como título. */
export function isSceneHeadingLabel(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > SCENE_HEADING_MAX_CHARS) return false;
  if (/[.!?…:;]/.test(t)) return false;
  if (t.split(/\s+/).filter(Boolean).length > SCENE_HEADING_MAX_WORDS) {
    return false;
  }
  return true;
}

/** Quita `**…**` que envuelve todo el párrafo (abuso frecuente del modelo). */
export function unwrapOuterBold(text: string): string {
  const trimmed = text.trim();
  const match = /^\*\*([^*][\s\S]*?)\*\*$/.exec(trimmed);
  if (!match) return text;
  const inner = match[1].trim();
  if (!inner || inner.includes("**")) return text;
  return inner;
}

/**
 * Divide el cuerpo en bloques: párrafos, encabezados (`## `), separadores
 * (`---`) y listas (`- ` / `* ` / `1. `). Conserva los marcadores en línea
 * (`**negrita**`, `*cursiva*`, `_cursiva_`) para que el render los interprete.
 * Los diálogos con raya (`—`) no se confunden con listas.
 */
export function parseBodyBlocks(body: string): StoryBlock[] {
  const blocks: StoryBlock[] = [];

  for (const chunk of body.split(/\n\n+/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    if (trimmed === "---") {
      blocks.push({ type: "divider" });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const headingText = unwrapOuterBold(trimmed.slice(3).trim());
      if (isSceneHeadingLabel(headingText)) {
        blocks.push({ type: "heading", text: headingText });
      } else {
        blocks.push({
          type: "paragraph",
          text: unwrapOuterBold(headingText.replace(/\n/g, " ")),
        });
      }
      continue;
    }

    const chunkLines = trimmed.split(/\r?\n/);
    const firstItem = matchListItem(chunkLines[0]);
    const isList =
      firstItem !== null &&
      chunkLines.every((line) => matchListItem(line) !== null);

    if (isList && firstItem) {
      const items = chunkLines
        .map((line) => matchListItem(line)?.text ?? "")
        .filter((text) => text.length > 0);
      blocks.push({ type: "list", ordered: firstItem.ordered, items });
      continue;
    }

    blocks.push({
      type: "paragraph",
      text: unwrapOuterBold(trimmed.replace(/\n/g, " ")),
    });
  }

  return blocks;
}

const PAGINATION_PARAGRAPH_MAX_CHARS = 900;

/** Trocea párrafos largos (plantillas) para que la paginación DOM sea estable. */
export function splitBlocksForPagination(
  blocks: StoryBlock[],
  maxChars = PAGINATION_PARAGRAPH_MAX_CHARS,
): StoryBlock[] {
  return blocks.flatMap((block) => {
    if (block.type !== "paragraph" || block.text.length <= maxChars) {
      return [block];
    }

    const sentences = splitIntoSentences(block.text);
    const chunks: StoryBlock[] = [];
    let buffer = "";

    for (const sentence of sentences) {
      const candidate = buffer ? `${buffer} ${sentence}` : sentence;
      if (candidate.length > maxChars && buffer) {
        chunks.push({ type: "paragraph", text: buffer });
        buffer = sentence;
      } else {
        buffer = candidate;
      }
    }

    if (buffer) chunks.push({ type: "paragraph", text: buffer });
    return chunks.length > 0 ? chunks : [{ type: "paragraph", text: block.text }];
  });
}
