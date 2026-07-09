import { describe, expect, it } from "vitest";
import type { StoryCard } from "@/lib/stories";
import {
  getBalancedStackedSides,
  getMaxSpinesPerSide,
  getStackedSides,
  isStackSpacer,
} from "@/lib/book-carousel";

function story(slug: string): StoryCard {
  return {
    slug,
    title: slug,
    description: null,
    moraleja: null,
    familyTag: "chacachon",
    htmlPath: null,
    openPath: `/cuento/${slug}`,
    variant: "NARRATIVE",
    status: "PUBLISHED",
  };
}

function countBooks(entries: ReturnType<typeof getBalancedStackedSides>["left"]) {
  return entries.filter((entry) => !isStackSpacer(entry)).length;
}

describe("getMaxSpinesPerSide", () => {
  it("limita lomos visibles para mantener simetría con catálogo par", () => {
    expect(getMaxSpinesPerSide(4)).toBe(1);
    expect(getMaxSpinesPerSide(5)).toBe(2);
    expect(getMaxSpinesPerSide(2)).toBe(0);
  });
});

describe("getStackedSides", () => {
  it("muestra la misma cantidad de lomos visibles a cada lado", () => {
    const stories = [story("a"), story("b"), story("c"), story("d")];

    for (let activeIndex = 0; activeIndex < stories.length; activeIndex += 1) {
      const { left, right } = getStackedSides(stories, activeIndex);
      expect(left.length).toBe(right.length);
      expect(left.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getBalancedStackedSides", () => {
  it("iguala la cantidad de lomos en cada pila del carrusel", () => {
    const stories = [story("a"), story("b"), story("c"), story("d"), story("e")];

    for (let activeIndex = 0; activeIndex < stories.length; activeIndex += 1) {
      const { left, right } = getBalancedStackedSides(stories, activeIndex);
      expect(left.length).toBe(right.length);
      expect(countBooks(left)).toBe(getStackedSides(stories, activeIndex).left.length);
      expect(countBooks(right)).toBe(getStackedSides(stories, activeIndex).right.length);
    }
  });
});
