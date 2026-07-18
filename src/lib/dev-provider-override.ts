import "server-only";
import { cookies } from "next/headers";
import type { ProviderOverride } from "@/lib/story-generation.server";

/**
 * Comparación A/B Gemini vs Claude en desarrollo (ver /admin). Vive en una
 * cookie, no en el perfil familiar: es una preferencia de admin/desarrollo,
 * no una configuración que un miembro de la familia deba ver ni poder tocar.
 */
export const PROVIDER_OVERRIDE_COOKIE = "chacachon_dev_provider";

function parseProviderOverride(value: string | undefined): ProviderOverride {
  return value === "gemini" || value === "claude" ? value : null;
}

/** El caller SIEMPRE debe pasar si el usuario actual es admin -- la cookie
 * nunca se confía por sí sola, así un valor viejo/manipulado no hace nada
 * si la sesión no es de un ADMIN real. */
export async function getProviderOverrideForAdmin(
  isAdmin: boolean,
): Promise<ProviderOverride> {
  if (!isAdmin) return null;
  const store = await cookies();
  return parseProviderOverride(store.get(PROVIDER_OVERRIDE_COOKIE)?.value);
}

export async function setProviderOverrideCookie(
  value: ProviderOverride,
): Promise<void> {
  const store = await cookies();
  if (!value) {
    store.delete(PROVIDER_OVERRIDE_COOKIE);
    return;
  }
  store.set(PROVIDER_OVERRIDE_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
