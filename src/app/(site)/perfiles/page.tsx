"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfilePicker from "@/components/family/ProfilePicker";
import {
  clearActiveProfile,
  isSafeAppPath,
  readActiveProfile,
  readReaderProfiles,
  resetAllReaderProfiles,
  resolveActiveProfile,
  type ActiveProfile,
} from "@/lib/active-profile";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { householdIsReady } from "@/lib/onboarding";

function PerfilesContent() {
  const { status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const [houseReady, setHouseReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ActiveProfile[]>([]);
  const [active, setActive] = useState<ActiveProfile | null>(null);

  const nextRaw = searchParams.get("next") || "/";
  const continueHref = isSafeAppPath(nextRaw) ? nextRaw : "/";
  const forced = searchParams.get("required") === "1";
  const required = forced || !active;

  useEffect(() => {
    if (searchParams.get("reset") === "1") {
      resetAllReaderProfiles();
      setProfiles([]);
      setActive(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      if (authStatus === "unauthenticated") setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/familia/perfil");
        if (!res.ok) throw new Error("No se pudo cargar la familia");
        const data = (await res.json()) as {
          perfil: FamilyProfileDocument | null;
        };
        if (cancelled) return;
        setHouseReady(householdIsReady(data.perfil));
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setHouseReady(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  useEffect(() => {
    const list = readReaderProfiles();
    setProfiles(list);
    const stored = readActiveProfile();
    const resolved = resolveActiveProfile(list, stored);
    if (stored && !resolved) {
      clearActiveProfile();
      setActive(null);
      return;
    }
    setActive(resolved);
  }, [searchParams]);

  if (authStatus === "loading" || loading) {
    return (
      <main className="profile-picker-page mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="intro-copy">Cargando perfiles…</p>
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="profile-picker-page mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="title-display text-3xl">Perfiles</h1>
        <p className="intro-copy mt-3">
          Entra con Google para crear tu perfil y personalizar la lectura.
        </p>
        <Link
          href="/login?callbackUrl=/perfiles"
          className="mt-6 inline-block rounded-xl border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow"
        >
          Entrar con Google
        </Link>
      </main>
    );
  }

  if (!houseReady) {
    return (
      <main className="profile-picker-page mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="title-display text-3xl">Crea tu casa familiar</h1>
        <p className="intro-copy mt-3">
          Primero arma el elenco del cuento (niños y adultos). Luego creas tu
          perfil de lectura con tu nombre.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-coral" role="status">
            {error}
          </p>
        ) : null}
        <Link
          href="/familia?next=%2Fperfiles"
          className="mt-6 inline-block rounded-xl border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow"
        >
          Crear mi casa →
        </Link>
      </main>
    );
  }

  return (
    <main className="profile-picker-page mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6">
      {error ? (
        <p className="mb-4 text-center text-sm text-coral" role="status">
          {error}
        </p>
      ) : null}
      <ProfilePicker
        profiles={profiles}
        activeId={active?.id ?? null}
        continueHref={continueHref}
        manageHref="/familia"
        required={required && !active}
        onProfilesChange={setProfiles}
      />
    </main>
  );
}

export default function PerfilesPage() {
  return (
    <Suspense
      fallback={
        <main className="profile-picker-page mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="intro-copy">Cargando perfiles…</p>
        </main>
      }
    >
      <PerfilesContent />
    </Suspense>
  );
}
