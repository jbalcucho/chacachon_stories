import HeroMoon from "@/components/HeroMoon";
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
    <main className="home-main mx-auto max-w-5xl px-4 py-5 pb-8 sm:px-6 sm:py-6 sm:pb-10">
      <header className="mb-5 text-center sm:mb-6">
        <div className="hero-moon-wrap" aria-hidden="true">
          <span className="hero-moon-star hero-moon-star--a">✦</span>
          <HeroMoon />
          <span className="hero-moon-star hero-moon-star--b">✧</span>
        </div>
        <p className="font-display text-sm font-semibold tracking-wide text-honey-glow/90">
          Cuentos para leer en voz alta
        </p>
        <h1 className="title-display mt-1.5 text-4xl sm:text-5xl">
          Las historias de Chacachón
        </h1>
        <p className="intro-copy mx-auto mt-3 max-w-lg text-base sm:text-lg">
          ¿Qué vamos a leer hoy?
        </p>
      </header>

      <StoryBookshelf stories={stories} initialSlug={libro ?? null} />
    </main>
  );
}
