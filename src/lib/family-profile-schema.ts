import { z } from "zod";

const fraseSchema = z.string().trim().min(1).max(120);

export const adultRoleSchema = z.enum([
  "mama",
  "papa",
  "madrastra",
  "padrastro",
  "cuidador",
  "otro",
]);

export const adultSchema = z.object({
  id: z.string().min(1),
  rol: adultRoleSchema,
  nombre: z.string().trim().min(1).max(80),
  apodo: z.string().trim().max(80).optional(),
  frases_tipicas: z.array(fraseSchema).max(5).optional(),
  extra: z.record(z.unknown()).optional(),
});

export const childSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().trim().min(1).max(80),
  apodo: z.string().trim().max(80).optional(),
  fecha_nacimiento: z.string().optional(),
  orden: z.number().int().min(1).max(6).optional(),
  frases_tipicas: z.array(fraseSchema).max(5).optional(),
  gustos: z
    .object({
      comida: z.array(z.string()).optional(),
      ropa: z.array(z.string()).optional(),
      peliculas: z.array(z.string()).optional(),
      juegos: z.array(z.string()).optional(),
      amigos: z.array(z.string()).optional(),
    })
    .optional(),
  no_le_gusta: z
    .object({
      dormir: z.string().optional(),
      comida: z.array(z.string()).optional(),
      ropa: z.array(z.string()).optional(),
    })
    .optional(),
  pantallas: z
    .object({
      le_cuesta_soltar: z.boolean().optional(),
      que_usa: z.string().optional(),
      juego_favorito: z.string().optional(),
    })
    .optional(),
  extra: z.record(z.unknown()).optional(),
});

/** Capa esencial (~2 min) — suficiente para {{niño_1}}, {{mama}}, {{papa}}. */
export const familyProfileEssentialSchema = z.object({
  meta: z
    .object({
      ciudad: z.string().trim().max(80).optional(),
      barrio: z.string().trim().max(120).optional(),
      codigo_acento: z.string().trim().max(40).optional(),
      como_le_dicen_al_hogar: z.string().trim().max(80).optional(),
      apellido_hogar: z.string().trim().max(80).optional(),
    })
    .optional(),
  adultos: z.array(adultSchema).min(1).max(4),
  ninos: z.array(childSchema).min(1).max(6),
  mascotas: z
    .array(
      z.object({
        id: z.string().min(1),
        nombre: z.string().trim().min(1).max(80),
        personalidad: z.string().trim().max(120).optional(),
        extra: z.record(z.unknown()).optional(),
      }),
    )
    .max(5)
    .optional(),
  cercanos: z.array(z.record(z.unknown())).optional(),
  casa: z.record(z.unknown()).optional(),
  extra: z.record(z.unknown()).optional(),
});

export type FamilyProfileDocument = z.infer<typeof familyProfileEssentialSchema>;

export const familyProfilePutSchema = z.object({
  schemaVersion: z.number().int().min(1).default(1),
  perfil: familyProfileEssentialSchema,
});

export type FamilyProfilePutInput = z.infer<typeof familyProfilePutSchema>;

export function newEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
