import { describe, expect, it } from "vitest";
import type { StoryBlock } from "@/lib/story-markdown";
import {
  advanceBlockIndexAfterPending,
  buildTryBlocks,
  peelTrailingOrphanHeading,
} from "@/lib/story-book-dom-pagination";

const blocks: StoryBlock[] = [
  { type: "paragraph", text: "Párrafo A completo que ya se partió." },
  { type: "paragraph", text: "Párrafo B siguiente." },
  { type: "paragraph", text: "Párrafo C final." },
];

describe("buildTryBlocks con pending", () => {
  it("no reinyecta el párrafo fuente ya partido", () => {
    const pending = "…continuación del párrafo A.";
    const page = buildTryBlocks(blocks, 0, 2, pending);
    expect(page).toEqual([
      { type: "paragraph", text: pending },
      { type: "paragraph", text: "Párrafo B siguiente." },
    ]);
    expect(page.some((b) => b.type === "paragraph" && b.text.includes("completo"))).toBe(
      false,
    );
  });

  it("solo el sufijo cuando tryCount es 1", () => {
    const pending = "sufijo";
    expect(buildTryBlocks(blocks, 0, 1, pending)).toEqual([
      { type: "paragraph", text: "sufijo" },
    ]);
  });
});

describe("advanceBlockIndexAfterPending", () => {
  it("salta el bloque fuente tras consumir el pending", () => {
    // fitCount=1: solo cabía el sufijo → siguiente es el bloque 1
    expect(advanceBlockIndexAfterPending(0, 1)).toBe(1);
    // fitCount=2: sufijo + un bloque entero → siguiente es el 2
    expect(advanceBlockIndexAfterPending(0, 2)).toBe(2);
  });
});

describe("peelTrailingOrphanHeading", () => {
  it("mueve un ## del final de página a la siguiente", () => {
    const pageBlocks: StoryBlock[] = [
      { type: "paragraph", text: "Fin de la escena." },
      { type: "heading", text: "El reto" },
    ];
    expect(peelTrailingOrphanHeading(pageBlocks, 5)).toEqual({
      pageBlocks: [{ type: "paragraph", text: "Fin de la escena." }],
      nextIndex: 4,
    });
  });

  it("no pela si el ## es el único bloque", () => {
    const pageBlocks: StoryBlock[] = [{ type: "heading", text: "El reto" }];
    expect(peelTrailingOrphanHeading(pageBlocks, 2)).toEqual({
      pageBlocks,
      nextIndex: 2,
    });
  });
});
