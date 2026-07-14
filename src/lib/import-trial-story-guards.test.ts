import { describe, expect, it } from "vitest";
import { guardImportTrialStoryRequest } from "@/lib/import-trial-story-guards";

const validBody = {
  markdown: "# Un cuento\n> Subtítulo\n\nHabía una vez...",
  name: "Nico",
  path: "moment",
  ageBandId: "6-8",
  momentId: "dormir",
  classicId: null,
  source: "gemini",
};

describe("guardImportTrialStoryRequest", () => {
  it("exige sesión (401)", () => {
    const result = guardImportTrialStoryRequest({
      userId: null,
      body: validBody,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(401);
  });

  it("acepta un cuerpo válido", () => {
    const result = guardImportTrialStoryRequest({
      userId: "user-1",
      body: validBody,
    });
    expect(result.ok).toBe(true);
  });

  it("rechaza markdown vacío", () => {
    const result = guardImportTrialStoryRequest({
      userId: "user-1",
      body: { ...validBody, markdown: "" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("rechaza contenido no permitido", () => {
    const result = guardImportTrialStoryRequest({
      userId: "user-1",
      body: { ...validBody, markdown: "Visita https://spam.com ya" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("rechaza JSON con forma inesperada", () => {
    const result = guardImportTrialStoryRequest({
      userId: "user-1",
      body: "not-an-object",
    });
    expect(result.ok).toBe(false);
  });
});
