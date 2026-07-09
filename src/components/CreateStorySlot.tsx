import Link from "next/link";
import { CREATE_STORY_CARD } from "@/lib/create-story";
import { bookGlowStyle, getBookTheme } from "@/lib/book-theme";

/** Lomo fijo al final del estante: no participa en el carrusel. */
export default function CreateStorySlot() {
  const theme = getBookTheme(CREATE_STORY_CARD);

  return (
    <Link
      href="/crear"
      className="library-create-slot"
      style={bookGlowStyle(theme)}
      aria-label="Crear cuento nuevo con IA"
      title="Cuento nuevo"
    >
      <span className="library-create-slot__aura" aria-hidden="true" />
      <span className="library-create-slot__shimmer" aria-hidden="true" />
      <span
        className={`library-create-slot__spine bg-gradient-to-b ${theme.spine}`}
      >
        <span className="library-create-slot__ridge" aria-hidden="true" />
        <span className="library-create-slot__sparkle" aria-hidden="true">
          ✦
        </span>
        <span className="library-create-slot__label">Nuevo</span>
      </span>
    </Link>
  );
}
