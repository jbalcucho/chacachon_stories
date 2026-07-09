import type { Metadata } from "next";
import Link from "next/link";
import CrearPageActions from "@/components/CrearPageActions";
import { getLibraryStories } from "@/lib/stories";
import { hasPersonalizedReader } from "@/lib/story-content-index";

export const metadata: Metadata = {
  title: "Plantillas de cuentos",
  robots: { index: false },
};

export default async function CrearPlantillasPage() {
  const stories = await getLibraryStories();
  const templates = stories.filter(
    (s) => s.status === "PUBLISHED" && hasPersonalizedReader(s.slug),
  );

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
          Elige un cuento conocido — tres cerditos, Caperucita, hombre de
          jengibre y más. Lo adaptamos con tu familia y el dilema que elijas.
        </p>
      </header>

      <ul className="crear-template-list mt-8">
        {templates.map((story) => (
          <li key={story.slug}>
            <Link
              href={`/crear/adaptar?plantilla=${encodeURIComponent(story.slug)}`}
              className="crear-template-item"
            >
              <span className="crear-template-item__title">{story.title}</span>
              {story.description ? (
                <span className="crear-template-item__desc">
                  {story.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <p className="crear-footnote mt-6 text-center text-xs text-cream-muted">
        Al tocar una plantilla irás al asistente (próximamente con IA).
      </p>

      <CrearPageActions showBiblioteca={false} />
    </main>
  );
}
