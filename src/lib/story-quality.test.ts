import { describe, expect, it } from "vitest";
import { analyzeStoryMarkdown } from "@/lib/story-quality";

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
});
