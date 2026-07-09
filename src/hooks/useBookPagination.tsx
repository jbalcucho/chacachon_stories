"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { paginateBookContent } from "@/lib/story-book-dom-pagination";
import type { BookPageData } from "@/lib/story-book-pages";
import type { PersonalizedStoryContent } from "@/lib/story-reader";

type Args = {
  content: PersonalizedStoryContent;
  fontSize: number;
};

function pagesEqual(a: BookPageData[], b: BookPageData[]): boolean {
  if (a.length !== b.length) return false;

  return a.every((page, index) => {
    const other = b[index];
    if (
      page.includeTitle !== other.includeTitle ||
      page.includeSubtitle !== other.includeSubtitle ||
      page.blocks.length !== other.blocks.length
    ) {
      return false;
    }

    return page.blocks.every((block, blockIndex) => {
      const otherBlock = other.blocks[blockIndex];
      if (block.type !== otherBlock.type) return false;
      if ("text" in block && "text" in otherBlock) {
        return block.text === otherBlock.text;
      }
      return true;
    });
  });
}

export function useBookPagination({ content, fontSize }: Args) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<BookPageData[]>([
    { blocks: content.blocks, includeTitle: true, includeSubtitle: true },
  ]);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    let frame = 0;
    let debounce: number | undefined;

    const run = () => {
      const viewportHeight =
        viewport.clientHeight > 80
          ? viewport.clientHeight
          : Math.max(window.innerHeight * 0.58, 320);
      const viewportWidth = viewport.clientWidth;

      if (viewportWidth < 48 || viewportHeight < 80) return;

      setReady(false);
      measure.style.width = `${viewportWidth}px`;
      measure.style.height = `${viewportHeight}px`;

      const inner = measure.querySelector<HTMLElement>(".book-page__inner");
      if (!inner) return;

      const built = paginateBookContent(inner, content);
      setPages((current) => (pagesEqual(current, built) ? current : built));
      setReady(true);
    };

    const schedule = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          window.requestAnimationFrame(run);
        });
      }, 32);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    return () => {
      window.clearTimeout(debounce);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [content, fontSize]);

  const measureLayer = (
    <div
      ref={measureRef}
      className="book-measure"
      style={{ fontSize: `${fontSize}rem` }}
      aria-hidden="true"
    >
      <div className="book-page book-page--measure">
        <div className="book-page__inner" />
      </div>
    </div>
  );

  return { viewportRef, pages, ready, measureLayer };
}
