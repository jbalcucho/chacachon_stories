import { describe, expect, it } from "vitest";
import { buildColombianLexiconBlock } from "@/lib/story-colombian-lexicon";

describe("buildColombianLexiconBlock", () => {
  it("incluye preferencias y vetos orales", () => {
    const block = buildColombianLexiconBlock();
    expect(block).toMatch(/LÉXICO COLOMBIANO/);
    expect(block).toMatch(/plato/);
    expect(block).toMatch(/cuenco/);
    expect(block).toMatch(/por un pelo/);
    expect(block).toMatch(/por los pelos/);
  });
});
