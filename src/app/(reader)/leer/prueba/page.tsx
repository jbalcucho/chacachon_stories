"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StoryReader from "@/components/StoryReader";
import {
  clearTrialStory,
  readTrialStory,
  trialMarkdownToContent,
  type TrialStoryPayload,
} from "@/lib/trial-story";

const LOGIN_HREF = `/login?callbackUrl=${encodeURIComponent("/crear")}`;

export default function LeerPruebaPage() {
  const [payload, setPayload] = useState<TrialStoryPayload | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setPayload(readTrialStory());
  }, []);

  const content = useMemo(() => {
    if (!payload) return null;
    return trialMarkdownToContent(payload.markdown);
  }, [payload]);

  if (payload === undefined) {
    return (
      <div className="grid h-dvh place-items-center px-4 text-center">
        <p className="intro-copy">Cargando tu cuento de prueba…</p>
      </div>
    );
  }

  if (!payload || !content) {
    return (
      <div className="mx-auto flex h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="title-display text-2xl">No hay cuento de prueba</h1>
        <p className="intro-copy text-sm">
          Empieza de nuevo con un nombre y un momento o clásico.
        </p>
        <Link
          href="/probar"
          className="rounded-xl border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow"
        >
          Probar un cuento →
        </Link>
        <Link href="/" className="text-sm font-semibold text-cream-muted underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const lessonLine = payload.lessonLabel
    ? `En esta historia, ${payload.name} practica ${payload.lessonLabel.toLowerCase()}.`
    : null;

  return (
    <div className="relative h-dvh">
      <div className="trial-reader-banner" role="status">
        <p>
          Prueba
          {payload.source && payload.source !== "mock" ? " con IA" : ""}
          {" · "}
          <strong>{payload.name}</strong>
          {payload.ageBandLabel ? ` · ${payload.ageBandLabel}` : ""}
          {payload.frameLabel ? ` · ${payload.frameLabel}` : ""}
          {payload.companionLabel ? ` · con ${payload.companionLabel}` : ""}
          {payload.petLabel ? ` · ${payload.petLabel}` : ""}
          {" · "}
          no se guarda.
        </p>
        {lessonLine ? (
          <p className="trial-reader-banner__lesson">{lessonLine}</p>
        ) : null}
        <div className="trial-reader-banner__actions">
          <Link href={LOGIN_HREF} className="trial-reader-banner__cta">
            Guardar gratis con tu familia →
          </Link>
          <button
            type="button"
            className="trial-reader-banner__clear"
            onClick={() => {
              clearTrialStory();
              window.location.href = "/probar";
            }}
          >
            Otra prueba
          </button>
        </div>
      </div>
      <StoryReader
        content={content}
        profileSource="user"
        storyTitle={content.title}
        storySlug="prueba"
        backHref="/probar"
        backLabel="Otra prueba"
        shareable={false}
        loginCallbackUrl="/crear"
        endConversion={{
          title: "¿Te gustó?",
          body: "Así son los cuentos de Chacachón: de tu casa, con enseñanza suave. Ingresa gratis y arma tu familia de verdad.",
          href: LOGIN_HREF,
          ctaLabel: "Ingresar gratis →",
        }}
      />
    </div>
  );
}
