import { describe, expect, it } from "vitest";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { mergeFamilyProfile } from "@/lib/merge-family-profile";

const existing: FamilyProfileDocument = {
  meta: { ciudad: "Bogotá", apellido_hogar: "Chacachón" },
  adultos: [{ id: "adulto-mama", rol: "mama", nombre: "Julie", apodo: "Pauleta" }],
  ninos: [{ id: "nino-1", nombre: "Nicolás", apodo: "Nico", orden: 1 }],
  cercanos: [{ id: "abuela", relacion: "abuela", nombre: "Betty" }],
  casa: { detalles: ["aspiradora Josefina"] },
  extra: { colegio: { anterior: "Miska", actual: "Rosario" } },
};

describe("mergeFamilyProfile", () => {
  it("preserva cercanos y casa al actualizar capa esencial", () => {
    const incoming: FamilyProfileDocument = {
      meta: { ciudad: "Medellín", apellido_hogar: "García" },
      adultos: [{ id: "adulto-mama", rol: "mama", nombre: "Ana", apodo: "Mari" }],
      ninos: [{ id: "nino-1", nombre: "Tomás", apodo: "Tom", orden: 1 }],
      extra: { colegio: { actual: "San José" } },
    };

    const merged = mergeFamilyProfile(existing, incoming);
    expect(merged.cercanos).toHaveLength(1);
    expect(merged.casa?.detalles).toContain("aspiradora Josefina");
    expect(merged.meta?.ciudad).toBe("Medellín");
    expect((merged.extra as { colegio?: { actual?: string } })?.colegio?.actual).toBe(
      "San José",
    );
  });
});
