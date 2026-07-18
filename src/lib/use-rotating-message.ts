"use client";

import { useEffect, useState } from "react";

/**
 * Rota mensajes cada `intervalMs` mientras `active` sea true, para comunicar
 * que hay trabajo de calidad pasando (generación + gates) durante una espera
 * larga, en vez de un botón deshabilitado con un solo texto estático.
 */
export function useRotatingMessage(
  messages: string[],
  active: boolean,
  intervalMs = 2200,
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, messages.length]);

  return messages[index] ?? messages[0] ?? "";
}
