import { describe, expect, it } from "vitest";
import {
  parseBodyBlocks,
  parseStoryHeader,
  splitBlocksForPagination,
} from "@/lib/story-markdown";

describe("parseStoryHeader", () => {
  it("extrae título y subtítulo de cita", () => {
    const parsed = parseStoryHeader(
      "# El lobo\n\n> Versión narrativa\n> Tier 1\n\n---\n\nHabía una vez.",
    );
    expect(parsed.title).toBe("El lobo");
    expect(parsed.subtitle).toBe("Versión narrativa · Tier 1");
    expect(parsed.body).toBe("Había una vez.");
  });
});

describe("parseBodyBlocks", () => {
  it("detecta listas con viñetas", () => {
    const blocks = parseBodyBlocks("- Uno\n- Dos\n- Tres");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: false,
      items: ["Uno", "Dos", "Tres"],
    });
  });

  it("detecta listas numeradas", () => {
    const blocks = parseBodyBlocks("1. Primero\n2. Segundo");
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: true,
      items: ["Primero", "Segundo"],
    });
  });

  it("no confunde diálogo con raya (—) con una lista", () => {
    const blocks = parseBodyBlocks("—Oigan, parces —dijo Chacachón.");
    expect(blocks[0].type).toBe("paragraph");
  });

  it("conserva marcadores de negrita y cursiva en el texto", () => {
    const blocks = parseBodyBlocks("Un **lobo** muy *astuto*.");
    expect(blocks[0]).toEqual({
      type: "paragraph",
      text: "Un **lobo** muy *astuto*.",
    });
  });

  it("separa encabezados, separadores y párrafos", () => {
    const blocks = parseBodyBlocks("## Capítulo\n\n---\n\nTexto final.");
    expect(blocks.map((b) => b.type)).toEqual([
      "heading",
      "divider",
      "paragraph",
    ]);
  });
});

describe("splitBlocksForPagination", () => {
  it("trocea párrafos largos de plantilla sin romper oraciones cortas", () => {
    const long = `${"Una frase. ".repeat(80)}Fin.`;
    const blocks = splitBlocksForPagination([
      { type: "paragraph", text: long },
      { type: "heading", text: "Capítulo" },
    ]);

    expect(blocks.length).toBeGreaterThan(2);
    expect(blocks.every((b) => b.type !== "paragraph" || b.text.length <= 400)).toBe(
      true,
    );
    expect(blocks.some((b) => b.type === "heading")).toBe(true);
  });
});
