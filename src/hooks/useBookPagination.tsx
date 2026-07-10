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

function measureDebounceMs(): number {
  if (typeof window === "undefined") return 64;
  return window.innerWidth < 768 ? 140 : 64;
}

/** Sincroniza la caja de medición con el hueco real del libro en pantalla. */
function syncMeasureBox(inner: HTMLElement): boolean {
  const width = Math.round(inner.clientWidth);
  const height = Math.round(inner.clientHeight);
  if (width < 48 || height < 120) return false;
  inner.dataset.pageHeight = String(height);
  return true;
}

export function useBookPagination({ content, fontSize }: Args) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const lastMeasureSize = useRef({ width: 0, height: 0 });
  const hasPaginated = useRef(false);
  const [pages, setPages] = useState<BookPageData[]>([
    { blocks: content.blocks, includeTitle: true, includeSubtitle: false },
  ]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measureRoot = measureRef.current;
    if (!viewport || !measureRoot) return;

    hasPaginated.current = false;
    lastMeasureSize.current = { width: 0, height: 0 };

    let frame = 0;
    let debounce: number | undefined;

    const run = () => {
      const inner = measureRoot.querySelector<HTMLElement>(
        ".book-page__inner--measure",
      );
      if (!inner || !syncMeasureBox(inner)) return;

      const width = inner.clientWidth;
      const height = inner.clientHeight;
      const last = lastMeasureSize.current;
      const sizeDelta =
        Math.abs(width - last.width) + Math.abs(height - last.height);

      if (hasPaginated.current && sizeDelta < 8) return;

      lastMeasureSize.current = { width, height };
      const built = paginateBookContent(inner, content);
      hasPaginated.current = true;
      setPages((current) => (pagesEqual(current, built) ? current : built));
    };

    const schedule = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(run);
      }, measureDebounceMs());
    };

    schedule();
    const retryTimer = window.setTimeout(schedule, 220);
    const retryTimer2 = window.setTimeout(schedule, 520);

    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", schedule);
    visualViewport?.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      window.clearTimeout(debounce);
      window.clearTimeout(retryTimer);
      window.clearTimeout(retryTimer2);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      visualViewport?.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("scroll", schedule);
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

  return { viewportRef, pages, measureLayer };
}
