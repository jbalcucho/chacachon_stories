import BrandMark from "@/components/BrandMark";
import StoryBookshelf from "@/components/StoryBookshelf";
import { getLibraryStories } from "@/lib/stories";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) {
  const stories = await getLibraryStories();
  const { libro } = await searchParams;

  return (
    <main className="home-main mx-auto max-w-5xl px-4 py-4 pb-8 sm:px-6 sm:py-6 sm:pb-10">
      <header className="home-hero mb-4 text-center sm:mb-5">
        <div className="brand-mark-wrap" aria-hidden="true">
          <span className="brand-mark-star brand-mark-star--a">✦</span>
          <BrandMark id="brand-mark-hero" variant="hero" />
          <span className="brand-mark-star brand-mark-star--b">✧</span>
        </div>
        <h1 className="title-display text-3xl sm:text-5xl">
          Las histor
          <span className="title-ia" title="Historias con inteligencia artificial">
            IA
          </span>
          s de Chacachón
        </h1>
        <p className="intro-copy mx-auto mt-2 max-w-lg text-sm sm:mt-3 sm:text-lg">
          ¿Qué vamos a leer hoy?
        </p>
      </header>

      <StoryBookshelf
        stories={stories}
        initialSlug={libro ?? null}
        label="Mi biblioteca"
      />
    </main>
  );
}
