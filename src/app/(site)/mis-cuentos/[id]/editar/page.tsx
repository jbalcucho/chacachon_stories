import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BrandIllustration from "@/components/BrandIllustration";
import EditGeneratedStoryForm from "@/components/EditGeneratedStoryForm";
import { getGeneratedStory } from "@/lib/generated-stories.server";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Editar cuento",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarCuentoPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    const { id } = await params;
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/mis-cuentos/${id}/editar`)}`,
    );
  }

  const { id } = await params;
  const story = await getGeneratedStory(id);
  if (!story || story.userId !== user.id) notFound();

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-16 sm:px-6">
      <header className="crear-hero text-center sm:text-left">
        <div
          className="crear-hero__mark flex justify-center sm:justify-start"
          aria-hidden="true"
        >
          <BrandIllustration variant="crear" />
        </div>
        <p className="crear-hero__eyebrow">Editar</p>
        <h1 className="title-display crear-hero__title text-2xl sm:text-3xl">
          Ajusta este cuento a tu gusto
        </h1>
        <p className="intro-copy crear-hero__lead mt-2 max-w-none text-sm sm:text-base">
          Es tuyo: cambiá un nombre, una frase, lo que quieras. Solo tu
          familia lo lee — no se comparte ni se revisa de nuevo con IA.
        </p>
      </header>

      <EditGeneratedStoryForm
        id={id}
        initialTitle={story.title}
        initialBodyMarkdown={story.bodyMarkdown}
      />
    </main>
  );
}
