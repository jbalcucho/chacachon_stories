"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
      <div className="text-4xl" aria-hidden="true">
        🌙
      </div>
      <h1 className="title-display mt-4 text-3xl">
        Entrar a Chacachón
      </h1>
      <p className="intro-copy mt-4 text-sm">
        Inicia sesión con Google para guardar el perfil de tu familia y
        personalizar cuentos. Leer la biblioteca no requiere cuenta.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/familia" })}
        className="mt-8 rounded-xl border-2 border-honey/45 bg-honey/20 px-6 py-3 text-sm font-bold text-honey-glow transition hover:bg-honey/30"
      >
        Continuar con Google
      </button>
    </main>
  );
}
