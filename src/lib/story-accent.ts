import { z } from "zod";

/** Códigos alineados con GuiaAcentos.md (`codigo_acento`). */
export const STORY_ACCENT_CODES = [
  "neutro",
  "bogota_rolo",
  "bogota_ninos",
  "bogota_cachaco",
] as const;

export type StoryAccentCode = (typeof STORY_ACCENT_CODES)[number];

export const DEFAULT_STORY_ACCENT: StoryAccentCode = "neutro";

export const storyAccentCodeSchema = z.enum(STORY_ACCENT_CODES);

/** Opciones visibles en el wizard de /crear (MVP). */
export const STORY_ACCENT_OPTIONS: {
  code: StoryAccentCode;
  label: string;
  hint: string;
}[] = [
  {
    code: "neutro",
    label: "Neutro colombiano",
    hint: "Español claro para toda Colombia — recomendado",
  },
  {
    code: "bogota_rolo",
    label: "Bogotano rolo",
    hint: "Parce, boleta, humor de ciudad sin exagerar",
  },
  {
    code: "bogota_ninos",
    label: "Bogotano actual",
    hint: "Vocabulario de niños bogotanos de hoy, suave",
  },
  {
    code: "bogota_cachaco",
    label: "Bogotano cachaco",
    hint: "Nono, pelafustán — humor generacional",
  },
];

export function isStoryAccentCode(value: string): value is StoryAccentCode {
  return (STORY_ACCENT_CODES as readonly string[]).includes(value);
}

export function resolveStoryAccent(
  requested?: string | null,
): StoryAccentCode {
  if (requested && isStoryAccentCode(requested)) return requested;
  return DEFAULT_STORY_ACCENT;
}

/** Instrucciones de voz según acento elegido (tier 1). */
export function accentVoiceInstructions(code: StoryAccentCode): string {
  switch (code) {
    case "neutro":
      return `Voz y registro (neutro colombiano — DEFAULT):
- Español latinoamericano claro, cálido y natural; comprensible en todo el país.
- Cotidianidad colombiana sin saturar modismos: casa, colegio, familia, ciudad.
- Máximo 0–1 modismo local por párrafo; prioriza palabras universales.
- Detalles sensoriales concretos (olores, sonidos del hogar, clima).`;
    case "bogota_rolo":
      return `Voz y registro (bogotano rolo, tier 1):
- Español bogotano cotidiano; humor de ciudad sin caricatura.
- Máximo 2–3 modismos por párrafo (parce, boleta, pilo, de una, bacano).
- Escenas urbanas bogotanas cuando encajen: edificio, TransMilenio, trancon.`;
    case "bogota_ninos":
      return `Voz y registro (bogotano actual / niños, tier 1):
- Vocabulario de niños bogotanos de hoy, suavizado para lectura familiar (hasta ~12 años).
- Máximo 2–4 modismos por párrafo (parce, pilas, chimba, en serio, bro).
- NO uses nono, pelafustán, ah carachas (son cachacos — ver GuiaAcentos).`;
    case "bogota_cachaco":
      return `Voz y registro (bogotano cachaco / nostalgia, tier 1–2):
- Humor generacional; modismos de papás/abuelos bogotanos.
- Usar con moderación: nono, pelafustán, chirriado, ah carachas.
- Máximo 2–3 marcas cachacas por párrafo; el niño debe entender la acción.`;
    default:
      return accentVoiceInstructions(DEFAULT_STORY_ACCENT);
  }
}

export function accentLabel(code: StoryAccentCode): string {
  return (
    STORY_ACCENT_OPTIONS.find((o) => o.code === code)?.label ?? "Neutro colombiano"
  );
}
