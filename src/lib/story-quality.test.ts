import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeStoryMarkdown } from "@/lib/story-quality";

const root = path.join(import.meta.dirname, "..", "..");

const DEMO_STORIES = [
  "cuentos/familia-chacachon-nico-dia-sin-pantallas.md",
  "cuentos/familia-chacachon-operacion-a-dormir.template.md",
  "cuentos/familia-chacachon-el-lobo-y-las-palabras.md",
  "cuentos/familia-chacachon-cerditos-caperucita.md",
];

describe("analyzeStoryMarkdown", () => {
  it("detecta sermón explícito", () => {
    const report = analyzeStoryMarkdown(
      "# T\n\n> Moraleja: no mentir\n\nY aprendieron que la verdad es buena.",
    );
    expect(report.findings.some((f) => f.id === "sermon")).toBe(true);
    expect(report.passed).toBe(false);
  });

  it("cuenta palabras y escenas", () => {
    const report = analyzeStoryMarkdown(`# T\n\n## Uno\n\nHola mundo.\n\n## Dos\n\nAdiós.`);
    expect(report.metrics.wordCount).toBeGreaterThan(0);
    expect(report.metrics.sceneCount).toBe(2);
  });

  for (const rel of DEMO_STORIES) {
    it(`demos Chacachón pasan QA: ${path.basename(rel)}`, () => {
      const raw = readFileSync(path.join(root, rel), "utf8");
      const report = analyzeStoryMarkdown(raw);
      const errors = report.findings.filter((f) => f.severity === "error");
      expect(errors, errors.map((e) => e.message).join("; ")).toEqual([]);
      expect(report.metrics.wordCount).toBeGreaterThanOrEqual(300);
      expect(report.metrics.wordCount).toBeLessThanOrEqual(650);
      expect(report.metrics.sceneCount).toBeGreaterThanOrEqual(3);
      expect(report.metrics.sensoryAnchorCount).toBeGreaterThanOrEqual(4);
    });
  }
});
