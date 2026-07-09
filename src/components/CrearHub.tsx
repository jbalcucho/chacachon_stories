"use client";

import Link from "next/link";
import { useCallback, useState, type CSSProperties } from "react";

export type CrearHubOption = {
  id: string;
  href: string;
  primary: boolean;
  kicker: string;
  emoji: string;
  title: string;
  body: string;
  cta: string;
  preview: string;
  locked?: boolean;
};

type ProfileCompletionData = {
  percent: number;
  hint: string;
};

type CrearHubProps = {
  options: CrearHubOption[];
  completion: ProfileCompletionData | null;
  defaultPreview: string;
  profileHref?: string;
};

export default function CrearHub({
  options,
  completion,
  defaultPreview,
  profileHref = "/familia",
}: CrearHubProps) {
  const [activePreview, setActivePreview] = useState(defaultPreview);

  const resetPreview = useCallback(() => {
    setActivePreview(defaultPreview);
  }, [defaultPreview]);

  return (
    <>
      <nav className="crear-progress" aria-label="Pasos para crear tu cuento">
        <ol className="crear-progress__list">
          <li className="crear-progress__item crear-progress__item--active">
            <span className="crear-progress__dot" aria-hidden="true">
              1
            </span>
            <span className="crear-progress__label">Elige el camino</span>
          </li>
          <li className="crear-progress__item" aria-current={false}>
            <span className="crear-progress__dot" aria-hidden="true">
              2
            </span>
            <span className="crear-progress__label">Arma la receta</span>
          </li>
          <li className="crear-progress__item">
            <span className="crear-progress__dot" aria-hidden="true">
              3
            </span>
            <span className="crear-progress__label">Tu cuento</span>
          </li>
        </ol>
      </nav>

      {completion ? (
        <Link
          href={profileHref}
          className="crear-profile-meter crear-profile-meter--link mt-6"
          aria-label={`Tu perfil de cuentos al ${completion.percent}%. ${completion.hint}. Ir a editar perfil`}
        >
          <div className="crear-profile-meter__header">
            <span className="crear-profile-meter__label">Tu perfil de cuentos</span>
            <span className="crear-profile-meter__pct">{completion.percent}%</span>
          </div>
          <div
            className="crear-profile-meter__track"
            role="progressbar"
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-hidden="true"
          >
            <span
              className="crear-profile-meter__fill"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <p className="crear-profile-meter__hint">
            {completion.hint}
            <span className="crear-profile-meter__cta" aria-hidden="true">
              {" "}
              → Editar
            </span>
          </p>
        </Link>
      ) : null}

      <p
        className="crear-preview mt-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {activePreview}
      </p>

      <div className="crear-grid mt-6" role="list">
        {options.map((opt, index) => (
          <Link
            key={opt.id}
            href={opt.href}
            className={[
              "crear-card",
              "crear-card--animate",
              opt.primary ? "crear-card--primary" : "",
              opt.locked ? "crear-card--locked" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--card-index": index } as CSSProperties}
            role="listitem"
            onMouseEnter={() => setActivePreview(opt.preview)}
            onMouseLeave={resetPreview}
            onFocus={() => setActivePreview(opt.preview)}
            onBlur={resetPreview}
            aria-describedby={opt.locked ? "crear-locked-hint" : undefined}
          >
            <span className="crear-card__icon" aria-hidden="true">
              {opt.emoji}
            </span>
            <div className="crear-card__content">
              <span className="crear-card__kicker">{opt.kicker}</span>
              <h2 className="crear-card__title">{opt.title}</h2>
              <p className="crear-card__body">{opt.body}</p>
              <span className="crear-card__cta">{opt.cta}</span>
            </div>
          </Link>
        ))}
      </div>

      {options.some((o) => o.locked) ? (
        <p id="crear-locked-hint" className="sr-only">
          Completa tu perfil familiar para usar Inspirado en tu vida.
        </p>
      ) : null}
    </>
  );
}
