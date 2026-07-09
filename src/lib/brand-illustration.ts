/** Ilustración luna + cuento (PNG/WebP con alpha). */
export const BRAND_ILLUSTRATION = {
  png: "/images/brand/hero-luna-chacachon.png",
  webp: "/images/brand/hero-luna-chacachon.webp",
  width: 557,
  height: 574,
} as const;

export function brandIllustrationDimensions(height: number): {
  width: number;
  height: number;
} {
  const width = Math.round((height * BRAND_ILLUSTRATION.width) / BRAND_ILLUSTRATION.height);
  return { width, height };
}
