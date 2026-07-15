"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import BookSpine from "@/components/BookSpine";
import CreateStoryStar from "@/components/CreateStoryStar";
import StoryBook from "@/components/StoryBook";
import { isReadableLibraryStory, type StoryCard } from "@/lib/stories";
import { CREATE_STORY_SLUG } from "@/lib/create-story";
import {
  getBalancedStackedSides,
  getCircularOffset,
  initialActiveIndex,
  isStackSpacer,
  nextCarouselIndex,
  prevCarouselIndex,
} from "@/lib/book-carousel";
import { navigateWithFade } from "@/lib/route-fade";

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
  preferFirst = false,
): number {
  const fromUrl = indexForSlug(stories, urlSlug);
  if (fromUrl !== null) return fromUrl;
  if (preferFirst) return 0;
  return initialActiveIndex(stories.length);
}

type SlideDirection = "left" | "right";

type Props = {
  stories: StoryCard[];
  label?: string;
  /** Línea secundaria bajo el label (ej. demos de invitado). */
  subtitle?: ReactNode;
  initialSlug?: string | null;
  /** Slot y link “Crear cuento” (solo con sesión). */
  allowCreate?: boolean;
  /** Prefiere el primer libro si no hay slug en URL (demos). */
  preferFirst?: boolean;
  /** Hints y CTA terciario para home sin login. */
  guestMode?: boolean;
};

/** Ancho aproximado de un lomo + separación, por breakpoint (ver globals.css). */
const SPINE_UNIT_PX_MOBILE = 31;
const SPINE_UNIT_PX_DESKTOP = 44;
/** Mínimo de lomos "asomados" a cada lado aunque el espacio sea muy angosto. */
const MIN_FIT_PER_SIDE = 1;

export default function StoryBookshelf({
  stories: storiesProp,
  label = "Mi biblioteca",
  subtitle,
  initialSlug = null,
  allowCreate = true,
  preferFirst = false,
  guestMode = false,
}: Props) {
  const stories = useMemo(
    () => storiesProp.filter(isReadableLibraryStory),
    [storiesProp],
  );
  const router = useRouter();
  const leftStackRef = useRef<HTMLDivElement | null>(null);
  const rightStackRef = useRef<HTMLDivElement | null>(null);
  const [fitPerSide, setFitPerSide] = useState(MIN_FIT_PER_SIDE);

  useEffect(() => {
    const els = [leftStackRef.current, rightStackRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (els.length === 0) return;

    const observer = new ResizeObserver((entries) => {
      const spineUnit =
        window.innerWidth < 640 ? SPINE_UNIT_PX_MOBILE : SPINE_UNIT_PX_DESKTOP;
      const width = Math.min(...entries.map((entry) => entry.contentRect.width));
      const fit = Math.max(MIN_FIT_PER_SIDE, Math.floor(width / spineUnit));
      setFitPerSide((prev) => (prev === fit ? prev : fit));
    });
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const catalogSlug =
    initialSlug === CREATE_STORY_SLUG ? null : (initialSlug ?? null);
  const [activeIndex, setActiveIndex] = useState(() =>
    resolveInitialIndex(stories, catalogSlug, preferFirst),
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
    // Invitados: no restaurar selección previa; el gancho es el primer demo.
    if (preferFirst) return;
    const saved = readSavedSlug();
    if (!saved || !stories.some((story) => story.slug === saved)) return;
    router.replace(`/?libro=${encodeURIComponent(saved)}`, { scroll: false });
  }, [catalogSlug, preferFirst, router, stories]);

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

  // +1 más allá de lo que cabe: se recorta con overflow:hidden y queda
  // "asomado" para indicar que hay más libros de ese lado (ver revisión UX).
  const { left, right } = getBalancedStackedSides(
    stories,
    activeIndex,
    fitPerSide + 1,
  );

  function renderStackEntry(entry: (typeof left)[number]) {
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
      navigateWithFade((path) => router.push(path), activeOpenPath);
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
      <div
        className={
          allowCreate
            ? "bookshelf-header"
            : "bookshelf-header bookshelf-header--centered"
        }
      >
        {allowCreate ? (
          <div className="bookshelf-header__with-sub">
            <p className="bookshelf-label bookshelf-label--solo">{label}</p>
            {subtitle ? (
              <p className="bookshelf-subtitle">{subtitle}</p>
            ) : null}
          </div>
        ) : (
          <div className="bookshelf-header__guest">
            <p className="bookshelf-label bookshelf-label--solo">{label}</p>
            {subtitle ? (
              <p className="bookshelf-subtitle">{subtitle}</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="library-controls">
        <button
          type="button"
          className="library-arrow library-arrow--prev"
          onClick={goPrev}
          disabled={!canCycle || isBookTransitioning}
          aria-label="Libro anterior"
        >
          <svg
            className="library-arrow__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14.5 5.5 8 12l6.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="library-cubby"
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
        >
          <div className="library-cubby__lintel" aria-hidden="true" />
          {allowCreate ? (
            <CreateStoryStar fadeNavigate />
          ) : (
            <CreateStoryStar
              href="/probar"
              label="Crear HistorIA"
              ariaLabel="Crear HistorIA gratis: cuento de prueba con tu nombre"
              fadeNavigate
            />
          )}
          <div className="library-cubby__compartment">
            <div className="library-cubby__stacks" role="list">
              <div
                ref={leftStackRef}
                className="book-spine-stack book-spine-stack--left"
                data-count={left.length}
                role="presentation"
              >
                {left.map((entry) => renderStackEntry(entry))}
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
                ref={rightStackRef}
                className="book-spine-stack book-spine-stack--right"
                data-count={right.length}
                role="presentation"
              >
                {right.map((entry) => renderStackEntry(entry))}
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
          <svg
            className="library-arrow__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M9.5 5.5 16 12l-6.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {guestMode && activeStory ? (
        <div className="bookshelf-guest-hints">
          <p className="bookshelf-guest-hints__primary">
            Toca el libro y empieza a leer
          </p>
        </div>
      ) : null}
    </section>
  );
}
