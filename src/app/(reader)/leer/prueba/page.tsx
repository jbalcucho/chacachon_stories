"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StoryReader from "@/components/StoryReader";
import {
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
    const story = readTrialStory();
    setPayload(story);
    if (!story?.markdown) return;

    // En local, copia el cuento actual a `.tmp/trial-stories/` para revisión conjunta.
    void fetch("/api/dev/trial-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: story.name,
        ageBandId: story.ageBandId,
        ageBandLabel: story.ageBandLabel,
        path: story.path,
        momentId: story.momentId,
        classicId: story.classicId,
        markdown: story.markdown,
        source: story.source,
        createdAt: story.createdAt,
        note: "leer/prueba sync",
      }),
    }).catch(() => {
      /* endpoint solo en dev; silenciar en prod */
    });
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

  return (
    <div className="trial-reader">
      <div className="trial-reader__stage">
        <StoryReader
          content={content}
          profileSource="user"
          storyTitle={content.title}
          storySlug="prueba"
          backHref="/probar"
          backLabel="Otra prueba"
          shareable={false}
          loginCallbackUrl="/crear"
          statusBadge="Prueba"
          endConversion={{
            title: "¿Quieres guardar cuentos como este?",
            body: "Crea tu familia gratis y los cuentos quedan en casa, con los nombres de verdad.",
            href: LOGIN_HREF,
            ctaLabel: "Guardar gratis →",
          }}
        />
      </div>
    </div>
  );
}
