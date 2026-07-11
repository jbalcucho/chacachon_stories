import { describe, expect, it } from "vitest";
import {
  hasPersonalizedReader,
  resolveStoryOpenPath,
} from "@/lib/story-content-index";

describe("story-content-index", () => {
  it("conoce cuentos del manifest", () => {
    expect(hasPersonalizedReader("hora-del-nono")).toBe(true);
    expect(hasPersonalizedReader("no-existe")).toBe(false);
  });

  it("resuelve openPath a /leer cuando hay fuente", () => {
    expect(
      resolveStoryOpenPath({
        slug: "hora-del-nono",
        status: "PUBLISHED",
        htmlPath: "/cuentos/x.html",
      }),
    ).toBe("/leer/hora-del-nono");
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
