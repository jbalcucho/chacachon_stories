"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { setProviderOverrideCookie } from "@/lib/dev-provider-override";
import { getSessionUser } from "@/lib/session";
import type { ProviderOverride } from "@/lib/story-generation.server";

function parseProviderOverride(value: FormDataEntryValue | null): ProviderOverride {
  return value === "gemini" || value === "claude" ? value : null;
}

/** Re-verifica ADMIN en el server: un form action se puede invocar por red
 * directamente, no solo desde la UI que ya lo esconde. */
export async function setProviderOverrideAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) {
    throw new Error("No autorizado");
  }
  const value = parseProviderOverride(formData.get("provider"));
  await setProviderOverrideCookie(value);
  revalidatePath("/admin");
}
