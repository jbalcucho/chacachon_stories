export type BookTheme = {
  id: string;
  emoji: string;
  spine: string;
  cover: string;
  accent: string;
  /** RGB triplet for CSS glow, e.g. "255, 180, 60" */
  glow: string;
};

/** Paleta vívida por cuento — cada libro con personalidad propia. */
export const storyTheme: Record<string, BookTheme> = {
  "el-lobo-y-las-palabras": {
    id: "forest",
    emoji: "🐺",
    spine: "from-[#1a9b52] to-[#0d6e38]",
    cover:
      "from-[#3ee07a] via-[#22c55e] to-[#15803d] ring-[#86efac]/55",
    accent: "text-emerald-100",
    glow: "74, 222, 128",
  },
  "cerditos-del-edificio": {
    id: "brick",
    emoji: "🐷",
    spine: "from-[#e85d4a] to-[#b91c1c]",
    cover:
      "from-[#fb923c] via-[#f97316] to-[#dc2626] ring-[#fdba74]/55",
    accent: "text-orange-100",
    glow: "251, 146, 60",
  },
  "operacion-a-dormir": {
    id: "night",
    emoji: "🌙",
    spine: "from-[#6366f1] to-[#4338ca]",
    cover:
      "from-[#a78bfa] via-[#818cf8] to-[#4f46e5] ring-[#c4b5fd]/55",
    accent: "text-indigo-100",
    glow: "167, 139, 250",
  },
  "el-ascensor-de-las-sorpresas": {
    id: "elevator",
    emoji: "🛗",
    spine: "from-[#f59e0b] to-[#d97706]",
    cover:
      "from-[#fde047] via-[#fbbf24] to-[#f59e0b] ring-[#fef08a]/60",
    accent: "text-amber-950",
    glow: "251, 191, 36",
  },
  "pauleta-y-el-tren-del-bosque": {
    id: "train",
    emoji: "🚂",
    spine: "from-[#0ea5e9] to-[#0369a1]",
    cover:
      "from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] ring-[#7dd3fc]/55",
    accent: "text-sky-100",
    glow: "56, 189, 248",
  },
  "mision-mercado-paloquemao": {
    id: "market",
    emoji: "🍎",
    spine: "from-[#e11d48] to-[#9f1239]",
    cover:
      "from-[#fb7185] via-[#f43f5e] to-[#be123c] ring-[#fda4af]/55",
    accent: "text-rose-100",
    glow: "251, 113, 133",
  },
  "nico-dia-sin-pantallas": {
    id: "play",
    emoji: "🎮",
    spine: "from-[#14b8a6] to-[#0f766e]",
    cover:
      "from-[#5eead4] via-[#2dd4bf] to-[#0d9488] ring-[#99f6e4]/55",
    accent: "text-teal-100",
    glow: "45, 212, 191",
  },
  "chacachon-en-la-luna": {
    id: "moon",
    emoji: "🚀",
    spine: "from-[#a855f7] to-[#7e22ce]",
    cover:
      "from-[#d8b4fe] via-[#c084fc] to-[#9333ea] ring-[#e9d5ff]/55",
    accent: "text-purple-100",
    glow: "192, 132, 252",
  },
  "crear-cuento": {
    id: "create",
    emoji: "✨",
    spine: "from-[#fbbf24] to-[#b45309]",
    cover:
      "from-[#fde68a] via-[#fbbf24] to-[#f59e0b] ring-[#fef08a]/65",
    accent: "text-amber-950",
    glow: "251, 191, 36",
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

export function spineTitle(title: string): string {
  const words = title.split(/\s+/);
  if (words.length <= 4) return title;
  return `${words[0]} ${words[1]}…`;
}

export function isStorySoon(status: string, openPath?: string | null): boolean {
  return status !== "PUBLISHED" || !openPath;
}
