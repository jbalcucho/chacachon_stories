/**
 * Perfiles de lectura/creación (máx. 5), creados a mano.
 * Distintos del elenco familiar (niños/adultos en la casa).
 */

import { personAvatarHue, personAvatarInitial } from "@/lib/recipe-summary";

export const MAX_READER_PROFILES = 5;

export const ACTIVE_PROFILE_STORAGE_KEY = "chacachon.activeProfile.v3";
export const READER_PROFILES_STORAGE_KEY = "chacachon.readerProfiles.v1";

const LEGACY_KEYS = [
  "chacachon.activeProfile",
  "chacachon.activeProfile.v1",
  "chacachon.activeProfile.v2",
];

export type ActiveProfile = {
  id: string;
  label: string;
  initial: string;
  hue: number;
  createdAt: string;
};

export function purgeActiveProfileStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(READER_PROFILES_STORAGE_KEY);
  for (const key of LEGACY_KEYS) {
    window.localStorage.removeItem(key);
  }
}

function newProfileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `rp-${crypto.randomUUID()}`;
  }
  return `rp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeProfileName(raw: string): string | null {
  const label = raw.trim().replace(/\s+/g, " ");
  if (label.length < 1 || label.length > 40) return null;
  return label;
}

export function createReaderProfile(name: string): ActiveProfile | null {
  const label = normalizeProfileName(name);
  if (!label) return null;
  const id = newProfileId();
  return {
    id,
    label,
    initial: personAvatarInitial(label),
    hue: personAvatarHue(id),
    createdAt: new Date().toISOString(),
  };
}

export function readReaderProfiles(): ActiveProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READER_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActiveProfile[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p?.id && p?.label)
      .slice(0, MAX_READER_PROFILES)
      .map((p) => ({
        id: p.id,
        label: p.label,
        initial: p.initial || personAvatarInitial(p.label),
        hue: typeof p.hue === "number" ? p.hue : personAvatarHue(p.id),
        createdAt: p.createdAt || new Date(0).toISOString(),
      }));
  } catch {
    return [];
  }
}

export function writeReaderProfiles(profiles: ActiveProfile[]): void {
  if (typeof window === "undefined") return;
  const next = profiles.slice(0, MAX_READER_PROFILES);
  window.localStorage.setItem(READER_PROFILES_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("chacachon:reader-profiles", { detail: next }),
  );
}

export function addReaderProfile(
  name: string,
): { ok: true; profile: ActiveProfile } | { ok: false; error: string } {
  const profiles = readReaderProfiles();
  if (profiles.length >= MAX_READER_PROFILES) {
    return { ok: false, error: `Máximo ${MAX_READER_PROFILES} perfiles` };
  }
  const profile = createReaderProfile(name);
  if (!profile) {
    return { ok: false, error: "Escribe un nombre (1–40 caracteres)" };
  }
  if (
    profiles.some((p) => p.label.toLowerCase() === profile.label.toLowerCase())
  ) {
    return { ok: false, error: "Ya existe un perfil con ese nombre" };
  }
  writeReaderProfiles([...profiles, profile]);
  return { ok: true, profile };
}

export function removeReaderProfile(id: string): void {
  const profiles = readReaderProfiles().filter((p) => p.id !== id);
  writeReaderProfiles(profiles);
  const active = readActiveProfile();
  if (active?.id === id) {
    clearActiveProfile();
  }
}

export function readActiveProfile(): ActiveProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveProfile;
    if (!parsed?.id || !parsed?.label) return null;
    return {
      id: parsed.id,
      label: parsed.label,
      initial: parsed.initial || personAvatarInitial(parsed.label),
      hue: typeof parsed.hue === "number" ? parsed.hue : personAvatarHue(parsed.id),
      createdAt: parsed.createdAt || new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeActiveProfile(profile: ActiveProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(
    new CustomEvent("chacachon:active-profile", { detail: profile }),
  );
}

export function clearActiveProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("chacachon:active-profile", { detail: null }));
}

/** Borra lista + activo (reset de onboarding de perfiles). */
export function resetAllReaderProfiles(): void {
  purgeActiveProfileStorage();
  window.dispatchEvent(new CustomEvent("chacachon:active-profile", { detail: null }));
  window.dispatchEvent(new CustomEvent("chacachon:reader-profiles", { detail: [] }));
}

export function resolveActiveProfile(
  profiles: ActiveProfile[],
  stored: ActiveProfile | null,
): ActiveProfile | null {
  if (!stored) return null;
  return profiles.find((p) => p.id === stored.id) ?? null;
}

/**
 * El perfil de app no elige héroe del cuento: eso sigue en la receta / elenco.
 */
export function preferredHeroIdFromActive(
  _active: ActiveProfile | null,
): string | null {
  return null;
}

export function isSafeAppPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}

export function buildPerfilesHref(nextPath: string, required = true): string {
  const next = isSafeAppPath(nextPath) ? nextPath : "/";
  const params = new URLSearchParams();
  if (next !== "/perfiles") params.set("next", next);
  if (required) params.set("required", "1");
  const q = params.toString();
  return q ? `/perfiles?${q}` : "/perfiles";
}

export function canAddReaderProfile(count: number): boolean {
  return count < MAX_READER_PROFILES;
}
