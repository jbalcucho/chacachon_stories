const SOURCE_LABELS: Record<string, string> = {
  gemini: "IA · Gemini",
  claude: "IA · Claude",
  mock: "Plantilla local",
};

/** Etiqueta legible para el origen de un cuento generado. */
export function labelGeneratedStorySource(source: string): string {
  return SOURCE_LABELS[source] ?? "Cuento personalizado";
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Fecha corta para listados (ej. «10 jul 2026»). */
export function formatGeneratedStoryDate(date: Date): string {
  return dateFormatter.format(date);
}
