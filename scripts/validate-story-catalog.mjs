#!/usr/bin/env node
/**
 * Valida alineación entre manifest, seed y redirects.
 * Sale con código 1 si hay drift.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const manifest = JSON.parse(
  readFileSync(path.join(root, "src/data/story-content-manifest.json"), "utf8"),
);
const redirects = JSON.parse(
  readFileSync(path.join(root, "src/data/story-redirects.json"), "utf8"),
);
const seedSource = readFileSync(path.join(root, "prisma/seed.ts"), "utf8");

const manifestSlugs = new Set(Object.keys(manifest.sources));
const redirectDestinations = new Set(
  redirects.map((r) => r.destination.replace(/^\/leer\//, "")),
);

const publishedChacachonSlugs = [
  "el-lobo-y-las-palabras",
  "cerditos-del-edificio",
  "operacion-a-dormir",
  "nico-dia-sin-pantallas",
];

const errors = [];

for (const slug of publishedChacachonSlugs) {
  if (!manifestSlugs.has(slug)) {
    errors.push(`manifest: falta slug publicado "${slug}"`);
  }
  if (!redirectDestinations.has(slug)) {
    errors.push(`redirects: falta /leer/${slug}`);
  }
  if (!seedSource.includes(`slug: "${slug}"`)) {
    errors.push(`seed: falta slug "${slug}"`);
  }
}

for (const slug of manifestSlugs) {
  const source = manifest.sources[slug];
  if (!source.slug) {
    errors.push(`manifest: entrada "${slug}" sin slug`);
  }
  if (source.slug !== slug) {
    errors.push(
      `manifest: clave "${slug}" ≠ source.slug "${source.slug}"`,
    );
  }
}

if (errors.length > 0) {
  console.error("validate-story-catalog: errores\n");
  for (const err of errors) console.error(`  ✗ ${err}`);
  process.exit(1);
}

console.log(
  `validate-story-catalog: OK (${manifestSlugs.size} en manifest, ${redirects.length} redirects)`,
);
