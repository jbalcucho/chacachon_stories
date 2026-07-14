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

const allowEmpty = process.env.ALLOW_EMPTY_CATALOG === "1";
const errors = [];

if (manifestSlugs.size === 0 && !allowEmpty) {
  errors.push(
    "manifest vacío (0 cuentos) — falla para evitar falso positivo. " +
      "Si es esperado (rama de desarrollo temprano), corre con ALLOW_EMPTY_CATALOG=1.",
  );
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

for (const redirect of redirects) {
  const slug = redirect.destination.replace(/^\/leer\//, "");
  if (!seedSource.includes(`slug: "${slug}"`)) {
    errors.push(`redirects: /leer/${slug} sin entrada en seed`);
  }
  if (!redirectDestinations.has(slug)) {
    errors.push(`redirects: destino inválido ${redirect.destination}`);
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
