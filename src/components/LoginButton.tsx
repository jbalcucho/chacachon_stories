"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-xs text-night-soft">···</span>
    );
  }

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-night-soft transition hover:bg-white/10 hover:text-white"
      >
        Salir
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-soft transition hover:bg-gold/20"
    >
      Entrar
    </button>
  );
}
