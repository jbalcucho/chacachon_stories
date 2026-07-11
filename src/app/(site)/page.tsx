import BrandIllustration from "@/components/BrandIllustration";
import HomeProfileGreeting from "@/components/family/HomeProfileGreeting";
import PageEnterFade from "@/components/PageEnterFade";
import StoryBookshelf from "@/components/StoryBookshelf";
import { DEMO_SHOWCASE_STORIES } from "@/lib/onboarding";
import { getSessionUser } from "@/lib/session";
import { getLibraryStories, type StoryCard } from "@/lib/stories";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) {
  const user = await getSessionUser();
  const { libro } = await searchParams;
  const isGuest = !user;

  const stories: StoryCard[] = user
    ? await getLibraryStories()
    : (DEMO_SHOWCASE_STORIES as StoryCard[]);

  return (
    <PageEnterFade>
      <main className="home-main home-page mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
        <header className="home-hero mb-2 text-center sm:mb-3">
          <BrandIllustration variant="hero" priority />
          <h1 className="title-display text-3xl sm:text-5xl">
            Las histor
            <span className="title-ia" title="Historias con inteligencia artificial">
              IA
            </span>
            s de Chacachón
          </h1>
          <p className="intro-copy mx-auto mt-2 max-w-lg text-sm sm:mt-3 sm:text-base">
            Para leer juntos en casa, de paseo o en cualquier momento.
          </p>
          <ul className="home-diffs" aria-label="Lo que nos hace distintos">
            <li className="home-diffs__item">De tu familia</li>
            <li className="home-diffs__item" aria-hidden="true">
              ·
            </li>
            <li className="home-diffs__item">Con voz propia</li>
            <li className="home-diffs__item" aria-hidden="true">
              ·
            </li>
            <li className="home-diffs__item">Cuando los necesiten</li>
          </ul>
        </header>

        {!isGuest ? (
          <div className="home-page__banner mb-3 sm:mb-4">
            <HomeProfileGreeting />
          </div>
        ) : null}

        <StoryBookshelf
          stories={stories}
          initialSlug={libro ?? null}
          label="Mi biblioteca"
          subtitle="¿Qué vamos a leer hoy?"
          allowCreate={Boolean(user)}
          preferFirst={isGuest}
          guestMode={isGuest}
        />
      </main>
    </PageEnterFade>
  );
}
