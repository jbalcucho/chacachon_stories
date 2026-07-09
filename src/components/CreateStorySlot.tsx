import Link from "next/link";
import { CREATE_STORY_CARD } from "@/lib/create-story";
import { bookGlowStyle, getBookTheme } from "@/lib/book-theme";

type Props = {
  /** primary = dorado a la derecha; mirror = espejo discreto a la izquierda */
  variant?: "primary" | "mirror";
};

/** Lomo fijo en el estante: no participa en el carrusel. */
export default function CreateStorySlot({ variant = "primary" }: Props) {
  const theme = getBookTheme(CREATE_STORY_CARD);
  const isMirror = variant === "mirror";

  return (
    <Link
      href="/crear"
      className={`library-create-slot library-create-slot--${variant}`}
      style={bookGlowStyle(theme)}
      aria-label="Crear cuento nuevo con IA"
      title="Cuento nuevo"
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
          {isMirror ? "Nuevo" : "Nuevo Cuento"}
        </span>
      </span>
    </Link>
  );
}
