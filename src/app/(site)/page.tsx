import BrandIllustration from "@/components/BrandIllustration";
import PageEnterFade from "@/components/PageEnterFade";
import StoryBookshelf from "@/components/StoryBookshelf";
import { listGeneratedStoriesForUser } from "@/lib/generated-stories.server";
import { DEMO_SHOWCASE_STORIES } from "@/lib/onboarding";
import { getSessionUser } from "@/lib/session";
import { getLibraryStories, type StoryCard } from "@/lib/stories";

async function buildHomeStories(
  userId: string,
): Promise<{ stories: StoryCard[]; hasFeaturedNew: boolean }> {
  const [catalog, generated] = await Promise.all([
    getLibraryStories(),
    listGeneratedStoriesForUser(userId),
  ]);

  // Un cuento oculto (ver Mis cuentos) nunca se propone como el destacado
  // del home, aunque sea el más reciente -- esa es justo la intención de
  // ocultarlo.
  const latest = generated.find((story) => !story.hiddenAt);
  if (!latest) {
    return { stories: catalog, hasFeaturedNew: false };
  }

  // Destacar el último cuento creado con IA al frente del estante, con
  // seña "Nuevo" (ver BookSpine/StoryBook), hasta que se cree otro.
  const newCard: StoryCard = {
    slug: latest.id,
    title: latest.title,
    description: null,
    moraleja: null,
    familyTag: null,
    htmlPath: null,
    openPath: `/leer/generado/${latest.id}`,
    variant: "NARRATIVE",
    status: "PUBLISHED",
    isNew: true,
  };
  return { stories: [newCard, ...catalog], hasFeaturedNew: true };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) {
  const user = await getSessionUser();
  const { libro } = await searchParams;
  const isGuest = !user;

  const { stories, hasFeaturedNew } = user
    ? await buildHomeStories(user.id)
    : { stories: DEMO_SHOWCASE_STORIES as StoryCard[], hasFeaturedNew: false };

  return (
    <PageEnterFade>
      <main className="home-main home-page mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
        <header className="home-hero mb-1 text-center sm:mb-1">
          <BrandIllustration variant="hero" priority />
          <h1 className="title-display text-3xl sm:text-5xl">
            Las histor
            <span className="title-ia" title="Historias con inteligencia artificial">
              IA
            </span>
            s de Chacachón
          </h1>
          <p className="home-tagline">
            Cuentos de fantasía inspirados en tu hogar
          </p>
        </header>

        <StoryBookshelf
          stories={stories}
          initialSlug={libro ?? null}
          label="Mi biblioteca"
          subtitle="¿Qué vamos a leer hoy?"
          allowCreate={Boolean(user)}
          preferFirst={isGuest || hasFeaturedNew}
          guestMode={isGuest}
        />
      </main>
    </PageEnterFade>
  );
}
