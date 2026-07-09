import type { Metadata } from "next";
import Link from "next/link";
import StoryRecipeBuilder from "@/components/StoryRecipeBuilder";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { buildRecipeIngredients } from "@/lib/story-recipe";

export const metadata: Metadata = {
  title: "Armar cuento",
  robots: { index: false },
};

export default async function CrearAdaptarPage() {
  const userId = await getSessionUserId();
  const { perfil, source } = await getReaderProfile(userId);
  const ingredients = buildRecipeIngredients(perfil);

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-14 sm:px-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-honey-glow">
          Arma tu receta
        </p>
        <h1 className="title-display mt-2 text-2xl sm:text-3xl">
          Arrastra a tu familia al cuento
        </h1>
        <p className="intro-copy mt-2 text-sm">
          Toca o arrastra los ingredientes a cada casilla. Cuando la receta esté
          lista, la IA escribirá el cuento con tus nombres y el tono de tu familia.
        </p>
      </header>

      <div className="mt-6">
        <StoryRecipeBuilder ingredients={ingredients} profileSource={source} />
      </div>

      <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
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
