import { z } from "zod";
import { storyAccentCodeSchema } from "@/lib/story-accent";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";

/** Ingrediente tal como viaja del cliente al backend (subconjunto serializable). */
export const recipeIngredientSchema = z.object({
  id: z.string().trim().min(1).max(80),
  kind: z.enum([
    "persona",
    "mascota",
    "emocion",
    "dilema",
    "lugar",
    "objeto",
    "molde",
  ]),
  label: z.string().trim().min(1).max(80),
  emoji: z.string().trim().max(16).optional().default(""),
  hint: z.string().trim().max(400).optional(),
});

/** Selección completa de la receta (una casilla por zona del wizard). */
export const recipeSelectionSchema = z.object({
  heroes: z.array(recipeIngredientSchema).max(3),
  reto: z.array(recipeIngredientSchema).max(1),
  aprenden: z.array(recipeIngredientSchema).max(2),
  lugar: z.array(recipeIngredientSchema).max(1),
  mascota: z.array(recipeIngredientSchema).max(1),
  acompanantes: z.array(recipeIngredientSchema).max(4),
  rolReto: z.array(recipeIngredientSchema).max(1),
  objeto: z.array(recipeIngredientSchema).max(2),
  molde: z.array(recipeIngredientSchema).max(1),
});

export type RecipeSelectionPayload = z.infer<typeof recipeSelectionSchema>;

/** Cuerpo de POST /api/cuentos/generar */
export const generateStoryRequestSchema = z.object({
  selection: recipeSelectionSchema,
  /** Default en servidor: `neutro` (español neutro colombiano). */
  accentCode: storyAccentCodeSchema.optional(),
});

export type GenerateStoryRequest = z.infer<typeof generateStoryRequestSchema>;

/** Regla mínima: sin protagonista ni reto no hay cuento que generar. */
export function selectionMissingRequired(
  selection: RecipeSelectionPayload,
): string | null {
  if (selection.heroes.length === 0) return "Elige al menos un protagonista.";
  if (selection.reto.length === 0) return "Elige el reto del cuento.";
  return null;
}

/**
 * Adapta el payload validado al tipo que usan los helpers de resumen/receta.
 * La forma es idéntica; el cast documenta la intención.
 */
export function toSelectionSlice(
  payload: RecipeSelectionPayload,
): RecipeSelectionSlice {
  return payload as unknown as RecipeSelectionSlice;
}
