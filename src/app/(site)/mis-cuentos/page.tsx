import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BrandIllustration from "@/components/BrandIllustration";
import CrearPageActions from "@/components/CrearPageActions";
import GeneratedStoryList from "@/components/GeneratedStoryList";
import { listGeneratedStoriesForUser } from "@/lib/generated-stories.server";
import { getGenerationDailyLimit } from "@/lib/generation-limits";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Mis cuentos",
  robots: { index: false, follow: false },
};

export default async function MisCuentosPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?callbackUrl=/mis-cuentos");
  }

  const stories = await listGeneratedStoriesForUser(user.id);
  const dailyLimit = getGenerationDailyLimit();

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-12 sm:px-6">
      <header className="crear-hero text-center sm:text-left">
        <div
          className="crear-hero__mark flex justify-center sm:justify-start"
          aria-hidden="true"
        >
          <BrandIllustration variant="crear" />
        </div>
        <p className="crear-hero__eyebrow">Tus creaciones</p>
        <h1 className="title-display crear-hero__title text-2xl sm:text-3xl">
          Mis cuentos
        </h1>
        <p className="intro-copy crear-hero__lead mt-2 max-w-none text-sm sm:text-base">
          Los cuentos que armaste con IA quedan guardados aquí. Puedes crear hasta{" "}
          {dailyLimit} por día.
        </p>
      </header>

      {stories.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-white/12 bg-white/5 p-6 text-center">
          <p className="text-4xl" aria-hidden="true">
            📚
          </p>
          <h2 className="title-display mt-3 text-xl">Aún no tienes cuentos</h2>
          <p className="intro-copy mt-2 text-sm">
            Arma tu primera receta con los nombres de tu familia y deja que la IA
            escriba el cuento.
          </p>
          <Link
            href="/crear/adaptar"
            className="mt-5 inline-flex rounded-full border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow transition hover:bg-honey/30"
          >
            Crear mi primer cuento →
          </Link>
        </section>
      ) : (
        <GeneratedStoryList
          stories={stories.map((story) => ({
            id: story.id,
            title: story.title,
            source: story.source,
            createdAt: story.createdAt.toISOString(),
            hiddenAt: story.hiddenAt ? story.hiddenAt.toISOString() : null,
          }))}
        />
      )}

      {stories.length > 0 ? (
        <p className="crear-footnote mt-6 text-center text-xs text-cream-muted">
          Toca un cuento para seguir leyendo donde lo dejaste.
        </p>
      ) : null}

      <CrearPageActions showMisCuentos={false} />
    </main>
  );
}
