"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookSpine from "@/components/BookSpine";
import StoryBook from "@/components/StoryBook";
import type { StoryCard } from "@/lib/stories";
import {
  getCircularOffset,
  getStackedSides,
  initialActiveIndex,
  nextCarouselIndex,
  prevCarouselIndex,
} from "@/lib/book-carousel";

const BOOKSHELF_SLUG_KEY = "chacachon.bookshelf-active-slug";

function indexForSlug(stories: StoryCard[], slug: string | null): number | null {
  if (!slug) return null;
  const index = stories.findIndex((story) => story.slug === slug);
  return index >= 0 ? index : null;
}

function readSavedSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(BOOKSHELF_SLUG_KEY);
  } catch {
    return null;
  }
}

function saveActiveSlug(slug: string) {
  if (typeof window === "undefined") return;
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
  // Debe ser determinista para SSR: solo depende de la URL (igual en
  // servidor y cliente). La restauración desde sessionStorage ocurre en un
  // efecto para no romper la hidratación.
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
  label = "Estante de la familia",
  initialSlug = null,
}: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(() =>
    resolveInitialIndex(stories, initialSlug),
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
    const index = indexForSlug(stories, initialSlug ?? null);
    if (index !== null) {
      setActiveIndex(index);
    }
  }, [initialSlug, stories]);

  useEffect(() => {
    if (initialSlug) return;
    const saved = readSavedSlug();
    if (!saved || !stories.some((story) => story.slug === saved)) return;
    router.replace(`/?libro=${encodeURIComponent(saved)}`, { scroll: false });
  }, [initialSlug, router, stories]);

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

  const { left, right } = getStackedSides(stories, activeIndex);

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
        <p className="bookshelf-label">{label}</p>
        <p className="bookshelf-hint hidden text-center text-xs sm:block sm:text-right">
          Toca un lomo o las flechas · el libro del centro se abre con otro clic
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
                {left.map((item) => (
                  <BookSpine
                    key={item.story.slug}
                    story={item.story}
                    narrow={left.length >= 4}
                    onClick={() => {
                      if (!isBookTransitioning) navigateTo(item.index);
                    }}
                  />
                ))}
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
                {right.map((item) => (
                  <BookSpine
                    key={item.story.slug}
                    story={item.story}
                    narrow={right.length >= 4}
                    onClick={() => {
                      if (!isBookTransitioning) navigateTo(item.index);
                    }}
                  />
                ))}
              </div>
            </div>
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
        Toca un lomo, desliza o usa las flechas
      </p>

      {activeStory ? (
        <p className="library-active-hint" aria-live="polite">
          <span className="text-honey-glow font-bold">{activeStory.title}</span>
          {" · "}
          {canOpenActive
            ? "Clic de nuevo para abrir el cuento"
            : "Próximamente en la biblioteca"}
        </p>
      ) : null}
    </section>
  );
}
