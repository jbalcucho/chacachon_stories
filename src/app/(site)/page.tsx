import BrandIllustration from "@/components/BrandIllustration";
import DemoModeBanner from "@/components/DemoModeBanner";
import StoryBookshelf from "@/components/StoryBookshelf";
import { getSessionUser } from "@/lib/session";
import { getLibraryStories } from "@/lib/stories";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) {
  const stories = await getLibraryStories();
  const { libro } = await searchParams;
  const user = await getSessionUser();

  return (
    <main className="home-main mx-auto max-w-5xl px-4 py-4 pb-8 sm:px-6 sm:py-6 sm:pb-10">
      <header className="home-hero mb-3 text-center sm:mb-4">
        <BrandIllustration variant="hero" priority />
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

      {!user ? (
        <div className="mx-auto mb-4 max-w-2xl">
          <DemoModeBanner loginCallbackUrl="/" />
        </div>
      ) : null}

      <StoryBookshelf
        stories={stories}
        initialSlug={libro ?? null}
        label="Mi biblioteca"
      />
    </main>
  );
}
