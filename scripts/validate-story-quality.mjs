#!/usr/bin/env node
/**
 * QA editorial de cuentos demo (biblia + story-quality.ts).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeStoryMarkdown } from "../src/lib/story-quality.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const manifest = JSON.parse(
  readFileSync(path.join(root, "src/data/story-content-manifest.json"), "utf8"),
);

const published = [
  "el-lobo-y-las-palabras",
  "cerditos-del-edificio",
  "operacion-a-dormir",
  "nico-dia-sin-pantallas",
];

let failed = false;

for (const slug of published) {
  const source = manifest.sources[slug];
  if (!source) {
    console.error(`[${slug}] no está en manifest`);
    failed = true;
    continue;
  }

  const filePath = path.join(root, source.filePath);
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
