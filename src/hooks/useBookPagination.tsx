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

function measurePageBox(viewport: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = viewport.getBoundingClientRect();
  let width = Math.round(rect.width);
  let height = Math.round(rect.height);

  const root = viewport.closest(".story-reader--book");
  const toolbar = root?.querySelector<HTMLElement>(".story-reader__toolbar");
  const footer = root?.querySelector<HTMLElement>(".book-reader__footer");
  const chrome =
    Math.round(toolbar?.getBoundingClientRect().height ?? 0) +
    Math.round(footer?.getBoundingClientRect().height ?? 0) +
    16;

  if (width < 48) width = Math.round(window.innerWidth);
  if (height < 160) {
    height = Math.max(Math.round(window.innerHeight - chrome), 280);
  }

  return { width, height };
}

function applyMeasureBox(
  measure: HTMLElement,
  inner: HTMLElement,
  width: number,
  height: number,
) {
  measure.style.width = `${width}px`;
  measure.style.height = `${height}px`;
  inner.style.width = `${width}px`;
  inner.style.height = `${height}px`;
  inner.style.maxHeight = `${height}px`;
  inner.style.overflow = "hidden";
  inner.dataset.pageHeight = String(height);
}

export function useBookPagination({ content, fontSize }: Args) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<BookPageData[]>([
    { blocks: content.blocks, includeTitle: true, includeSubtitle: true },
  ]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    let frame = 0;
    let debounce: number | undefined;

    const run = () => {
      const { width, height } = measurePageBox(viewport);
      if (width < 48 || height < 160) return;

      const inner = measure.querySelector<HTMLElement>(".book-page__inner");
      if (!inner) return;

      applyMeasureBox(measure, inner, width, height);
      const built = paginateBookContent(inner, content);
      setPages((current) => (pagesEqual(current, built) ? current : built));
    };

    const schedule = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(run);
      }, 64);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      window.clearTimeout(debounce);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
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
        <div className="book-page__inner book-page__inner--measure" />
      </div>
    </div>
  );

  return { viewportRef, pages, measureLayer };
}
