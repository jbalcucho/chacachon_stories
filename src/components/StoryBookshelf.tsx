"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookSpine from "@/components/BookSpine";
import CreateStorySlot from "@/components/CreateStorySlot";
import StoryBook from "@/components/StoryBook";
import type { StoryCard } from "@/lib/stories";
import { CREATE_STORY_SLUG } from "@/lib/create-story";
import {
  getBalancedStackedSides,
  getCircularOffset,
  initialActiveIndex,
  isStackSpacer,
  nextCarouselIndex,
  prevCarouselIndex,
} from "@/lib/book-carousel";

const BOOKSHELF_SLUG_KEY = "chacachon.bookshelf-active-slug";

function indexForSlug(stories: StoryCard[], slug: string | null): number | null {
  if (!slug || slug === CREATE_STORY_SLUG) return null;
  const index = stories.findIndex((story) => story.slug === slug);
  return index >= 0 ? index : null;
}

function readSavedSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(BOOKSHELF_SLUG_KEY);
    return saved === CREATE_STORY_SLUG ? null : saved;
  } catch {
    return null;
  }
}

function saveActiveSlug(slug: string) {
  if (typeof window === "undefined" || slug === CREATE_STORY_SLUG) return;
  try {
    sessionStorage.setItem(BOOKSHELF_SLUG_KEY, slug);
  } catch {
    // sessionStorage puede fallar en modo privado estricto
  }
}

function resolveInitialIndex(
  stories: StoryCard[],
  urlSlug: string | null,
): number {
  const fromUrl = indexForSlug(stories, urlSlug);
  if (fromUrl !== null) return fromUrl;

  return initialActiveIndex(stories.length);
}

type SlideDirection = "left" | "right";

type Props = {
  stories: StoryCard[];
  label?: string;
  initialSlug?: string | null;
};

export default function StoryBookshelf({
  stories,
  label = "Mi biblioteca",
  initialSlug = null,
}: Props) {
  const router = useRouter();
  const catalogSlug =
    initialSlug === CREATE_STORY_SLUG ? null : (initialSlug ?? null);
  const [activeIndex, setActiveIndex] = useState(() =>
    resolveInitialIndex(stories, catalogSlug),
  );
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("right");
  const [isBookLeaving, setIsBookLeaving] = useState(false);
  const [isBookEntering, setIsBookEntering] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const transitionTimers = useRef<number[]>([]);
  const skipUrlSync = useRef(true);

  const count = stories.length;
  const canCycle = count > 1;
  const isBookTransitioning = isBookLeaving || isBookEntering;

  const clearTransitionTimers = useCallback(() => {
    for (const timer of transitionTimers.current) {
      window.clearTimeout(timer);
    }
    transitionTimers.current = [];
  }, []);

  const queueTransitionTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    transitionTimers.current.push(timer);
    return timer;
  }, []);

  useEffect(() => clearTransitionTimers, [clearTransitionTimers]);

  const persistSelection = useCallback(
    (index: number) => {
      const slug = stories[index]?.slug;
      if (!slug) return;
      saveActiveSlug(slug);
      router.replace(`/?libro=${encodeURIComponent(slug)}`, { scroll: false });
    },
    [router, stories],
  );

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    const index = indexForSlug(stories, catalogSlug);
    if (index !== null) {
      setActiveIndex(index);
    }
  }, [catalogSlug, stories]);

  useEffect(() => {
    if (catalogSlug) return;
    const saved = readSavedSlug();
    if (!saved || !stories.some((story) => story.slug === saved)) return;
    router.replace(`/?libro=${encodeURIComponent(saved)}`, { scroll: false });
  }, [catalogSlug, router, stories]);

  const changeActiveIndex = useCallback(
    (index: number) => {
      if (index === activeIndex || isBookLeaving) return;

      const offset = getCircularOffset(index, activeIndex, count);
      if (offset !== 0) {
        setSlideDirection(offset > 0 ? "right" : "left");
      }

      setIsBookLeaving(true);

      queueTransitionTimer(() => {
        setActiveIndex(index);
        persistSelection(index);
        setIsBookLeaving(false);
        setIsBookEntering(true);

        queueTransitionTimer(() => {
          setIsBookEntering(false);
        }, 720);
      }, 420);
    },
    [
      activeIndex,
      count,
      isBookLeaving,
      persistSelection,
      queueTransitionTimer,
    ],
  );

  const navigateTo = useCallback(
    (index: number) => {
      changeActiveIndex(index);
    },
    [changeActiveIndex],
  );

  const goPrev = useCallback(() => {
    if (!canCycle || isBookLeaving) return;
    setSlideDirection("left");
    changeActiveIndex(prevCarouselIndex(activeIndex, count));
  }, [activeIndex, canCycle, changeActiveIndex, count, isBookLeaving]);

  const goNext = useCallback(() => {
    if (!canCycle || isBookLeaving) return;
    setSlideDirection("right");
    changeActiveIndex(nextCarouselIndex(activeIndex, count));
  }, [activeIndex, canCycle, changeActiveIndex, count, isBookLeaving]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const activeStory = stories[activeIndex];
  const activeOpenPath = activeStory?.openPath ?? null;
  const canOpenActive = Boolean(activeOpenPath);

  const { left, right } = getBalancedStackedSides(stories, activeIndex);
  const leftBookCount = left.filter((entry) => !isStackSpacer(entry)).length;
  const rightBookCount = right.filter((entry) => !isStackSpacer(entry)).length;

  function renderStackEntry(
    entry: (typeof left)[number],
    bookCount: number,
  ) {
    if (isStackSpacer(entry)) {
      return (
        <span
          key={entry.key}
          className="book-spine-stack__item book-spine-stack__spacer"
          aria-hidden="true"
        >
          <span className="book-spine-stack__spine" />
        </span>
      );
    }

    return (
      <BookSpine
        key={entry.story.slug}
        story={entry.story}
        narrow={bookCount >= 4}
        onClick={() => {
          if (!isBookTransitioning) navigateTo(entry.index);
        }}
      />
    );
  }

  function handleActiveClick() {
    if (isBookTransitioning) return;
    if (canOpenActive && activeOpenPath && activeStory) {
      persistSelection(activeIndex);
      router.push(activeOpenPath);
    }
  }

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  return (
    <section className="bookshelf-section" aria-label={label}>
      <div className="bookshelf-header flex-col items-center gap-1 sm:flex-row sm:items-baseline sm:gap-4">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <p className="bookshelf-label">{label}</p>
          <Link href="/crear" className="bookshelf-create-link">
            ✨ Crear cuento
          </Link>
        </div>
        <p className="bookshelf-hint hidden text-center text-xs sm:block sm:text-right">
          Selecciona el libro que quieres leer o crea una nueva histor
          <span className="title-ia" title="Historia con inteligencia artificial">
            IA
          </span>
          .
        </p>
      </div>

      <div className="library-controls">
        <button
          type="button"
          className="library-arrow library-arrow--prev"
          onClick={goPrev}
          disabled={!canCycle || isBookTransitioning}
          aria-label="Libro anterior"
        >
          ‹
        </button>

        <div
          className="library-cubby"
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
        >
          <div className="library-cubby__lintel" aria-hidden="true" />
          <div className="library-cubby__compartment">
            <div className="library-cubby__stacks" role="list">
              <div
                className="book-spine-stack book-spine-stack--left"
                data-count={left.length}
                role="presentation"
              >
                {left.map((entry) => renderStackEntry(entry, leftBookCount))}
              </div>

              <div className="library-cubby__center" role="listitem">
                <div className="library-cubby__vacancy" aria-hidden="true" />
                {activeStory ? (
                  <div
                    key={activeStory.slug}
                    className={`library-book-stage library-book-stage--${slideDirection}`}
                  >
                    <StoryBook
                      story={activeStory}
                      featured
                      entering={isBookEntering}
                      leaving={isBookLeaving}
                      onClick={handleActiveClick}
                    />
                  </div>
                ) : null}
              </div>

              <div
                className="book-spine-stack book-spine-stack--right"
                data-count={right.length}
                role="presentation"
              >
                {right.map((entry) => renderStackEntry(entry, rightBookCount))}
              </div>
            </div>
            <CreateStorySlot variant="mirror" />
            <CreateStorySlot variant="primary" />
            <div className="library-cubby__shelf" aria-hidden="true" />
          </div>
          <div className="library-cubby__base" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="library-arrow library-arrow--next"
          onClick={goNext}
          disabled={!canCycle || isBookTransitioning}
          aria-label="Libro siguiente"
        >
          ›
        </button>
      </div>

      <p className="bookshelf-hint-mobile sm:hidden">
        Selecciona el libro que quieres leer o crea una nueva histor
        <span className="title-ia" title="Historia con inteligencia artificial">
          IA
        </span>
        .
      </p>

      {activeStory ? (
        <p className="library-active-hint" aria-live="polite">
          <span className="text-honey-glow font-bold">{activeStory.title}</span>
        </p>
      ) : null}
    </section>
  );
}
