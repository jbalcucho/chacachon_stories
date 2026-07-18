import type { Metadata } from "next";
import Link from "next/link";
import BrandIllustration from "@/components/BrandIllustration";
import CrearHub, { type CrearHubOption } from "@/components/CrearHub";
import CrearPageActions from "@/components/CrearPageActions";
import TrialImportBridge from "@/components/TrialImportBridge";
import {
  familyProfileEssentialSchema,
  type FamilyProfileDocument,
} from "@/lib/family-profile-schema";
import {
  buildCrearPreviews,
  computeFamilyProfileCompletion,
} from "@/lib/family-profile-completion";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Crear cuento",
  description:
    "Crea un cuento personalizado con IA: inspirado en tu vida, basado en un cuento tradicional o con tu perfil familiar.",
};

type FamilyState = {
  perfil: FamilyProfileDocument | null;
  profileReady: boolean;
};

async function getFamilyState(userId: string | null): Promise<FamilyState> {
  if (!userId || !process.env.DATABASE_URL) {
    return { perfil: null, profileReady: false };
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.familyProfile.findUnique({
      where: { userId },
      select: { perfil: true },
    });
    if (!row?.perfil) {
      return { perfil: null, profileReady: false };
    }
    const parsed = familyProfileEssentialSchema.safeParse(row.perfil);
    if (!parsed.success) {
      return { perfil: null, profileReady: false };
    }
    return { perfil: parsed.data, profileReady: true };
  } catch {
    return { perfil: null, profileReady: false };
  }
}

function buildOptions(
  user: boolean,
  profileReady: boolean,
  previews: ReturnType<typeof buildCrearPreviews>,
): CrearHubOption[] {
  const vida: CrearHubOption = {
    id: "vida",
    href: "/crear/adaptar",
    primary: true,
    kicker: user
      ? profileReady
        ? "Recomendado"
        : "Empieza ya"
      : "Modo demo",
    emoji: "✨",
    title: "Inspirado en tu vida",
    body: user
      ? profileReady
        ? "Arma la receta con tu familia, el reto del día y —si quieres— un molde clásico. La IA escribe con sus nombres y su tono."
        : "Crea tu primer cuento ya mismo con la familia demo Chacachón. Completa tu perfil cuando quieras para que la IA use los nombres de tu casa."
      : "Prueba el asistente con la familia demo Chacachón. Entra con Google para guardar y usar tus nombres.",
    cta: user
      ? "Armar mi receta →"
      : "Probar con familia demo →",
    preview: previews.vida,
  };

  const tradicional: CrearHubOption = {
    id: "tradicional",
    href: "/crear/plantillas",
    primary: false,
    kicker: "Clásicos",
    emoji: "📖",
    title: "Basado en un cuento tradicional",
    body: "Tres cerditos, Caperucita, el hombre de jengibre… Eliges el clásico; nosotros lo vestimos con tu hogar.",
    cta: "Ver plantillas →",
    preview: previews.tradicional,
  };

  // Para usuarios logueados el medidor de perfil arriba del hub (crear-profile-meter)
  // ya cubre esta misma acción -> no la dupliques como si fuera una tercera forma de
  // crear un cuento. Solo aparece para invitados, que no ven ese medidor.
  if (user) {
    return [vida, tradicional];
  }

  const perfil: CrearHubOption = {
    id: "perfil",
    href: "/familia",
    variant: "utility",
    primary: false,
    kicker: "Perfil",
    emoji: "👤",
    title: "Edita tu perfil de cuentos",
    body: "Nombres, mascotas, frases y acento. Los cuentos del catálogo ya suenan a tu casa al leerlos.",
    cta: "Ir a mi familia →",
    preview: previews.perfil,
  };

  return [vida, tradicional, perfil];
}

export default async function CrearPage() {
  const user = await getSessionUser();
  const { perfil, profileReady } = await getFamilyState(user?.id ?? null);
  const previews = buildCrearPreviews(perfil);
  const options = buildOptions(Boolean(user), profileReady, previews);
  const completion = user
    ? computeFamilyProfileCompletion(perfil)
    : null;
  const defaultPreview =
    options.find((o) => o.primary)?.preview ?? options[0].preview;

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-12 sm:px-6 sm:py-8">
      <header className="crear-hero text-center">
        <div className="crear-hero__mark" aria-hidden="true">
          <BrandIllustration variant="crear" />
        </div>
        <p className="crear-hero__eyebrow">Crear con IA</p>
        <h1 className="title-display crear-hero__title">Tu cuento, tu familia</h1>
        <p className="intro-copy crear-hero__lead mx-auto max-w-lg">
          Un cuento nuevo{" "}
          <strong className="crear-hero__emph">inspirado en ti y tu familia</strong>
          , o basado en un cuento clásico. Edita tu perfil de cuentos si lo
          necesitas.
        </p>
        <p className="crear-hero__step">¿Por dónde empezamos?</p>
      </header>

      {!user ? (
        <p className="crear-banner crear-banner--info mt-6" role="status">
          Puedes leer el catálogo y armar recetas con la{" "}
          <strong className="text-cream">familia demo</strong>.{" "}
          <Link href="/login" className="font-bold text-honey-glow underline">
            Entra con Google
          </Link>{" "}
          para guardar cuentos y usar tu perfil.
        </p>
      ) : (
        <p className="crear-banner crear-banner--info mt-6" role="status">
          Elige{" "}
          <Link href="/perfiles" className="font-bold text-honey-glow underline">
            quién crea hoy
          </Link>{" "}
          y encuentra tus cuentos en{" "}
          <Link href="/mis-cuentos" className="font-bold text-honey-glow underline">
            Mis cuentos
          </Link>
          .
        </p>
      )}

      <TrialImportBridge />

      <CrearHub
        options={options}
        completion={completion}
        defaultPreview={defaultPreview}
      />

      <p className="crear-footnote mt-8 text-center text-xs text-cream-muted">
        Hasta 3 cuentos con IA al día · los encuentras siempre en Mis cuentos.
      </p>

      <CrearPageActions showCrear={false} />
    </main>
  );
}
