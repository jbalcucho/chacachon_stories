"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  buildPerfilesHref,
  readActiveProfile,
  writeActiveProfile,
} from "@/lib/active-profile";
import {
  buildFamiliaHref,
  householdIsReady,
  readFamilyReadyCache,
  writeFamilyReadyCache,
} from "@/lib/onboarding";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

/** Setup / auth / legal: no redirigir. */
const ONBOARDING_EXEMPT = new Set([
  "/perfiles",
  "/familia",
  "/login",
  "/privacidad",
  "/probar",
]);

async function fetchHouseholdReady(): Promise<boolean> {
  const cached = readFamilyReadyCache();
  if (cached !== null) return cached;

  try {
    const res = await fetch("/api/familia/perfil");
    if (!res.ok) {
      writeFamilyReadyCache(false);
      return false;
    }
    const data = (await res.json()) as { perfil: FamilyProfileDocument | null };
    const ready = householdIsReady(data.perfil);
    writeFamilyReadyCache(ready);
    return ready;
  } catch {
    writeFamilyReadyCache(false);
    return false;
  }
}

function currentFullPath(
  pathname: string,
  searchParams: URLSearchParams | null,
): string {
  const search = searchParams?.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * Flujo: sin login libre → con login exige casa → luego perfil activo.
 */
export default function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (status === "loading") return;

      if (status !== "authenticated") {
        if (!cancelled) setReady(true);
        return;
      }

      const path = pathname || "/";
      if (ONBOARDING_EXEMPT.has(path)) {
        if (!cancelled) setReady(true);
        return;
      }

      const full = currentFullPath(path, searchParams);
      const houseReady = await fetchHouseholdReady();
      if (cancelled) return;

      if (!houseReady) {
        router.replace(buildFamiliaHref(full));
        return;
      }

      const active = readActiveProfile();
      if (!active) {
        router.replace(buildPerfilesHref(full, true));
        return;
      }

      writeActiveProfile(active);
      if (!cancelled) setReady(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [status, pathname, searchParams, router]);

  if (status === "loading" || !ready) {
    return (
      <div className="profile-gate mx-auto max-w-lg px-4 py-16 text-center">
        <p className="intro-copy">Preparando tu casa…</p>
      </div>
    );
  }

  return children;
}
