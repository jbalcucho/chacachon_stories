"use client";

import { useEffect } from "react";

/** Registra el SW en producción para cumplir criterios de instalación PWA. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sin SW la app sigue funcionando; solo afecta el prompt de instalación.
    });
  }, []);

  return null;
}
