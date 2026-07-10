import { describe, expect, it } from "vitest";
import { guardGenerateStoryRequest } from "@/lib/generate-story-guards";

const validBody = {
  selection: {
    heroes: [
      { id: "p-nico", kind: "persona", label: "Nico", emoji: "" },
    ],
    reto: [
      { id: "dil-dormir", kind: "dilema", label: "Ir a dormir", emoji: "" },
    ],
    aprenden: [],
    lugar: [],
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
  },
  accentCode: "neutro",
};

describe("guardGenerateStoryRequest", () => {
  it("exige sesión (401)", () => {
    const result = guardGenerateStoryRequest({
      userId: null,
      body: validBody,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
    }
  });

  it("acepta receta válida", () => {
    const result = guardGenerateStoryRequest({
      userId: "user-1",
      body: validBody,
    });
    expect(result.ok).toBe(true);
  });

  it("rechaza sin protagonista", () => {
    const result = guardGenerateStoryRequest({
      userId: "user-1",
      body: {
        ...validBody,
        selection: { ...validBody.selection, heroes: [] },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/protagonista/i);
    }
  });

  it("rechaza texto libre inapropiado", () => {
    const result = guardGenerateStoryRequest({
      userId: "user-1",
      body: {
        ...validBody,
        selection: {
          ...validBody.selection,
          heroes: [
            {
              id: "custom",
              kind: "persona",
              label: "https://spam.com",
              emoji: "",
            },
          ],
        },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/enlaces/i);
    }
  });
});
