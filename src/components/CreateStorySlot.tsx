"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CREATE_STORY_CARD } from "@/lib/create-story";
import { bookGlowStyle, getBookTheme } from "@/lib/book-theme";
import { navigateWithFade } from "@/lib/route-fade";

type Props = {
  /** primary = dorado a la derecha; mirror = espejo discreto a la izquierda */
  variant?: "primary" | "mirror";
  href?: string;
  label?: string;
  shortLabel?: string;
  ariaLabel?: string;
  /** Usa velo de salida antes de navegar (home → probar/crear). */
  fadeNavigate?: boolean;
};

function renderCreateLabel(label: string) {
  const match = label.match(/^(.*)(IA)$/i);
  if (!match) return label;
  return (
    <>
      {match[1]}
      <span className="library-create-slot__ia">IA</span>
    </>
  );
}

/** Lomo fijo en el estante: no participa en el carrusel. */
export default function CreateStorySlot({
  variant = "primary",
  href = "/crear",
  label = "Nuevo Cuento",
  shortLabel = "Nuevo",
  ariaLabel = "Crear cuento nuevo con IA",
  fadeNavigate = false,
}: Props) {
  const router = useRouter();
  const theme = getBookTheme(CREATE_STORY_CARD);
  const isMirror = variant === "mirror";
  const spineLabel = isMirror ? shortLabel : label;
  const longLabel = !isMirror && label.length > 18;

  return (
    <Link
      href={href}
      className={`library-create-slot library-create-slot--${variant}${longLabel ? " library-create-slot--tall-label" : ""}`}
      style={bookGlowStyle(theme)}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={(event) => {
        if (!fadeNavigate) return;
        event.preventDefault();
        navigateWithFade((path) => router.push(path), href);
      }}
    >
      {!isMirror ? (
        <>
          <span className="library-create-slot__aura" aria-hidden="true" />
          <span className="library-create-slot__shimmer" aria-hidden="true" />
        </>
      ) : null}
      <span
        className={`library-create-slot__spine bg-gradient-to-b ${theme.spine}`}
      >
        <span className="library-create-slot__ridge" aria-hidden="true" />
        {!isMirror ? (
          <span className="library-create-slot__sparkle" aria-hidden="true">
            ✦
          </span>
        ) : null}
        <span className="library-create-slot__label">
          {renderCreateLabel(spineLabel)}
        </span>
      </span>
    </Link>
  );
}
