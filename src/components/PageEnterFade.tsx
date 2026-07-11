"use client";

import { useEffect, useState, type ReactNode } from "react";
import { clearRouteFade } from "@/lib/route-fade";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Entrada suave de página (opacidad + leve subida). */
export default function PageEnterFade({ children, className = "" }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearRouteFade();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`page-enter${ready ? " page-enter--ready" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
