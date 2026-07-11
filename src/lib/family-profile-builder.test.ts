import { describe, expect, it } from "vitest";
import {
  assessFamilyReadiness,
  buildFamilyPreviewSentence,
  createAdultDraft,
  createChildDraft,
  createPetDraft,
  emptyFamilyBuilderState,
  familyBuilderFromDocument,
  familyBuilderToDocument,
  moveChild,
  reorderChildren,
} from "@/lib/family-profile-builder";

describe("family-profile-builder", () => {
  it("marca listo solo con niño + adulto", () => {
    const empty = assessFamilyReadiness(emptyFamilyBuilderState());
    expect(empty.ready).toBe(false);

    const ready = assessFamilyReadiness({
      ...emptyFamilyBuilderState(),
      ninos: [createChildDraft({ nombre: "Nicolás", apodo: "Nico" })],
      adultos: [createAdultDraft({ nombre: "Julie", rol: "mama" })],
    });
    expect(ready.ready).toBe(true);
    expect(ready.completeness).toBeGreaterThanOrEqual(70);
  });

  it("arma preview en lenguaje natural", () => {
    const sentence = buildFamilyPreviewSentence({
      home: { ciudad: "Medellín", hogar: "el apartamento", apellido: "" },
      ninos: [createChildDraft({ nombre: "Nicolás", apodo: "Nico" })],
      adultos: [createAdultDraft({ nombre: "Julie", apodo: "Pauleta" })],
      mascotas: [createPetDraft({ nombre: "Bingo" })],
    });
    expect(sentence).toContain("el apartamento");
    expect(sentence).toContain("Nico");
    expect(sentence).toContain("Pauleta");
    expect(sentence).toContain("Bingo");
    expect(sentence).toContain("Medellín");
  });

  it("round-trip document ↔ builder conserva traits", () => {
    const state = {
      home: { ciudad: "Cali", hogar: "la casa", apellido: "García" },
      ninos: [
        createChildDraft({
          nombre: "Sofía",
          traits: ["pantallas", "dormir"],
        }),
      ],
      adultos: [
        createAdultDraft({
          nombre: "Ana",
          rol: "mama",
          frase: "A dormir ya",
        }),
      ],
      mascotas: [createPetDraft({ nombre: "Luna", personalidad: "miedosa" })],
    };

    const doc = familyBuilderToDocument(state);
    expect(doc.ninos[0]?.pantallas?.le_cuesta_soltar).toBe(true);
    expect(doc.adultos[0]?.frases_tipicas?.[0]).toBe("A dormir ya");
    expect(doc.meta?.codigo_acento).toBe("neutro");

    const back = familyBuilderFromDocument(doc);
    expect(back.ninos[0]?.traits).toContain("pantallas");
    expect(back.ninos[0]?.traits).toContain("dormir");
    expect(back.mascotas[0]?.personalidad).toBe("miedosa");
  });

  it("reordena niños", () => {
    const a = createChildDraft({ id: "a", nombre: "A", orden: 1 });
    const b = createChildDraft({ id: "b", nombre: "B", orden: 2 });
    const c = createChildDraft({ id: "c", nombre: "C", orden: 3 });
    const moved = reorderChildren([a, b, c], "c", "a");
    expect(moved.map((n) => n.id)).toEqual(["c", "a", "b"]);
    expect(moveChild([a, b], "a", 1).map((n) => n.id)).toEqual(["b", "a"]);
  });
});
