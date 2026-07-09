"use client";

import Link from "next/link";

type Props = {
  reset: () => void;
};

export default function LeerError({ reset }: Props) {
  return (
    <div className="story-reader">
      <div className="story-reader__night" aria-hidden="true" />
      <main className="story-reader__article text-center">
        <h1 className="story-reader__title">No se pudo cargar el cuento</h1>
        <p className="mt-4 text-sm text-cream-muted">
          Hubo un problema al leer el archivo. Intenta de nuevo.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow"
          >
            Reintentar
          </button>
          <Link href="/" className="text-sm font-semibold text-cream-muted hover:text-honey-glow">
            ← Biblioteca
          </Link>
        </div>
      </main>
    </div>
  );
}
