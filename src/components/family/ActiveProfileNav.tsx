"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readActiveProfile,
  type ActiveProfile,
} from "@/lib/active-profile";

/** Chip en header: muestra el perfil activo y lleva al selector. */
export default function ActiveProfileNav() {
  const [active, setActive] = useState<ActiveProfile | null>(null);

  useEffect(() => {
    function sync() {
      setActive(readActiveProfile());
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("chacachon:active-profile", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("chacachon:active-profile", sync);
    };
  }, []);

  return (
    <Link
      href="/perfiles"
      className="active-profile-nav"
      title="Cambiar perfil"
    >
      {active ? (
        <>
          <span
            className="active-profile-nav__avatar"
            style={{ ["--avatar-hue" as string]: active.hue }}
            aria-hidden="true"
          >
            {active.initial}
          </span>
          <span className="active-profile-nav__label">{active.label}</span>
        </>
      ) : (
        <span className="active-profile-nav__label">Perfiles</span>
      )}
    </Link>
  );
}
