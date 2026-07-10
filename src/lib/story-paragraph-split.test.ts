import { describe, expect, it } from "vitest";
import {
  joinSentences,
  splitIntoSentences,
  splitIntoWords,
} from "@/lib/story-paragraph-split";

describe("splitIntoSentences", () => {
  it("parte oraciones por punto, signo de interrogación o exclamación", () => {
    expect(
      splitIntoSentences("Hola mundo. ¿Qué tal? ¡Bien!"),
    ).toEqual(["Hola mundo.", "¿Qué tal?", "¡Bien!"]);
  });

  it("mantiene diálogos con raya en una sola oración si no hay corte", () => {
    const text =
      "—Ya es hora —dijo Pauleta—. Nico suspiró pero apagó la tablet.";
    expect(splitIntoSentences(text)).toEqual([
      "—Ya es hora —dijo Pauleta—.",
      "Nico suspiró pero apagó la tablet.",
    ]);
  });

  it("devuelve el párrafo completo si no hay puntuación final", () => {
    expect(splitIntoSentences("solo una frase larga")).toEqual([
      "solo una frase larga",
    ]);
  });
});

describe("joinSentences", () => {
  it("une oraciones con espacio", () => {
    expect(joinSentences(["Uno.", "Dos."])).toBe("Uno. Dos.");
  });
});

describe("splitIntoWords", () => {
  it("separa por espacios", () => {
    expect(splitIntoWords("  hola   mundo ")).toEqual(["hola", "mundo"]);
  });
});
