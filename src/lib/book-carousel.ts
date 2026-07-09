import type { StoryCard } from "@/lib/stories";

export type StackItem = {
  story: StoryCard;
  index: number;
  offset: number;
};

export function getCircularOffset(
  index: number,
  activeIndex: number,
  count: number,
): number {
  if (count <= 0) return 0;
  let offset = index - activeIndex;
  const half = count / 2;
  if (offset > half) offset -= count;
  if (offset < -half) offset += count;
  return offset;
}

export function getStackedSides(
  stories: StoryCard[],
  activeIndex: number,
): { left: StackItem[]; right: StackItem[] } {
  const count = stories.length;
  const left: StackItem[] = [];
  const right: StackItem[] = [];

  stories.forEach((story, index) => {
    const offset = getCircularOffset(index, activeIndex, count);
    const item = { story, index, offset };
    if (offset < 0) left.push(item);
    if (offset > 0) right.push(item);
  });

  left.sort((a, b) => b.offset - a.offset);
  right.sort((a, b) => a.offset - b.offset);

  return { left, right };
}

export function nextCarouselIndex(activeIndex: number, count: number): number {
  if (count <= 0) return 0;
  return (activeIndex + 1) % count;
}

export function prevCarouselIndex(activeIndex: number, count: number): number {
  if (count <= 0) return 0;
  return (activeIndex - 1 + count) % count;
}

export function initialActiveIndex(count: number): number {
  if (count <= 0) return 0;
  return Math.floor((count - 1) / 2);
}
