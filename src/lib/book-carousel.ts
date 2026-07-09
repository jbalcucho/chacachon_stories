import type { StoryCard } from "@/lib/stories";

export type StackItem = {
  story: StoryCard;
  index: number;
  offset: number;
};

export type StackSpacer = {
  type: "spacer";
  key: string;
};

export type StackEntry = StackItem | StackSpacer;

export function isStackSpacer(entry: StackEntry): entry is StackSpacer {
  return "type" in entry && entry.type === "spacer";
}

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

export function getMaxSpinesPerSide(count: number): number {
  if (count <= 1) return 0;
  return Math.floor((count - 1) / 2);
}

export function getStackedSides(
  stories: StoryCard[],
  activeIndex: number,
): { left: StackItem[]; right: StackItem[] } {
  const count = stories.length;
  const maxOffset = getMaxSpinesPerSide(count);
  const left: StackItem[] = [];
  const right: StackItem[] = [];

  stories.forEach((story, index) => {
    const offset = getCircularOffset(index, activeIndex, count);
    const item = { story, index, offset };
    if (offset < 0 && Math.abs(offset) <= maxOffset) left.push(item);
    if (offset > 0 && offset <= maxOffset) right.push(item);
  });

  left.sort((a, b) => b.offset - a.offset);
  right.sort((a, b) => a.offset - b.offset);

  return { left, right };
}

/** Pads the shorter stack so left/right spine counts match (create slots live outside). */
export function getBalancedStackedSides(
  stories: StoryCard[],
  activeIndex: number,
): { left: StackEntry[]; right: StackEntry[] } {
  const { left, right } = getStackedSides(stories, activeIndex);
  const target = Math.max(left.length, right.length);
  const padLeft = target - left.length;
  const padRight = target - right.length;

  const leftEntries: StackEntry[] = [
    ...Array.from({ length: padLeft }, (_, index) => ({
      type: "spacer" as const,
      key: `spacer-left-${activeIndex}-${index}`,
    })),
    ...left,
  ];

  const rightEntries: StackEntry[] = [
    ...right,
    ...Array.from({ length: padRight }, (_, index) => ({
      type: "spacer" as const,
      key: `spacer-right-${activeIndex}-${index}`,
    })),
  ];

  return { left: leftEntries, right: rightEntries };
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
