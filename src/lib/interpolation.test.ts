import { describe, expect, it } from "vitest";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { interpolate, resolveProfileVariables } from "@/lib/interpolation";

const sampleProfile: FamilyProfileDocument = {
  meta: {
    ciudad: "Medellín",
    apellido_hogar: "Pérez",
    como_le_dicen_al_hogar: "la casa",
  },
  adultos: [
    { id: "a1", rol: "mama", nombre: "Ana", apodo: "Mamá" },
    { id: "a2", rol: "papa", nombre: "Luis", apodo: "Papá" },
  ],
  ninos: [
    { id: "n1", nombre: "Tomás", apodo: "Tom", orden: 1 },
    { id: "n2", nombre: "Sara", apodo: "Sarita", orden: 2 },
  ],
};

describe("interpolation", () => {
  it("resuelve variables básicas del perfil", () => {
    const vars = resolveProfileVariables(sampleProfile);
    expect(vars.niño_1).toBe("Tom");
    expect(vars.mama).toBe("Mamá");
    expect(vars.ciudad).toBe("Medellín");
  });

  it("interpola plantilla con escape HTML", () => {
    const text = interpolate("Hola {{niño_1}}", resolveProfileVariables(sampleProfile));
    expect(text).toBe("Hola Tom");
  });
});
