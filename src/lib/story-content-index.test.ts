import { describe, expect, it } from "vitest";
import {
  hasPersonalizedReader,
  resolveStoryOpenPath,
} from "@/lib/story-content-index";

describe("story-content-index", () => {
  it("no conoce slugs fuera del manifest", () => {
    expect(hasPersonalizedReader("no-existe")).toBe(false);
  });

  it("resuelve openPath a /leer cuando hay fuente", () => {
    // Sin fuentes en manifest (catálogo vacío), cae a htmlPath.
    expect(
      resolveStoryOpenPath({
        slug: "demo-futuro",
        status: "PUBLISHED",
        htmlPath: "/cuentos/demo.html",
      }),
    ).toBe("/cuentos/demo.html");
  });

  it("cae a htmlPath si no hay fuente personalizada", () => {
    expect(
      resolveStoryOpenPath({
        slug: "cuento-solo-html",
        status: "PUBLISHED",
        htmlPath: "/cuentos/solo-html.html",
      }),
    ).toBe("/cuentos/solo-html.html");
  });
});
