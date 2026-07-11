"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readActiveProfile, type ActiveProfile } from "@/lib/active-profile";

export default function HomeProfileGreeting() {
  const [active, setActive] = useState<ActiveProfile | null>(null);

  useEffect(() => {
    function sync() {
      setActive(readActiveProfile());
    }
    sync();
    window.addEventListener("chacachon:active-profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("chacachon:active-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!active) return null;

  return (
    <p className="crear-banner crear-banner--info mx-auto mb-4 max-w-2xl text-center" role="status">
      Hola, <strong className="text-honey-glow">{active.label}</strong>
      {" · "}
      <Link href="/perfiles" className="font-bold text-honey-glow underline">
        Cambiar perfil
      </Link>
      {" · "}
      <Link href="/familia" className="font-bold text-honey-glow underline">
        Editar casa
      </Link>
    </p>
  );
}
