import type { StoryBlock } from "@/lib/story-reader";

export type BookPageData = {
  blocks: StoryBlock[];
  includeTitle: boolean;
  includeSubtitle: boolean;
};

export function paginateMeasuredHeights(
  unitHeights: number[],
  maxPageHeight: number,
): number[][] {
  if (unitHeights.length === 0) return [[]];

  const pages: number[][] = [[]];
  let currentHeight = 0;

  for (let i = 0; i < unitHeights.length; i += 1) {
    const h = unitHeights[i];
    const wouldOverflow =
      pages[pages.length - 1].length > 0 &&
      currentHeight + h > maxPageHeight;

    if (wouldOverflow) {
      pages.push([]);
      currentHeight = 0;
    }

    pages[pages.length - 1].push(i);
    currentHeight += h;
  }

  return pages;
}

export function buildBookPages(
  unitHeights: number[],
  pageIndexes: number[][],
  blocks: StoryBlock[],
  hasTitle: boolean,
  hasSubtitle: boolean,
): BookPageData[] {
  let titleUsed = false;
  let subtitleUsed = false;

  return pageIndexes.map((indexes) => {
    const pageBlocks: StoryBlock[] = [];
    let includeTitle = false;
    let includeSubtitle = false;

    for (const unitIndex of indexes) {
      if (hasTitle && unitIndex === 0) {
        includeTitle = true;
        titleUsed = true;
        continue;
      }
      if (hasSubtitle && unitIndex === (hasTitle ? 1 : 0)) {
        includeSubtitle = true;
        subtitleUsed = true;
        continue;
      }

      const blockIndex = unitIndex - (hasTitle ? 1 : 0) - (hasSubtitle ? 1 : 0);
      const block = blocks[blockIndex];
      if (block) pageBlocks.push(block);
    }

    if (!titleUsed && hasTitle && pageBlocks.length === 0) {
      includeTitle = true;
      titleUsed = true;
    }
    if (!subtitleUsed && hasSubtitle && pageBlocks.length === 0) {
      includeSubtitle = true;
      subtitleUsed = true;
    }

    return { blocks: pageBlocks, includeTitle, includeSubtitle };
  });
}
