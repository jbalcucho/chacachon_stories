import { describe, expect, it } from "vitest";
import {
  hasPersonalizedReader,
  resolveStoryOpenPath,
} from "@/lib/story-content-index";

describe("story-content-index", () => {
  it("conoce cuentos del manifest", () => {
    expect(hasPersonalizedReader("operacion-a-dormir")).toBe(true);
    expect(hasPersonalizedReader("no-existe")).toBe(false);
  });

  it("resuelve openPath a /leer cuando hay fuente", () => {
    expect(
      resolveStoryOpenPath({
        slug: "operacion-a-dormir",
        status: "PUBLISHED",
        htmlPath: "/cuentos/x.html",
      }),
    ).toBe("/leer/operacion-a-dormir");
  });

  it("cae a htmlPath si no hay fuente personalizada", () => {
    expect(
      resolveStoryOpenPath({
        slug: "balcutron-operacion-a-dormir",
        status: "PUBLISHED",
        htmlPath: "/cuentos/familia-balcutron-operacion-a-dormir.html",
      }),
    ).toBe("/cuentos/familia-balcutron-operacion-a-dormir.html");
  });
});
