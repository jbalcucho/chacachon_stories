"use client";

import { useCallback, useState } from "react";
import {
  buildCatalogStoryShareMessage,
  whatsAppShareUrl,
} from "@/lib/story-share";

type Props = {
  title: string;
};

/**
 * Comparte un cuento del catálogo. Intenta Web Share API; si no hay, abre WhatsApp.
 * Solo debe usarse en `/leer/[slug]` (cuentos públicos con OG).
 */
export default function StoryShareButton({ title }: Props) {
  const [notice, setNotice] = useState<string | null>(null);

  const flash = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }, []);

  const share = useCallback(async () => {
    const url = window.location.href;
    const message = buildCatalogStoryShareMessage(title, url);

    if (navigator.share) {
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    window.open(whatsAppShareUrl(message), "_blank", "noopener,noreferrer");
  }, [title]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Enlace copiado");
    } catch {
      flash("No pudimos copiar el enlace");
    }
  }, [flash]);

  return (
    <div className="story-reader__share">
      <button
        type="button"
        className="story-reader__share-btn"
        onClick={share}
        aria-label="Compartir cuento"
        title="Compartir"
      >
        <span aria-hidden="true">↗</span>
        <span className="story-reader__share-label">Compartir</span>
      </button>
      <button
        type="button"
        className="story-reader__share-btn story-reader__share-btn--ghost"
        onClick={copyLink}
        aria-label="Copiar enlace del cuento"
        title="Copiar enlace"
      >
        <span aria-hidden="true">⎘</span>
      </button>
      {notice ? (
        <span className="story-reader__share-notice" role="status">
          {notice}
        </span>
      ) : null}
    </div>
  );
}
