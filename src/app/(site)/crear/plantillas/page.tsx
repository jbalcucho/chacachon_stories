import type { Metadata } from "next";
import Link from "next/link";
import CrearPageActions from "@/components/CrearPageActions";
import { getLibraryStories } from "@/lib/stories";
import { hasPersonalizedReader } from "@/lib/story-content-index";
import {
  CLASSIC_PLANTILLAS,
  plantillaAdaptarHref,
} from "@/lib/story-plantillas";

export const metadata: Metadata = {
  title: "Plantillas de cuentos",
  robots: { index: false },
};

export default async function CrearPlantillasPage() {
  const stories = await getLibraryStories();
  const bySlug = new Map(stories.map((s) => [s.slug, s]));

  // Solo clásicos con lector personalizado (B4).
  const templates = CLASSIC_PLANTILLAS.map((plantilla) => {
    const story = bySlug.get(plantilla.slug);
    if (!story || story.status !== "PUBLISHED") return null;
    if (!hasPersonalizedReader(plantilla.slug)) return null;
    return { plantilla, story };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-12 sm:px-6">
      <header className="text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-honey-glow">
          Plantillas
        </p>
        <h1 className="title-display mt-2 text-2xl sm:text-3xl">
          Cuento tradicional
        </h1>
        <p className="intro-copy mt-2 text-sm">
          Elige un clásico — tres cerditos, Caperucita… El asistente prellena el
          molde y el reto; tú armas el resto con tu familia.
        </p>
      </header>

      {templates.length === 0 ? (
        <p className="crear-banner crear-banner--info mt-8" role="status">
          Aún no hay plantillas publicadas. Mientras tanto puedes{" "}
          <Link href="/crear/adaptar" className="font-bold text-honey-glow underline">
            armar una receta libre
          </Link>
          .
        </p>
      ) : (
        <ul className="crear-template-list mt-8">
          {templates.map(({ plantilla, story }) => (
            <li key={plantilla.slug}>
              <Link
                href={plantillaAdaptarHref(plantilla.slug)}
                className="crear-template-item"
              >
                <span className="crear-template-item__title">{story.title}</span>
                <span className="crear-template-item__desc">
                  Molde: {plantilla.label}
                  {story.description ? ` · ${story.description}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="crear-footnote mt-6 text-center text-xs text-cream-muted">
        Al tocar una plantilla abres el asistente con molde y reto listos.
      </p>

      <CrearPageActions showBiblioteca={false} />
    </main>
  );
}
