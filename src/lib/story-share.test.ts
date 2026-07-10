import { describe, expect, it } from "vitest";
import {
  buildCatalogStoryMetadata,
  buildCatalogStoryShareMessage,
  catalogStoryOgImagePath,
  catalogStoryPath,
  isCatalogStorySlug,
  whatsAppShareUrl,
} from "@/lib/story-share";

describe("isCatalogStorySlug", () => {
  it("acepta slugs de catálogo", () => {
    expect(isCatalogStorySlug("operacion-a-dormir")).toBe(true);
  });

  it("rechaza cuentos generados", () => {
    expect(isCatalogStorySlug("generado/abc-123")).toBe(false);
  });
});

describe("catalogStoryPath", () => {
  it("arma la ruta del lector", () => {
    expect(catalogStoryPath("el-lobo-y-las-palabras")).toBe(
      "/leer/el-lobo-y-las-palabras",
    );
  });
});

describe("buildCatalogStoryMetadata", () => {
  it("incluye imagen OG por cuento", () => {
    const meta = buildCatalogStoryMetadata(
      "operacion-a-dormir",
      "Operación a dormir",
      "Un cuento para la hora de acostarse.",
    );
    expect(meta.openGraph?.images).toEqual([
      {
        url: "/leer/operacion-a-dormir/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Operación a dormir",
      },
    ]);
    expect(catalogStoryOgImagePath("operacion-a-dormir")).toBe(
      "/leer/operacion-a-dormir/opengraph-image",
    );
  });
});

describe("share helpers", () => {
  it("arma mensaje y enlace de WhatsApp", () => {
    const message = buildCatalogStoryShareMessage(
      "Tres cerditos",
      "https://chacachon-stories.vercel.app/leer/cerditos",
    );
    expect(message).toContain("Tres cerditos");
    expect(whatsAppShareUrl(message)).toContain("wa.me");
  });
});
