/** Parte un párrafo en oraciones para paginar sin cortar frases a mitad. */
export function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const sentences: string[] = [];
  let start = 0;
  const boundary = /([.!?…]+["»]?)\s+/g;
  let match: RegExpExecArray | null;

  while ((match = boundary.exec(trimmed)) !== null) {
    const end = match.index + match[1].length;
    const sentence = trimmed.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = match.index + match[0].length;
  }

  const tail = trimmed.slice(start).trim();
  if (tail) sentences.push(tail);

  return sentences.length > 0 ? sentences : [trimmed];
}

export function splitIntoWords(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/);
}

export function joinSentences(sentences: string[]): string {
  return sentences.join(" ").trim();
}

export function joinWords(words: string[]): string {
  return words.join(" ").trim();
}
