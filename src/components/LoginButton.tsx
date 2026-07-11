"use client";

import { signIn, signOut, useSession } from "next-auth/react";

/** Tras login el gate decide: casa → perfiles → home. */
const AFTER_LOGIN = "/";

type Props = {
  /** ghost = secundario (estilo Krea Log in); honey = acento cálido */
  tone?: "ghost" | "honey";
};

export default function LoginButton({ tone = "ghost" }: Props) {
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

  const className =
    tone === "honey"
      ? "rounded-full border-2 border-honey/45 bg-honey/20 px-3 py-1.5 text-xs font-bold text-honey-glow transition hover:bg-honey/30"
      : "rounded-full border border-honey-glow/35 bg-transparent px-3 py-1.5 text-xs font-bold text-cream transition hover:border-honey-glow/55 hover:bg-white/10 hover:text-honey-glow";

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: AFTER_LOGIN })}
      className={className}
    >
      Ingresar
    </button>
  );
}
