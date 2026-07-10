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

function syncMeasureHeight(
  measureRoot: HTMLElement,
  inner: HTMLElement,
): boolean {
  const height = Math.round(measureRoot.clientHeight);
  const width = Math.round(measureRoot.clientWidth);
  if (height < 120 || width < 48) return false;
  inner.dataset.pageHeight = String(height);
  return true;
}

export function useBookPagination({ content, fontSize }: Args) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<BookPageData[]>([]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measureRoot = measureRef.current;
    if (!viewport || !measureRoot) return;

    let frame = 0;
    let debounce: number | undefined;

    const run = () => {
      const inner = measureRoot.querySelector<HTMLElement>(
        ".book-page__inner--measure",
      );
      if (!inner || !syncMeasureHeight(measureRoot, inner)) return;

      const built = paginateBookContent(inner, content);
      setPages((current) => (pagesEqual(current, built) ? current : built));
    };

    const schedule = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(run);
      }, 48);
    };

    schedule();
    const retryTimer = window.setTimeout(schedule, 200);
    const retryTimer2 = window.setTimeout(schedule, 500);

    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      window.clearTimeout(debounce);
      window.clearTimeout(retryTimer);
      window.clearTimeout(retryTimer2);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [content, fontSize]);

  const measureLayer = (
    <div
      ref={measureRef}
      className="book-measure-in-viewport"
      style={{ fontSize: `${fontSize}rem` }}
      aria-hidden="true"
    >
      <div className="book-page__inner book-page__inner--measure" />
    </div>
  );

  const pageCount = pages.length;
  const safePages =
    pageCount > 0
      ? pages
      : [{ blocks: content.blocks, includeTitle: true, includeSubtitle: true }];

  return { viewportRef, pages: safePages, measureLayer };
}
