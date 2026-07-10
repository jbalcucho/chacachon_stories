/**
 * Genera iconos de app (PWA + favicon) desde la ilustración de marca.
 * Luna más pequeña, fondo nocturno, texto «Chacachón Stories».
 *
 * Uso: npm run generate:icons
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BRAND_PNG = path.join(
  ROOT,
  "public/images/brand/hero-luna-chacachon.png",
);
const OUT_DIR = path.join(ROOT, "public/icons");
const APP_DIR = path.join(ROOT, "src/app");

/** Alineado con OG_NIGHT_BG en og-brand-mark.tsx */
const NIGHT_TOP = "#2a3d6e";
const NIGHT_MID = "#1a2848";
const NIGHT_BOTTOM = "#141f3d";
const HONEY = "#ffca5c";
const CREAM = "#eef2ff";

function backgroundSvg(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="${NIGHT_TOP}"/>
      <stop offset="45%" stop-color="${NIGHT_MID}"/>
      <stop offset="100%" stop-color="${NIGHT_BOTTOM}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#night)"/>
</svg>`);
}

function labelSvg(size) {
  const titleSize = Math.round(size * 0.082);
  const subSize = Math.round(size * 0.052);
  const titleY = Math.round(size * 0.9);
  const subY = Math.round(size * 0.965);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <text x="50%" y="${titleY}" text-anchor="middle"
    font-family="Fredoka, Nunito, system-ui, sans-serif"
    font-weight="700" font-size="${titleSize}" fill="${HONEY}">Chacachón</text>
  <text x="50%" y="${subY}" text-anchor="middle"
    font-family="Nunito, system-ui, sans-serif"
    font-weight="600" font-size="${subSize}" fill="${CREAM}">Stories</text>
</svg>`);
}

async function buildIcon(size, illustrationScale) {
  const illustMax = Math.round(size * illustrationScale);
  const illustration = await sharp(BRAND_PNG)
    .resize(illustMax, illustMax, { fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(illustration).metadata();
  const illustW = meta.width ?? illustMax;
  const illustH = meta.height ?? illustMax;
  const left = Math.round((size - illustW) / 2);
  const top = Math.round(size * 0.06);

  return sharp(backgroundSvg(size))
    .composite([
      { input: illustration, left, top },
      { input: labelSvg(size), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function writePng(buffer, filePath) {
  await writeFile(filePath, buffer);
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Generando iconos Chacachón Stories…");

  const icon512 = await buildIcon(512, 0.52);
  const icon512Maskable = await buildIcon(512, 0.42);
  const icon192 = await sharp(icon512).resize(192, 192).png().toBuffer();
  const apple180 = await sharp(icon512).resize(180, 180).png().toBuffer();
  const favicon32 = await sharp(icon512).resize(32, 32).png().toBuffer();

  await writePng(icon512, path.join(OUT_DIR, "icon-512.png"));
  await writePng(icon512Maskable, path.join(OUT_DIR, "icon-512-maskable.png"));
  await writePng(icon192, path.join(OUT_DIR, "icon-192.png"));
  await writePng(apple180, path.join(APP_DIR, "apple-icon.png"));
  await writePng(favicon32, path.join(APP_DIR, "icon.png"));

  console.log("Listo.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
