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

const FAIRY_OPENING =
  /\b((?:Hab[ií]a|Era|Érase|Erase)\s+un[ao]?\s+vez)\b/i;

/** Normaliza typos («Habia un vez») a la fórmula canónica. */
export function canonicalizeFairyOpening(matched: string): string {
  const t = matched.trim();
  if (/^(?:éra?se|erase)\b/i.test(t)) return "Érase una vez";
  if (/^era\b/i.test(t)) return "Era una vez";
  return "Había una vez";
}

export function paragraphStartsWithFairyOpening(text: string): boolean {
  return /^(?:Hab[ií]a|Era|Érase|Erase)\s+un[ao]?\s+vez\b/i.test(text.trim());
}

/**
 * Recorta todo lo que la IA ponga antes de la fórmula de cuento
 * («La sala en silencio Había una vez…», «## La sala…» pegado al párrafo, etc.).
 * Busca la primera aparición de Había/Era/Érase una vez en el cuerpo.
 */
export function sanitizeFairyTaleOpening(markdown: string): string {
  const parsed = parseStoryHeader(markdown);
  if (!parsed.body) return markdown;

  const match = FAIRY_OPENING.exec(parsed.body);
  if (!match || match.index === undefined) return markdown;

  const rest = parsed.body.slice(match.index + match[0].length);
  const opening = canonicalizeFairyOpening(match[0]);
  const body = `${opening}${rest}`.replace(/^\s+/, "").trim();

  const alreadyClean =
    match.index === 0 &&
    parsed.body.startsWith(opening) &&
    body === parsed.body;
  if (alreadyClean) return markdown;

  const parts = [`# ${parsed.title}`];
  if (parsed.subtitle) {
    for (const piece of parsed.subtitle.split(" · ")) {
      parts.push(`> ${piece}`);
    }
  }
  parts.push("", body);
  return parts.join("\n");
}

const FAIRY_CLOSING =
  /color[ií]n\s+colorado|este cuento se ha (?:terminado|acabado)|y se acab[oó] el cuento|vivieron felices/i;

export const DEFAULT_FAIRY_CLOSING =
  "Y colorín colorado, este cuento se ha terminado.";

/** True si el cuerpo ya trae una fórmula oral de cierre cerca del final. */
export function hasFairyTaleClosing(body: string): boolean {
  const tail = body.trim().slice(-280);
  return FAIRY_CLOSING.test(tail);
}

/**
 * Garantiza el cierre oral (simétrico a Había una vez).
 * Si el modelo olvida el colorín colorado, lo añade al final del cuerpo.
 */
export function ensureFairyTaleClosing(markdown: string): string {
  const parsed = parseStoryHeader(markdown);
  if (!parsed.body?.trim()) return markdown;
  if (hasFairyTaleClosing(parsed.body)) return markdown;

  const body = `${parsed.body.trim()}\n\n${DEFAULT_FAIRY_CLOSING}`;
  const parts = [`# ${parsed.title}`];
  if (parsed.subtitle) {
    for (const piece of parsed.subtitle.split(" · ")) {
      parts.push(`> ${piece}`);
    }
  }
  parts.push("", body);
  return parts.join("\n");
}

/** Apertura limpia + cierre oral garantizado. */
export function sanitizeFairyTaleBookends(markdown: string): string {
  return ensureFairyTaleClosing(sanitizeFairyTaleOpening(markdown));
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
      const rawHeading = trimmed.slice(3);
      // ## sin línea en blanco antes del cuento: partir en título + párrafo.
      const fairyInHeading = FAIRY_OPENING.exec(rawHeading);
      if (fairyInHeading && fairyInHeading.index !== undefined) {
        // Descartar basura atmosférica («La sala en silencio») pegada al ##.
        const after =
          canonicalizeFairyOpening(fairyInHeading[0]) +
          rawHeading.slice(fairyInHeading.index + fairyInHeading[0].length);
        blocks.push({
          type: "paragraph",
          text: unwrapOuterBold(after.replace(/\n/g, " ").trim()),
        });
        continue;
      }

      // La IA suele pegar `## El reto\nNico…` sin línea en blanco (escenas 2–3).
      // Separar la primera línea (etiqueta) del resto (narración).
      const headingLines = rawHeading.split(/\r?\n/);
      const firstLine = unwrapOuterBold((headingLines[0] ?? "").trim());
      const restText = unwrapOuterBold(
        headingLines
          .slice(1)
          .join("\n")
          .replace(/\n/g, " ")
          .trim(),
      );

      if (isSceneHeadingLabel(firstLine)) {
        blocks.push({ type: "heading", text: firstLine });
        if (restText) {
          blocks.push({ type: "paragraph", text: restText });
        }
      } else {
        const merged = [firstLine, restText].filter(Boolean).join(" ").trim();
        blocks.push({
          type: "paragraph",
          text: unwrapOuterBold(merged.replace(/\n/g, " ")),
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
