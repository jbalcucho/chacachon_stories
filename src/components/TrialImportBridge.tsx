"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearTrialStory, readTrialStory } from "@/lib/trial-story";

/**
 * Al aterrizar en /crear recién logueado, si queda un cuento de prueba en
 * sessionStorage, lo guarda en la cuenta y redirige al lector (Fase 3: no
 * perder el cuento del trial al hacer login).
 */
export default function TrialImportBridge() {
  const { status } = useSession();
  const router = useRouter();
  const attempted = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || attempted.current) return;
    const trial = readTrialStory();
    if (!trial?.markdown) return;
    attempted.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/cuentos/importar-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: trial.markdown,
            name: trial.name,
            path: trial.path,
            ageBandId: trial.ageBandId,
            momentId: trial.momentId,
            classicId: trial.classicId,
            source: trial.source,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { id?: string };
        clearTrialStory();
        if (data.id) router.replace(`/leer/generado/${data.id}`);
      } catch {
        /* si falla, el usuario sigue en /crear normalmente */
      }
    })();
  }, [status, router]);

  return null;
}
