import { describe, expect, it } from "vitest";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { personalizeStoryText } from "@/lib/story-personalization";

const chacachonProfile: FamilyProfileDocument = {
  meta: {
    ciudad: "Cali",
    apellido_hogar: "García",
    como_le_dicen_al_hogar: "la finca",
  },
  adultos: [
    { id: "a1", rol: "mama", nombre: "María", apodo: "Mari" },
    { id: "a2", rol: "papa", nombre: "Pedro", apodo: "Peto" },
  ],
  ninos: [
    { id: "n1", nombre: "Juan", apodo: "Juanchi", orden: 1 },
    { id: "n2", nombre: "Luisa", apodo: "Luisita", orden: 2 },
  ],
  mascotas: [
    { id: "m1", nombre: "Firulais" },
    { id: "m2", nombre: "Michi" },
  ],
};

describe("personalizeStoryText", () => {
  it("interpola placeholders explícitos", () => {
    const text = personalizeStoryText(
      "Buenas noches, {{niño_1}}.",
      chacachonProfile,
      { useCanonReplacements: false },
    );
    expect(text).toBe("Buenas noches, Juanchi.");
  });

  it("sustituye canon Chacachón en markdown", () => {
    const text = personalizeStoryText(
      "Nico y Pauleta en Bogotá con Bingo.",
      chacachonProfile,
      { useCanonReplacements: true, familyTag: "chacachon" },
    );
    expect(text).toContain("Juanchi");
    expect(text).toContain("Mari");
    expect(text).toContain("Cali");
    expect(text).toContain("Firulais");
  });

  it("no aplica canon para familyTag balcutron", () => {
    const text = personalizeStoryText("Nico en Bogotá", chacachonProfile, {
      useCanonReplacements: true,
      familyTag: "balcutron",
    });
    expect(text).toBe("Nico en Bogotá");
  });
});
