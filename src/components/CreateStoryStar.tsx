"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateWithFade } from "@/lib/route-fade";

type Props = {
  href?: string;
  label?: string;
  ariaLabel?: string;
  /** Usa velo de salida antes de navegar (home → probar/crear). */
  fadeNavigate?: boolean;
};

/**
 * Botón flotante fijo sobre el estante: no participa en el carrusel ni
 * compite visualmente con los lomos de los libros (reemplaza el lomo
 * "espejo" + lomo dorado dentro de la grilla — ver revisión UX).
 */
export default function CreateStoryStar({
  href = "/crear",
  label = "Crear cuento",
  ariaLabel = "Crear cuento nuevo con IA",
  fadeNavigate = false,
}: Props) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className="create-story-star"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={(event) => {
        if (!fadeNavigate) return;
        event.preventDefault();
        navigateWithFade((path) => router.push(path), href);
      }}
    >
      <span className="create-story-star__aura" aria-hidden="true" />
      <span className="create-story-star__badge" aria-hidden="true">
        ✦
      </span>
      <span className="create-story-star__label">{label}</span>
    </Link>
  );
}
