/**
 * Onboarding: login → casa familiar → perfil activo → app.
 */

import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { isSafeAppPath } from "@/lib/active-profile";

export const FAMILY_READY_STORAGE_KEY = "chacachon.familyReady";

export function householdIsReady(
  perfil: FamilyProfileDocument | null | undefined,
): boolean {
  const ninos = perfil?.ninos?.length ?? 0;
  const adultos = perfil?.adultos?.length ?? 0;
  return ninos >= 1 && adultos >= 1;
}

export function readFamilyReadyCache(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(FAMILY_READY_STORAGE_KEY);
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

export function writeFamilyReadyCache(ready: boolean): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FAMILY_READY_STORAGE_KEY, ready ? "1" : "0");
}

export function clearFamilyReadyCache(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(FAMILY_READY_STORAGE_KEY);
}

export function buildFamiliaHref(nextPath: string): string {
  const next = isSafeAppPath(nextPath) ? nextPath : "/";
  if (next === "/familia") return "/familia";
  return `/familia?next=${encodeURIComponent(next)}`;
}

/** Demos del home anónimo (sin login). */
export type DemoShowcaseStory = {
  slug: string;
  title: string;
  description: string | null;
  moraleja: string | null;
  familyTag: string | null;
  htmlPath: string | null;
  openPath: string | null;
  variant: "NARRATIVE" | "APARTMENT" | "PILOT";
  status: "PUBLISHED";
};

export function isDemoShowcaseStory(story: { slug: string }): boolean {
  return story.slug.startsWith("demo-");
}

export const DEMO_SHOWCASE_STORIES: DemoShowcaseStory[] = [
  {
    slug: "demo-noche-en-casa",
    title: "Noche en casa",
    description: "Un cuento corto de ejemplo para conocer Chacachón.",
    moraleja: "A veces apagar la tablet también enciende la calma.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/demo-noche-en-casa.html",
    openPath: "/cuentos/demo-noche-en-casa.html",
    variant: "APARTMENT",
    status: "PUBLISHED",
  },
  {
    slug: "demo-el-trancon",
    title: "El trancón",
    description: "Humor de ciudad y paciencia en el camino.",
    moraleja: "Respirar ayuda más que pitar.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/demo-el-trancon.html",
    openPath: "/cuentos/demo-el-trancon.html",
    variant: "NARRATIVE",
    status: "PUBLISHED",
  },
  {
    slug: "demo-bingo-detective",
    title: "Bingo detective",
    description: "La mascota también tiene misterios que resolver.",
    moraleja: "Buscar juntos es más divertido que encontrar solo.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/demo-bingo-detective.html",
    openPath: "/cuentos/demo-bingo-detective.html",
    variant: "PILOT",
    status: "PUBLISHED",
  },
];
