"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { isSafeAppPath } from "@/lib/active-profile";

function LoginForm() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("callbackUrl") || "/";
  const callbackUrl = isSafeAppPath(raw) ? raw : "/";

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
      <div className="text-4xl" aria-hidden="true">
        🌙
      </div>
      <h1 className="title-display mt-4 text-3xl">Entrar a Chacachón</h1>
      <p className="intro-copy mt-4 text-sm">
        Inicia sesión con Google para armar tu casa, elegir perfil y
        personalizar cuentos. Sin cuenta puedes mirar las muestras del estante.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-8 rounded-xl border-2 border-honey/45 bg-honey/20 px-6 py-3 text-sm font-bold text-honey-glow transition hover:bg-honey/30"
      >
        Continuar con Google
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-5 py-16 text-center">
          <p className="intro-copy">Cargando…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
