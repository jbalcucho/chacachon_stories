"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import DemoModeBanner from "@/components/DemoModeBanner";
import StoryPageBlocks from "@/components/StoryPageBlocks";
import StoryShareButton from "@/components/StoryShareButton";
import { useBookPagination } from "@/hooks/useBookPagination";
import type { PersonalizedStoryContent } from "@/lib/story-reader";
import type { ReaderProfileSource } from "@/lib/reader-profile";

type Props = {
  content: PersonalizedStoryContent;
  profileSource: ReaderProfileSource;
  storyTitle: string;
  storySlug: string;
  /** Destino del botón «volver». Por defecto: estante con libro abierto. */
  backHref?: string;
  backLabel?: string;
  /** Muestra compartir (solo catálogo público). */
  shareable?: boolean;
  /** Login con retorno al cuento actual (modo demo). */
  loginCallbackUrl?: string;
  /** CTA de conversión al llegar a la última página (prueba sin cuenta). */
  endConversion?: {
    title: string;
    body: string;
    href: string;
    ctaLabel: string;
  };
  /** Chip de estado en la toolbar (ej. «Prueba»). Si no hay, usa Tu familia / Muestra. */
  statusBadge?: string | null;
  /** Descargar PDF (solo con sesión, ver docs/plan-mejoras-competitivas.md C1.1). */
  pdfHref?: string | null;
};

type TurnDirection = "next" | "prev";
type PaperStyle = "cuento" | "cuaderno";

const MIN_FONT = 1.05;
const MAX_FONT = 1.75;
const STEP = 0.1;
const TURN_MS = 680;
const PAPER_KEY = "chacachon-paper";
const FONT_KEY = "chacachon-font-size";
const PROGRESS_PREFIX = "chacachon.reader-progress:";

function defaultFontSize(): number {
  if (typeof window === "undefined") return 1.2;
  return window.innerWidth < 560 ? 1.1 : 1.28;
}

function clampFontSize(value: number): number {
  return Math.min(MAX_FONT, Math.max(MIN_FONT, Math.round(value * 100) / 100));
}

function initialFontSize(): number {
  if (typeof window === "undefined") return 1.2;
  try {
    const raw = window.localStorage.getItem(FONT_KEY);
    if (raw !== null) {
      const saved = Number.parseFloat(raw);
      if (Number.isFinite(saved)) return clampFontSize(saved);
    }
  } catch {
    // localStorage no disponible
  }
  return defaultFontSize();
}

export default function StoryReader({
  content,
  profileSource,
  storyTitle,
  storySlug,
  backHref,
  backLabel = "Biblioteca",
  shareable = false,
  loginCallbackUrl,
  endConversion,
  statusBadge,
  pdfHref = null,
}: Props) {
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [paper, setPaper] = useState<PaperStyle>("cuento");
  const [pageIndex, setPageIndex] = useState(0);
  const [turning, setTurning] = useState<TurnDirection | null>(null);
  const touchStartX = useRef<number | null>(null);
  const turnTimer = useRef<number | null>(null);
  const reduceMotion = useRef(false);
  const progressRestored = useRef(false);
  const progressKey = `${PROGRESS_PREFIX}${storySlug}`;
  const libraryHref =
    backHref ?? `/?libro=${encodeURIComponent(storySlug)}`;

  const { viewportRef, pages, measureLayer } = useBookPagination({
    content,
    fontSize,
  });

  const pageCount = pages.length;
  const progressPct =
    pageCount > 0 ? ((pageIndex + 1) / pageCount) * 100 : 0;
  const isLastPage = pageCount > 0 && pageIndex >= pageCount - 1;
  const currentPage = pages[pageIndex] ?? pages[0];
  const pendingPage =
    turning === "next"
      ? pages[pageIndex + 1]
      : turning === "prev"
        ? pages[pageIndex - 1]
        : null;

  const clearTurnTimer = useCallback(() => {
    if (turnTimer.current !== null) {
      window.clearTimeout(turnTimer.current);
      turnTimer.current = null;
    }
  }, []);

  useEffect(() => clearTurnTimer, [clearTurnTimer]);

  useEffect(() => {
    setPageIndex((index) => Math.min(index, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  const goToPage = useCallback(
    (direction: TurnDirection) => {
      if (turning) return;

      const target =
        direction === "next" ? pageIndex + 1 : pageIndex - 1;
      if (target < 0 || target >= pageCount) return;

      if (reduceMotion.current) {
        setPageIndex(target);
        return;
      }

      setTurning(direction);
      clearTurnTimer();
      turnTimer.current = window.setTimeout(() => {
        setPageIndex(target);
        setTurning(null);
      }, TURN_MS);
    },
    [clearTurnTimer, pageCount, pageIndex, turning],
  );

  const goNext = useCallback(() => goToPage("next"), [goToPage]);
  const goPrev = useCallback(() => goToPage("prev"), [goToPage]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  const decrease = useCallback(() => {
    setFontSize((s) => clampFontSize(s - STEP));
  }, []);

  const increase = useCallback(() => {
    setFontSize((s) => clampFontSize(s + STEP));
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    reduceMotion.current = query.matches;
    const onChange = (event: MediaQueryListEvent) => {
      reduceMotion.current = event.matches;
    };
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PAPER_KEY);
      if (saved === "cuento" || saved === "cuaderno") setPaper(saved);
    } catch {
      // localStorage no disponible: se queda con el tema por defecto
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FONT_KEY, String(fontSize));
    } catch {
      // ignorar si no se puede persistir
    }
  }, [fontSize]);

  useEffect(() => {
    if (progressRestored.current || pageCount === 0) return;
    progressRestored.current = true;
    try {
      const raw = window.localStorage.getItem(progressKey);
      if (raw === null) return;
      const saved = Number.parseInt(raw, 10);
      if (!Number.isFinite(saved)) return;
      setPageIndex(Math.min(Math.max(saved, 0), pageCount - 1));
    } catch {
      // sin persistencia: arranca en la primera página
    }
  }, [pageCount, progressKey]);

  useEffect(() => {
    if (!progressRestored.current) return;
    try {
      window.localStorage.setItem(progressKey, String(pageIndex));
    } catch {
      // ignorar si no se puede persistir
    }
  }, [pageIndex, progressKey]);

  const changePaper = useCallback((next: PaperStyle) => {
    setPaper(next);
    try {
      window.localStorage.setItem(PAPER_KEY, next);
    } catch {
      // ignorar si no se puede persistir
    }
  }, []);

  return (
    <div className="story-reader story-reader--book" data-paper={paper}>
      <div className="story-reader__night" aria-hidden="true" />
      <header className="story-reader__toolbar">
        <div className="story-reader__toolbar-row story-reader__toolbar-row--nav">
          <Link
            href={libraryHref}
            className="story-reader__back"
            aria-label={`Volver a ${backLabel.toLowerCase()}`}
          >
            <span className="story-reader__back-icon" aria-hidden="true">
              ←
            </span>
            <span className="story-reader__back-label">{backLabel}</span>
          </Link>

          <div className="story-reader__toolbar-actions">
            {shareable ? (
              <StoryShareButton title={storyTitle} />
            ) : null}

            {pdfHref ? (
              <a
                href={pdfHref}
                download
                className="story-reader__pdf-btn"
                aria-label="Descargar cuento en PDF"
                title="Descargar PDF"
              >
                <span aria-hidden="true">⬇</span>
                <span className="story-reader__pdf-label">PDF</span>
              </a>
            ) : null}

            <div
              className="story-reader__paper-toggle"
              role="group"
              aria-label="Estilo de hoja"
            >
              <button
                type="button"
                className="story-reader__paper-btn"
                data-active={paper === "cuento"}
                aria-pressed={paper === "cuento"}
                aria-label="Hoja de cuento"
                title="Hoja de cuento"
                onClick={() => changePaper("cuento")}
              >
                <span className="story-reader__paper-icon" aria-hidden="true">
                  📖
                </span>
                <span className="story-reader__paper-label">Cuento</span>
              </button>
              <button
                type="button"
                className="story-reader__paper-btn"
                data-active={paper === "cuaderno"}
                aria-pressed={paper === "cuaderno"}
                aria-label="Hoja de cuaderno"
                title="Hoja de cuaderno"
                onClick={() => changePaper("cuaderno")}
              >
                <span className="story-reader__paper-icon" aria-hidden="true">
                  📓
                </span>
                <span className="story-reader__paper-label">Cuaderno</span>
              </button>
            </div>

            <div className="story-reader__font-controls">
              <button
                type="button"
                onClick={decrease}
                className="story-reader__font-btn"
                aria-label="Texto más pequeño"
              >
                A−
              </button>
              <button
                type="button"
                onClick={increase}
                className="story-reader__font-btn"
                aria-label="Texto más grande"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        <div className="story-reader__toolbar-row story-reader__toolbar-row--meta">
          <span className="story-reader__toolbar-title">{storyTitle}</span>
          <div className="story-reader__meta-badges">
            {statusBadge ? (
              <span className="story-reader__badge story-reader__badge--trial">
                {statusBadge}
              </span>
            ) : profileSource === "user" ? (
              <span className="story-reader__badge">Tu familia</span>
            ) : (
              <span className="story-reader__badge story-reader__badge--demo">
                Muestra
              </span>
            )}
          </div>
        </div>

        {profileSource === "demo" ? (
          <DemoModeBanner
            compact
            loginCallbackUrl={loginCallbackUrl ?? `/leer/${storySlug}`}
          />
        ) : null}
      </header>

      <div className="book-reader">
        <div
          className={[
            "book-reader__viewport",
            turning ? "book-reader__viewport--turning" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          ref={viewportRef}
          style={{ fontSize: `${fontSize}rem` }}
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
        >
          {measureLayer}
          <div
            className="book-shell"
            data-turning={turning ?? undefined}
          >
            {currentPage ? (
              <div
                className="book-page__surface"
                aria-hidden={Boolean(turning)}
              >
                <StoryPageBlocks
                  blocks={currentPage.blocks}
                  title={content.title}
                  subtitle={content.subtitle}
                  includeTitle={currentPage.includeTitle}
                  includeSubtitle={currentPage.includeSubtitle}
                  dropCap={pageIndex === 0}
                />
                <span className="book-page__number" aria-hidden="true">
                  {pageIndex + 1}
                </span>
              </div>
            ) : null}

            {turning ? (
              <div className="book-page__flip-stage" aria-hidden="true">
                {turning === "next" && pendingPage ? (
                  <div className="book-page book-page--under">
                    <StoryPageBlocks
                      blocks={pendingPage.blocks}
                      title={content.title}
                      subtitle={content.subtitle}
                      includeTitle={pendingPage.includeTitle}
                      includeSubtitle={pendingPage.includeSubtitle}
                    />
                  </div>
                ) : turning === "prev" && currentPage ? (
                  <div className="book-page book-page--under">
                    <StoryPageBlocks
                      blocks={currentPage.blocks}
                      title={content.title}
                      subtitle={content.subtitle}
                      includeTitle={currentPage.includeTitle}
                      includeSubtitle={currentPage.includeSubtitle}
                    />
                  </div>
                ) : null}

                {turning === "prev" && pendingPage ? (
                  <div className="book-page book-page--top book-page--unfold-prev">
                    <StoryPageBlocks
                      blocks={pendingPage.blocks}
                      title={content.title}
                      subtitle={content.subtitle}
                      includeTitle={pendingPage.includeTitle}
                      includeSubtitle={pendingPage.includeSubtitle}
                    />
                    <span className="book-page__number" aria-hidden="true">
                      {pageIndex}
                    </span>
                  </div>
                ) : (
                  <div
                    className={[
                      "book-page",
                      "book-page--top",
                      turning === "next" ? "book-page--flip-next" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <StoryPageBlocks
                      blocks={currentPage.blocks}
                      title={content.title}
                      subtitle={content.subtitle}
                      includeTitle={currentPage.includeTitle}
                      includeSubtitle={currentPage.includeSubtitle}
                    />
                    <span className="book-page__number" aria-hidden="true">
                      {pageIndex + 1}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="book-reader__hotspot book-reader__hotspot--prev"
            onClick={goPrev}
            disabled={pageIndex === 0 || Boolean(turning)}
            aria-label="Página anterior"
          />
          <button
            type="button"
            className="book-reader__hotspot book-reader__hotspot--next"
            onClick={goNext}
            disabled={pageIndex >= pageCount - 1 || Boolean(turning)}
            aria-label="Página siguiente"
          />
        </div>

        <div className="book-reader__bottom">
          {endConversion ? (
            <div className="book-reader__end-slot">
              <div
                className={[
                  "book-reader__end-conversion",
                  isLastPage && !turning
                    ? "book-reader__end-conversion--visible"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="region"
                aria-label="Guardar cuento"
                aria-hidden={!(isLastPage && !turning)}
                inert={!(isLastPage && !turning) ? true : undefined}
              >
                <p className="book-reader__end-conversion-title">
                  {endConversion.title}
                </p>
                <p className="book-reader__end-conversion-body">
                  {endConversion.body}
                </p>
                <Link
                  href={endConversion.href}
                  className="book-reader__end-conversion-cta"
                  tabIndex={isLastPage && !turning ? undefined : -1}
                >
                  {endConversion.ctaLabel}
                </Link>
              </div>
            </div>
          ) : null}

          <footer className="book-reader__footer">
            <button
              type="button"
              onClick={goPrev}
              disabled={pageIndex === 0 || Boolean(turning)}
              className="book-reader__nav-btn"
            >
              ‹ Anterior
            </button>
            <div className="book-reader__progress-block">
              <div
                className="book-reader__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPct)}
                aria-label={`Progreso de lectura: página ${pageIndex + 1} de ${pageCount}`}
              >
                <div
                  className="book-reader__progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="book-reader__progress" aria-live="polite">
                Página {pageIndex + 1} de {pageCount}
              </p>
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={pageIndex >= pageCount - 1 || Boolean(turning)}
              className="book-reader__nav-btn"
            >
              Siguiente ›
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
