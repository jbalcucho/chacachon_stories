"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearRouteFade } from "@/lib/route-fade";

/**
 * Quita el velo de salida (`route-fade-exit`) en cada cambio de ruta.
 * Sin esto, el velo solo se limpiaba en páginas que montaban PageEnterFade
 * (home y /probar); navegar con fade hacia /crear o /leer dejaba la página
 * oscurecida y con pointer-events: none hasta recargar.
 */
export default function RouteFadeReset() {
  const pathname = usePathname();

  useEffect(() => {
    clearRouteFade();
  }, [pathname]);

  return null;
}
