import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Crear cuento",
  description:
    "Crea un cuento personalizado con IA: plantillas, tu familia y humor bogotano.",
};

async function hasFamilyProfile(userId: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.familyProfile.findUnique({
      where: { userId },
      select: { perfil: true },
    });
    return Boolean(row?.perfil);
  } catch {
    return false;
  }
}

export default async function CrearPage() {
  const user = await getSessionUser();
  const profileReady = user ? await hasFamilyProfile(user.id) : false;

  return (
    <main className="crear-main mx-auto max-w-2xl px-4 py-6 pb-12 sm:px-6 sm:py-8">
      <header className="text-center">
        <p className="font-display text-sm font-semibold text-honey-glow/90">
          ✨ Crear con IA
        </p>
        <h1 className="title-display mt-2 text-3xl sm:text-4xl">
          Tu cuento, tu familia
        </h1>
        <p className="intro-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
          Un cuento nuevo con los nombres de tu casa y humor de Bogotá. Primero
          elige cómo quieres empezar.
        </p>
      </header>

      {!user ? (
        <p className="crear-banner crear-banner--info mt-6" role="status">
          <Link href="/login" className="font-bold text-honey-glow underline">
            Entra con Google
          </Link>{" "}
          para guardar tus cuentos y usar el perfil familiar.
        </p>
      ) : !profileReady ? (
        <p className="crear-banner crear-banner--warn mt-6" role="status">
          Antes de crear,{" "}
          <Link href="/familia" className="font-bold text-honey-glow underline">
            completa tu familia
          </Link>{" "}
          (nombres, mascotas, frases).
        </p>
      ) : null}

      <div className="crear-grid mt-8">
        <Link
          href={user && profileReady ? "/crear/adaptar" : "/familia"}
          className="crear-card crear-card--primary"
        >
          <span className="crear-card__emoji" aria-hidden="true">
            👨‍👩‍👧‍👦
          </span>
          <h2 className="crear-card__title">Con mi familia</h2>
          <p className="crear-card__body">
            Elige un dilema (dormir, pantallas, respeto…) y adapta una plantilla
            con IA.
          </p>
          <span className="crear-card__cta">Empezar adaptación →</span>
        </Link>

        <Link href="/crear/plantillas" className="crear-card">
          <span className="crear-card__emoji" aria-hidden="true">
            📚
          </span>
          <h2 className="crear-card__title">Desde una plantilla</h2>
          <p className="crear-card__body">
            Cerditos del edificio, Operación a dormir y más arquetipos
            Chacachón.
          </p>
          <span className="crear-card__cta">Ver plantillas →</span>
        </Link>

        <Link href="/familia" className="crear-card">
          <span className="crear-card__emoji" aria-hidden="true">
            ✏️
          </span>
          <h2 className="crear-card__title">Solo personalizar</h2>
          <p className="crear-card__body">
            Los cuentos del catálogo ya llevan los nombres de tu hogar al leer.
          </p>
          <span className="crear-card__cta">Mi familia →</span>
        </Link>
      </div>

      <p className="crear-footnote mt-8 text-center text-xs text-cream-muted">
        Vista previa del flujo · la generación con IA llegará en la siguiente
        fase.
      </p>

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-cream-muted hover:text-honey-glow"
        >
          ← Volver a mi biblioteca
        </Link>
      </p>
    </main>
  );
}
