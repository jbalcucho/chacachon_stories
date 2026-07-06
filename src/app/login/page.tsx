"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
      <div className="text-4xl" aria-hidden="true">
        🌙
      </div>
      <h1 className="title-gradient mt-4 text-3xl font-extrabold">
        Entrar a Chacachón
      </h1>
      <p className="mt-4 font-serif text-sm leading-relaxed text-night-soft">
        Inicia sesión con Google para guardar el perfil de tu familia y
        personalizar cuentos. Leer la biblioteca no requiere cuenta.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="mt-8 rounded-xl border border-gold/30 bg-gold/15 px-6 py-3 text-sm font-bold text-gold-soft transition hover:bg-gold/25"
      >
        Continuar con Google
      </button>
    </main>
  );
}
