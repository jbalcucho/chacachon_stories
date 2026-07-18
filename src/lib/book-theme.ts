export type BookTheme = {
  id: string;
  emoji: string;
  spine: string;
  cover: string;
  accent: string;
  /** RGB triplet for CSS glow, e.g. "255, 180, 60" */
  glow: string;
};

/** Paleta por slug cuando haya cuentos publicados. Vacío = solo variant/default. */
export const storyTheme: Record<string, BookTheme> = {
  "crear-cuento": {
    id: "create",
    emoji: "✨",
    spine: "from-[#fbbf24] to-[#b45309]",
    cover:
      "from-[#fde68a] via-[#fbbf24] to-[#f59e0b] ring-[#fef08a]/65",
    accent: "text-amber-950",
    glow: "251, 191, 36",
  },
  "demo-noche-en-casa": {
    id: "demo-noche",
    emoji: "🌙",
    spine: "from-[#6366f1] to-[#312e81]",
    cover:
      "from-[#a5b4fc] via-[#818cf8] to-[#4f46e5] ring-[#c7d2fe]/55",
    accent: "text-indigo-50",
    glow: "129, 140, 248",
  },
  "demo-el-trancon": {
    id: "demo-trancon",
    emoji: "🚌",
    spine: "from-[#f97316] to-[#9a3412]",
    cover:
      "from-[#fdba74] via-[#fb923c] to-[#ea580c] ring-[#fed7aa]/50",
    accent: "text-orange-50",
    glow: "251, 146, 60",
  },
  "demo-bingo-detective": {
    id: "demo-bingo",
    emoji: "🐶",
    spine: "from-[#14b8a6] to-[#115e59]",
    cover:
      "from-[#5eead4] via-[#2dd4bf] to-[#0f766e] ring-[#99f6e4]/50",
    accent: "text-teal-50",
    glow: "45, 212, 191",
  },
  // Corpus semilla — Fase 2 del plan de trabajo. Un color/ícono por cuento
  // para que el estante no se vea como 13 copias del mismo libro.
  "valentina-el-valle-de-los-susurros": {
    id: "valentina",
    emoji: "🔦",
    spine: "from-[#818cf8] to-[#4338ca]",
    cover: "from-[#c7d2fe] via-[#818cf8] to-[#4338ca] ring-[#e0e7ff]/55",
    accent: "text-indigo-50",
    glow: "129, 140, 248",
  },
  "samuel-el-sendero-de-las-luciernagas": {
    id: "samuel",
    emoji: "✨",
    spine: "from-[#fcd34d] to-[#b45309]",
    cover: "from-[#fde68a] via-[#fcd34d] to-[#b45309] ring-[#fef3c7]/55",
    accent: "text-amber-950",
    glow: "252, 211, 77",
  },
  "isabella-el-valle-de-los-ecos": {
    id: "isabella",
    emoji: "🪞",
    spine: "from-[#22d3ee] to-[#0e7490]",
    cover: "from-[#a5f3fc] via-[#22d3ee] to-[#0e7490] ring-[#cffafe]/55",
    accent: "text-cyan-950",
    glow: "34, 211, 238",
  },
  "tomas-el-espejo-de-los-ecos": {
    id: "tomas",
    emoji: "🏮",
    spine: "from-[#fb923c] to-[#9a3412]",
    cover: "from-[#fed7aa] via-[#fb923c] to-[#9a3412] ring-[#ffedd5]/55",
    accent: "text-orange-50",
    glow: "251, 146, 60",
  },
  "manuela-el-banquete-del-valle-colorido": {
    id: "manuela",
    emoji: "🥕",
    spine: "from-[#fb7185] to-[#9f1239]",
    cover: "from-[#fecdd3] via-[#fb7185] to-[#9f1239] ring-[#ffe4e6]/55",
    accent: "text-rose-50",
    glow: "251, 113, 133",
  },
  "andres-el-reino-de-las-hortalizas": {
    id: "andres",
    emoji: "🥬",
    spine: "from-[#a3e635] to-[#3f6212]",
    cover: "from-[#d9f99d] via-[#a3e635] to-[#3f6212] ring-[#ecfccb]/55",
    accent: "text-lime-950",
    glow: "163, 230, 53",
  },
  "camila-el-valle-de-los-bolos-saltarines": {
    id: "camila",
    emoji: "⚽",
    spine: "from-[#f472b6] to-[#9d174d]",
    cover: "from-[#fbcfe8] via-[#f472b6] to-[#9d174d] ring-[#fce7f3]/55",
    accent: "text-pink-50",
    glow: "244, 114, 182",
  },
  "emiliano-el-guardian-de-la-ciudad-zigzag": {
    id: "emiliano",
    emoji: "🧱",
    spine: "from-[#38bdf8] to-[#075985]",
    cover: "from-[#bae6fd] via-[#38bdf8] to-[#075985] ring-[#e0f2fe]/55",
    accent: "text-sky-50",
    glow: "56, 189, 248",
  },
  "luciana-el-reino-de-las-piezas-perdidas": {
    id: "luciana",
    emoji: "🧸",
    spine: "from-[#c084fc] to-[#6b21a8]",
    cover: "from-[#e9d5ff] via-[#c084fc] to-[#6b21a8] ring-[#f3e8ff]/55",
    accent: "text-purple-50",
    glow: "192, 132, 252",
  },
  "joaquin-el-rincon-oscuro": {
    id: "joaquin",
    emoji: "🌑",
    spine: "from-[#64748b] to-[#1e293b]",
    cover: "from-[#cbd5e1] via-[#64748b] to-[#1e293b] ring-[#e2e8f0]/55",
    accent: "text-slate-50",
    glow: "100, 116, 139",
  },
  "cerditos-la-torre-bien-hecha": {
    id: "cerditos",
    emoji: "🐷",
    spine: "from-[#fdba74] to-[#c2410c]",
    cover: "from-[#fed7aa] via-[#fdba74] to-[#c2410c] ring-[#ffedd5]/50",
    accent: "text-orange-50",
    glow: "253, 186, 116",
  },
  "caperucita-el-camino-del-mandado": {
    id: "caperucita",
    emoji: "🧺",
    spine: "from-[#f87171] to-[#7f1d1d]",
    cover: "from-[#fecaca] via-[#f87171] to-[#7f1d1d] ring-[#fee2e2]/55",
    accent: "text-red-50",
    glow: "248, 113, 113",
  },
  "ricitos-las-cosas-prestadas": {
    id: "ricitos",
    emoji: "🐻",
    spine: "from-[#d6a86a] to-[#78350f]",
    cover: "from-[#fde9c8] via-[#d6a86a] to-[#78350f] ring-[#fef3c7]/50",
    accent: "text-amber-50",
    glow: "214, 168, 106",
  },
};

export const variantTheme: Record<string, BookTheme> = {
  NARRATIVE: {
    id: "narrative",
    emoji: "🌲",
    spine: "from-[#16a34a] to-[#14532d]",
    cover:
      "from-[#4ade80] via-[#22c55e] to-[#15803d] ring-[#86efac]/50",
    accent: "text-emerald-100",
    glow: "74, 222, 128",
  },
  APARTMENT: {
    id: "apartment",
    emoji: "🏢",
    spine: "from-[#f97316] to-[#c2410c]",
    cover:
      "from-[#fdba74] via-[#fb923c] to-[#ea580c] ring-[#fed7aa]/50",
    accent: "text-orange-100",
    glow: "251, 146, 60",
  },
  PILOT: {
    id: "pilot",
    emoji: "🚀",
    spine: "from-[#8b5cf6] to-[#6d28d9]",
    cover:
      "from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] ring-[#ddd6fe]/50",
    accent: "text-violet-100",
    glow: "167, 139, 250",
  },
};

export const defaultTheme: BookTheme = {
  id: "default",
  emoji: "📖",
  spine: "from-[#3b82f6] to-[#1d4ed8]",
  cover:
    "from-[#93c5fd] via-[#60a5fa] to-[#2563eb] ring-[#bfdbfe]/50",
  accent: "text-blue-100",
  glow: "96, 165, 250",
};

export function getBookTheme(story: {
  slug: string;
  variant: string;
}): BookTheme {
  return (
    storyTheme[story.slug] ??
    variantTheme[story.variant] ??
    defaultTheme
  );
}

export function bookGlowStyle(theme: BookTheme): Record<string, string> {
  return { "--book-glow": theme.glow };
}

// El lomo tiene más alto disponible del que este límite usa (el CSS del
// lomo ya recorta con text-overflow: ellipsis por si aun así no cabe) —
// mejor pasarse un poco aquí que cortar el título a 2 palabras siempre.
const SPINE_TITLE_MAX_CHARS = 34;

export function spineTitle(title: string): string {
  if (title.length <= SPINE_TITLE_MAX_CHARS) return title;

  const words = title.split(/\s+/);
  let result = "";
  for (const word of words) {
    const next = result ? `${result} ${word}` : word;
    if (next.length > SPINE_TITLE_MAX_CHARS) break;
    result = next;
  }
  if (!result) result = title.slice(0, SPINE_TITLE_MAX_CHARS);
  return `${result}…`;
}

/**
 * Frase corta bajo el título en la portada abierta. Los 3 demos de invitado
 * traen `moraleja` como oración completa (gancho de marketing); el catálogo
 * curado trae `moraleja` como una sola palabra temática ("calma", "respeto")
 * y guarda el gancho real en `description` (ver prisma/seed.ts) -- por eso
 * el resumen se veía en modo invitado y no en modo logueado. Prioriza la
 * frase que de verdad se lea como resumen.
 */
export function bookTeaser(story: {
  moraleja: string | null;
  description: string | null;
}): string | null {
  const moraleja = story.moraleja?.trim() || null;
  if (moraleja && moraleja.includes(" ")) return moraleja;
  return story.description?.trim() || moraleja;
}

export function isStorySoon(status: string, openPath?: string | null): boolean {
  return status !== "PUBLISHED" || !openPath;
}
