import { describe, expect, it } from "vitest";
import {
  buildTrialStoryMarkdown,
  normalizeTrialName,
  trialMarkdownToContent,
} from "@/lib/trial-story";

describe("trial-story", () => {
  it("rejects empty or oversized names", () => {
    expect(normalizeTrialName("")).toBeNull();
    expect(normalizeTrialName("   ")).toBeNull();
    expect(normalizeTrialName("A".repeat(25))).toBeNull();
    expect(normalizeTrialName("  Nico  ")).toBe("Nico");
  });

  it("builds a short mock story with the child name", () => {
    const md = buildTrialStoryMarkdown("Luna", "dormir");
    expect(md).toContain("Luna");
    expect(md).toMatch(/dormir|calma/i);
    const content = trialMarkdownToContent(md);
    expect(content.title.length).toBeGreaterThan(0);
    expect(content.blocks.length).toBeGreaterThan(0);
  });
});
