import { describe, expect, it } from "vitest";
import {
  parseBodyBlocks,
  parseStoryHeader,
  sanitizeFairyTaleOpening,
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

  it("degrada ## narrativos largos a párrafo (no título rojo)", () => {
    const blocks = parseBodyBlocks(
      "## En la sala, Nico apretaba la tablet como un tesoro y no quería soltarla.\n\nDespués jugó sin pantallas.",
    );
    expect(blocks[0]).toEqual({
      type: "paragraph",
      text: "En la sala, Nico apretaba la tablet como un tesoro y no quería soltarla.",
    });
    expect(blocks[1]?.type).toBe("paragraph");
  });

  it("quita negrita que envuelve todo el párrafo", () => {
    const blocks = parseBodyBlocks(
      "**Nico puso la tablet a dormir primero y respiró hondo.**",
    );
    expect(blocks[0]).toEqual({
      type: "paragraph",
      text: "Nico puso la tablet a dormir primero y respiró hondo.",
    });
  });

  it("quita basura pegada antes de Había una vez", () => {
    const raw = [
      "# El tesoro de la sala",
      "",
      "> Un misterio en el sofá",
      "",
      "## El comienzo",
      "",
      "La luz de la pantalla Había una vez un niño llamado Nico que buscaba la tablet.",
      "",
      "Después suspiró.",
    ].join("\n");
    const fixed = sanitizeFairyTaleOpening(raw);
    expect(fixed).toContain(
      "Había una vez un niño llamado Nico que buscaba la tablet.",
    );
    expect(fixed).not.toMatch(/La luz de la pantalla Había/);
    expect(fixed).not.toContain("## El comienzo");
    expect(parseStoryHeader(fixed).title).toBe("El tesoro de la sala");
  });

  it("quita un párrafo atmosférico suelto antes de Había una vez", () => {
    const raw = [
      "# El tesoro",
      "",
      "## El comienzo",
      "",
      "La luz de la pantalla.",
      "",
      "Había una vez un niño llamado Nico.",
    ].join("\n");
    const fixed = sanitizeFairyTaleOpening(raw);
    expect(fixed).not.toContain("La luz de la pantalla.");
    expect(fixed).toContain("Había una vez un niño llamado Nico.");
  });

  it("corrige typo Habia un vez y basura pegada tipo El mundo de la sala", () => {
    const raw = [
      "# La misión del explorador de sombras",
      "",
      "## El mundo de la sala",
      "",
      "El mundo de la sala Habia un vez un niño llamado Nico.",
    ].join("\n");
    const fixed = sanitizeFairyTaleOpening(raw);
    expect(fixed).toContain("Había una vez un niño llamado Nico.");
    expect(fixed).not.toMatch(/El mundo de la sala Habia/i);
    expect(fixed).not.toContain("## El mundo de la sala");
  });

  it("recorta «la sala en silencio» aunque vaya en el mismo bloque ##", () => {
    const raw = [
      "# La misión",
      "",
      "## La sala en silencio",
      "Había una vez un niño llamado Nico.",
    ].join("\n");
    const fixed = sanitizeFairyTaleOpening(raw);
    expect(fixed.startsWith("# La misión")).toBe(true);
    expect(fixed).toContain("Había una vez un niño llamado Nico.");
    expect(fixed).not.toMatch(/sala en silencio/i);
  });

  it("parseBodyBlocks no deja «La sala en silencio» si está pegado a Había una vez", () => {
    const blocks = parseBodyBlocks(
      "## La sala en silencio\nHabía una vez un niño llamado Nico.",
    );
    expect(blocks).toEqual([
      {
        type: "paragraph",
        text: "Había una vez un niño llamado Nico.",
      },
    ]);
  });
});

describe("splitBlocksForPagination", () => {
  it("trocea párrafos largos de plantilla sin romper oraciones cortas", () => {
    const long = `${"Una frase. ".repeat(120)}Fin.`;
    const blocks = splitBlocksForPagination([
      { type: "paragraph", text: long },
      { type: "heading", text: "Capítulo" },
    ]);

    expect(blocks.length).toBeGreaterThan(2);
    expect(blocks.every((b) => b.type !== "paragraph" || b.text.length <= 900)).toBe(
      true,
    );
    expect(blocks.some((b) => b.type === "heading")).toBe(true);
  });
});
