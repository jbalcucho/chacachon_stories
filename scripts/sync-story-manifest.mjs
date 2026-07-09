#!/usr/bin/env node
/**
 * Escanea cuentos/*.md y genera src/data/story-content-manifest.json.
 * Se ejecuta en predev/prebuild para mantener el índice sin fs en el cliente.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cuentosDir = path.join(root, "cuentos");
const outDir = path.join(root, "src", "data");
const outFile = path.join(outDir, "story-content-manifest.json");

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: raw };
  const yaml = raw.slice(4, end);
  const meta = {};
  for (const line of yaml.split("\n")) {
    const match = line.match(/^([\w-]+):\s*(.+)$/);
    if (match) meta[match[1]] = match[2].trim();
  }
  return { meta, body: raw.slice(end + 5) };
}

function inferSlugFromFilename(fileName) {
  const match = fileName.match(/^familia-[^-]+-(.+?)(?:\.template)?\.md$/);
  return match?.[1] ?? null;
}

const entries = readdirSync(cuentosDir, { withFileTypes: true });
const bySlug = {};

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

  const isTemplate = entry.name.endsWith(".template.md");
  const filePath = `cuentos/${entry.name}`;
  const snippet = readFileSync(path.join(cuentosDir, entry.name), "utf8").slice(
    0,
    512,
  );
  const { meta } = parseFrontmatter(snippet);
  const slug = meta.slug ?? inferSlugFromFilename(entry.name);
  if (!slug) continue;

  const source = {
    slug,
    kind: isTemplate ? "template" : "markdown",
    filePath,
    familyTag: meta.familyTag,
  };

  const existing = bySlug[slug];
  if (!existing) {
    bySlug[slug] = source;
    continue;
  }
  if (source.kind === "template" && existing.kind === "markdown") {
    bySlug[slug] = source;
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sources: bySlug,
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `story-content-manifest: ${Object.keys(bySlug).length} cuentos → ${path.relative(root, outFile)}`,
);
