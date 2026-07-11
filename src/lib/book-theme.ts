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
