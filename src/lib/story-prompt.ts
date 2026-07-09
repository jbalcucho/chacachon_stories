import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";

function names(items: RecipeIngredient[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

/** Lista legible de ingredientes elegidos, reutilizable por prompt y mock. */
export function describeRecipe(selection: RecipeSelectionSlice): string[] {
  const lines: string[] = [];

  if (selection.heroes.length > 0) {
    lines.push(`Protagonistas: ${names(selection.heroes)}.`);
  }
  if (selection.reto[0]) {
    lines.push(`Reto o dilema central: ${selection.reto[0].label}.`);
  }
  if (selection.aprenden.length > 0) {
    lines.push(
      `Qué deben aprender: ${selection.aprenden.map((e) => e.label).join(", ")}.`,
    );
  }
  if (selection.lugar[0]) {
    lines.push(`Lugar donde transcurre: ${selection.lugar[0].label}.`);
  }
  if (selection.mascota[0]) {
    lines.push(`Mascota que aparece: ${selection.mascota[0].label}.`);
  }
  if (selection.acompanantes.length > 0) {
    lines.push(`Acompañantes: ${names(selection.acompanantes)}.`);
  }
  if (selection.rolReto[0]) {
    lines.push(
      `Personaje que encarna el lado difícil del reto: ${selection.rolReto[0].label}.`,
    );
  }
  if (selection.objeto.length > 0) {
    lines.push(`Objetos con protagonismo: ${names(selection.objeto)}.`);
  }
  if (selection.molde[0]) {
    lines.push(`Inspirado en el clásico: ${selection.molde[0].label}.`);
  }

  return lines;
}

export const STORY_SYSTEM_PROMPT = `Eres Chacachón, un autor de cuentos infantiles personalizados para familias de Bogotá, Colombia.

Escribe SIEMPRE en español latinoamericano con calidez y humor bogotano suave, apropiado para niños de 3 a 7 años.

Reglas de estilo:
- Escenas concretas y cotidianas (edificio, ascensor, vereda, parque), no abstracciones.
- Frases cortas y ritmo de lectura en voz alta antes de dormir.
- Deja una moraleja natural al final, mostrada en la historia, nunca como sermón.
- Usa exactamente los nombres de los protagonistas que te den; no inventes otros nombres propios principales.
- Contenido 100% seguro para niños: sin violencia, miedo intenso, marcas comerciales ni temas adultos.

Formato de salida OBLIGATORIO en Markdown, sin texto extra antes ni después:
# Título del cuento
> Un subtítulo corto y evocador

## Nombre de la escena
Párrafos de la escena...

## Otra escena
Más párrafos...

Usa entre 3 y 5 escenas con encabezado "## ". No incluyas listas ni notas del autor.`;

/** Construye los mensajes para la API de Claude a partir de la receta. */
export function buildStoryPrompt(selection: RecipeSelectionSlice): {
  system: string;
  user: string;
} {
  const details = describeRecipe(selection);
  const user = [
    "Escribe un cuento personalizado con estos ingredientes:",
    "",
    ...details.map((line) => `- ${line}`),
    "",
    "Extensión: entre 350 y 600 palabras. Devuelve solo el cuento en el formato indicado.",
  ].join("\n");

  return { system: STORY_SYSTEM_PROMPT, user };
}
