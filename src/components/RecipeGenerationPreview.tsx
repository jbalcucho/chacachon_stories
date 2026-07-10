"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GenerationQuota } from "@/lib/generation-limits";
import {
  buildRecipePreviewBullets,
  buildRecipePreviewExcerpt,
} from "@/lib/recipe-preview";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import {
  STORY_ACCENT_OPTIONS,
  type StoryAccentCode,
} from "@/lib/story-accent";

type Props = {
  selection: RecipeSelectionSlice;
  accentCode: StoryAccentCode;
  isLoggedIn: boolean;
  initialQuota: GenerationQuota | null;
  onQuotaChange?: (quota: GenerationQuota | null) => void;
};

export default function RecipeGenerationPreview({
  selection,
  accentCode,
  isLoggedIn,
  initialQuota,
  onQuotaChange,
}: Props) {
  const bullets = useMemo(
    () => buildRecipePreviewBullets(selection),
    [selection],
  );
  const excerpt = useMemo(
    () => buildRecipePreviewExcerpt(selection),
    [selection],
  );
  const accent = STORY_ACCENT_OPTIONS.find((opt) => opt.code === accentCode);
  const [quota, setQuota] = useState<GenerationQuota | null>(initialQuota);

  useEffect(() => {
    onQuotaChange?.(quota);
  }, [onQuotaChange, quota]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    fetch("/api/cuentos/cuota")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GenerationQuota | null) => {
        if (!cancelled && data) setQuota(data);
      })
      .catch(() => {
        // mantener cuota del servidor si falla el refresh
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const quotaExhausted = quota !== null && quota.remaining <= 0;

  return (
    <div className="recipe-preview">
      <p className="recipe-preview__eyebrow">Vista previa · sin gastar cuota</p>

      <section className="recipe-preview__section" aria-labelledby="recipe-preview-order">
        <h3 id="recipe-preview-order" className="recipe-preview__heading">
          Lo que le pediremos a la IA
        </h3>
        <ul className="recipe-preview__bullets">
          {bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {accent ? (
          <p className="recipe-preview__accent">
            Acento: <strong>{accent.label}</strong> — {accent.hint}
          </p>
        ) : null}
      </section>

      {excerpt.length > 0 ? (
        <section
          className="recipe-preview__section recipe-preview__excerpt"
          aria-labelledby="recipe-preview-sample"
        >
          <h3 id="recipe-preview-sample" className="recipe-preview__heading">
            Así podría empezar (ejemplo local)
          </h3>
          <p className="recipe-preview__note">
            Es una muestra con plantilla local. La IA escribirá un cuento único
            con más detalle y tu tono elegido.
          </p>
          {excerpt.map((paragraph) => (
            <p key={paragraph} className="recipe-preview__paragraph">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      {!isLoggedIn ? (
        <p className="crear-banner crear-banner--info" role="status">
          <Link href="/login?callbackUrl=/crear/adaptar" className="font-bold text-honey-glow underline">
            Entra con Google
          </Link>{" "}
          para crear y guardar tu cuento.
        </p>
      ) : quota ? (
        <p
          className={`recipe-preview__quota${quotaExhausted ? " recipe-preview__quota--warn" : ""}`}
          role="status"
        >
          {quotaExhausted
            ? `Ya usaste tus ${quota.limit} cuento${quota.limit === 1 ? "" : "s"} de hoy. Vuelve mañana.`
            : `Te queda${quota.remaining === 1 ? "" : "n"} ${quota.remaining} de ${quota.limit} cuento${quota.limit === 1 ? "" : "s"} hoy. Crear consume 1.`}
        </p>
      ) : null}
    </div>
  );
}

export function isGenerationQuotaExhausted(
  quota: GenerationQuota | null,
): boolean {
  return quota !== null && quota.remaining <= 0;
}
