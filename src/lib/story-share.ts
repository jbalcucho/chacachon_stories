import type { Metadata } from "next";

export const STORY_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Catálogo publicado (`/leer/[slug]`). Los generados (`generado/uuid`) no se comparten. */
export function isCatalogStorySlug(slug: string): boolean {
  return slug.length > 0 && !slug.includes("/");
}

export function catalogStoryPath(slug: string): string {
  return `/leer/${slug}`;
}

export function catalogStoryOgImagePath(slug: string): string {
  return `${catalogStoryPath(slug)}/opengraph-image`;
}

/** Texto corto para WhatsApp u otras apps de mensajería. */
export function buildCatalogStoryShareMessage(
  title: string,
  absoluteUrl: string,
): string {
  return `${title} — un cuento de Chacachón para leer en familia\n${absoluteUrl}`;
}

export function whatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Metadata Open Graph/Twitter para un cuento del catálogo. */
export function buildCatalogStoryMetadata(
  slug: string,
  title: string,
  description?: string | null,
): Metadata {
  const url = catalogStoryPath(slug);
  const image = catalogStoryOgImagePath(slug);

  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description: description ?? undefined,
      images: [{ url: image, ...STORY_OG_IMAGE_SIZE, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: [image],
    },
  };
}
