import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BRAND_ILLUSTRATION } from "@/lib/brand-illustration";

let cachedDataUrl: string | null = null;

/** Para tarjetas Open Graph (Satori / ImageResponse). */
export function getBrandIllustrationDataUrl(): string {
  if (cachedDataUrl) return cachedDataUrl;
  const path = join(process.cwd(), "public", BRAND_ILLUSTRATION.png);
  const buffer = readFileSync(path);
  cachedDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return cachedDataUrl;
}
