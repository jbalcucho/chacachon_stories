"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-xs font-bold text-cream-muted">···</span>
    );
  }

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-bold text-cream-muted transition hover:bg-white/18 hover:text-cream"
      >
        Salir
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/familia" })}
      className="rounded-full border-2 border-honey/45 bg-honey/20 px-3 py-1.5 text-xs font-bold text-honey-glow transition hover:bg-honey/30"
    >
      Entrar
    </button>
  );
}
