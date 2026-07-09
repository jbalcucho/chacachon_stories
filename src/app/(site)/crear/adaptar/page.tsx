import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import CrearProgress from "@/components/CrearProgress";
import StoryRecipeBuilder from "@/components/StoryRecipeBuilder";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { buildRecipeIngredients } from "@/lib/story-recipe";

export const metadata: Metadata = {
  title: "Armar cuento",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ plantilla?: string }>;
};

export default async function CrearAdaptarPage({ searchParams }: PageProps) {
  const userId = await getSessionUserId();
  const { perfil, source } = await getReaderProfile(userId);
  const ingredients = buildRecipeIngredients(perfil);
  const params = await searchParams;
  const plantillaSlug = params.plantilla?.trim() || null;

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-14 sm:px-6">
      <header className="crear-hero text-center sm:text-left">
        <div
          className="crear-hero__mark flex justify-center sm:justify-start"
          aria-hidden="true"
        >
          <BrandMark id="brand-mark-adaptar" variant="compact" />
        </div>
        <p className="crear-hero__eyebrow">Paso 2 · Arma la receta</p>
        <h1 className="title-display crear-hero__title text-2xl sm:text-3xl">
          Arma tu cuento
        </h1>
        <p className="intro-copy crear-hero__lead mt-2 max-w-none text-sm sm:text-base">
          <span className="recipe-copy-touch">Toca cada ingrediente</span>
          <span className="recipe-copy-drag"> o arrástralo en computador</span>{" "}
          para llenar la receta. La IA escribirá con los nombres y el tono de tu
          familia.
        </p>
      </header>

      <CrearProgress activeStep={2} />

      <p className="mt-4 text-center text-sm sm:text-left">
        <Link
          href="/crear"
          className="font-semibold text-honey-glow hover:underline"
        >
          ← Cambiar camino
        </Link>
      </p>

      <div className="mt-6">
        <StoryRecipeBuilder
          ingredients={ingredients}
          profileSource={source}
          plantillaSlug={plantillaSlug}
        />
      </div>

      <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
        <Link href="/crear" className="font-semibold text-honey-glow">
          ← Hub crear
        </Link>
        <Link href="/" className="font-semibold text-cream-muted hover:text-cream">
          Biblioteca
        </Link>
      </p>
    </main>
  );
}
