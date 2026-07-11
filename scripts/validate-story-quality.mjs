#!/usr/bin/env node
/**
 * QA editorial de cuentos Chacachón publicados (biblia + story-quality.ts).
 * Si el estante Chacachón está vacío, sale OK.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeStoryMarkdown } from "../src/lib/story-quality.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const manifest = JSON.parse(
  readFileSync(path.join(root, "src/data/story-content-manifest.json"), "utf8"),
);
const seedSource = readFileSync(path.join(root, "prisma/seed.ts"), "utf8");

/** Slugs Chacachón con status PUBLISHED en seed (bloque por bloque). */
function publishedChacachonSlugs(seed) {
  const blocks = seed.split(/\{\s*\n\s*slug:/);
  const slugs = [];
  for (const block of blocks.slice(1)) {
    const slugMatch = block.match(/^\s*"([^"]+)"/);
    if (!slugMatch) continue;
    const isPublished = /status:\s*StoryStatus\.PUBLISHED/.test(block);
    const isChacachon = /familyTag:\s*"chacachon"/.test(block);
    if (isPublished && isChacachon) slugs.push(slugMatch[1]);
  }
  return slugs;
}

const published = publishedChacachonSlugs(seedSource);

if (published.length === 0) {
  console.log(
    "validate-story-quality: OK (estante Chacachón vacío — sin demos publicados)",
  );
  process.exit(0);
}

let failed = false;

for (const slug of published) {
  const source = manifest.sources[slug];
  if (!source) {
    console.error(`[${slug}] publicado en seed pero no está en manifest`);
    failed = true;
    continue;
  }

  const filePath = path.join(root, source.filePath);
  if (!existsSync(filePath)) {
    console.error(`[${slug}] falta archivo ${source.filePath}`);
    failed = true;
    continue;
  }

  const raw = readFileSync(filePath, "utf8");
  const report = analyzeStoryMarkdown(raw);

  const status = report.passed ? "OK" : "REVISAR";
  console.log(
    `\n[${status}] ${slug} — score ${report.score} · ${report.metrics.wordCount} palabras · ${report.metrics.sceneCount} escenas`,
  );

  for (const finding of report.findings) {
    console.log(`  ${finding.severity.toUpperCase()}: ${finding.message}`);
  }

  if (!report.passed) failed = true;
}

if (failed) {
  console.error("\nvalidate-story-quality: hay cuentos por revisar");
  process.exit(1);
}

console.log("\nvalidate-story-quality: OK");
