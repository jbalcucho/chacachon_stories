/** Transición corta al salir del home hacia un cuento o prueba. */

export const ROUTE_FADE_MS = 320;

export function startRouteFade(): void {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("route-fade-exit");
}

export function clearRouteFade(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("route-fade-exit");
}

export function navigateWithFade(
  push: (href: string) => void,
  href: string,
): void {
  startRouteFade();
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => push(href), reduce ? 0 : ROUTE_FADE_MS);
}
