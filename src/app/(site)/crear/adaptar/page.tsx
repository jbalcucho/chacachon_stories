import type { Metadata } from "next";
import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";
import CrearProgress from "@/components/CrearProgress";
import StoryRecipeBuilder from "@/components/StoryRecipeBuilder";
import { getReaderProfile } from "@/lib/reader-profile";
import { getGenerationQuotaForUser } from "@/lib/generation-limits";
import { getSessionUser } from "@/lib/session";
import { buildRecipeIngredients } from "@/lib/story-recipe";
import { getPlantillaPrefill } from "@/lib/story-plantillas";

export const metadata: Metadata = {
  title: "Armar cuento",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ plantilla?: string }>;
};

export default async function CrearAdaptarPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  const userId = user?.id ?? null;
  const { perfil, source } = await getReaderProfile(userId);
  const generationQuota = user
    ? await getGenerationQuotaForUser(user.id)
    : null;
  const ingredients = buildRecipeIngredients(perfil);
  const params = await searchParams;
  const rawPlantilla = params.plantilla?.trim() || null;
  const plantilla = rawPlantilla ? getPlantillaPrefill(rawPlantilla) : null;
  const plantillaSlug = plantilla?.slug ?? null;
  const unknownPlantilla = Boolean(rawPlantilla && !plantilla);

  return (
    <main className="crear-main crear-main--recipe mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="crear-hero text-center sm:text-left">
        <div
          className="crear-hero__mark flex justify-center sm:justify-start"
          aria-hidden="true"
        >
          <BrandIllustration variant="crear" />
        </div>
        <p className="crear-hero__eyebrow">Paso 2 · Arma la receta</p>
        <h1 className="title-display crear-hero__title text-2xl sm:text-3xl">
          Arma tu cuento
        </h1>
        <p className="intro-copy crear-hero__lead mt-2 max-w-none text-sm sm:text-base">
          {plantilla
            ? `Plantilla «${plantilla.label}»: molde y reto ya vienen listos. Completa el resto y crea con IA.`
            : "Sigue los pasos para armar la receta. En el último paso revisas y creas tu cuento con IA."}
        </p>
      </header>

      {unknownPlantilla ? (
        <p className="crear-banner crear-banner--warn mt-4" role="status">
          No reconocimos esa plantilla. Puedes armar la receta desde cero o{" "}
          <Link href="/crear/plantillas" className="font-bold underline">
            elegir un clásico
          </Link>
          .
        </p>
      ) : null}

      <CrearProgress activeStep={2} />

      <div className="mt-6">
        <StoryRecipeBuilder
          ingredients={ingredients}
          profileSource={source}
          plantillaSlug={plantillaSlug}
          plantillaLabel={plantilla?.label ?? null}
          isLoggedIn={Boolean(user)}
          generationQuota={generationQuota}
        />
      </div>
    </main>
  );
}
