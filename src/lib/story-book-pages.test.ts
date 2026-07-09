import { describe, expect, it } from "vitest";
import { buildBookPages, paginateMeasuredHeights } from "@/lib/story-book-pages";

describe("paginateMeasuredHeights", () => {
  it("agrupa unidades que caben en la página", () => {
    const pages = paginateMeasuredHeights([100, 120, 80, 200], 250);
    expect(pages).toEqual([[0, 1], [2], [3]]);
  });

  it("devuelve una página vacía si no hay unidades", () => {
    expect(paginateMeasuredHeights([], 300)).toEqual([[]]);
  });
});

describe("buildBookPages", () => {
  it("asigna título, subtítulo y bloques a las páginas", () => {
    const pages = buildBookPages(
      [40, 30, 100, 120],
      [
        [0, 1],
        [2, 3],
      ],
      [
        { type: "paragraph", text: "Primer párrafo" },
        { type: "paragraph", text: "Segundo párrafo" },
      ],
      true,
      true,
    );

    expect(pages[0].includeTitle).toBe(true);
    expect(pages[0].includeSubtitle).toBe(true);
    expect(pages[1].blocks).toHaveLength(2);
    expect(pages[1].blocks[0]?.type).toBe("paragraph");
    if (pages[1].blocks[0]?.type === "paragraph") {
      expect(pages[1].blocks[0].text).toBe("Primer párrafo");
    }
  });
});
