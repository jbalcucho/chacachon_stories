"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import FamilyProfileBuilder from "@/components/family/FamilyProfileBuilder";
import {
  emptyFamilyBuilderState,
  familyBuilderFromDocument,
  familyBuilderToDocument,
  type FamilyBuilderState,
} from "@/lib/family-profile-builder";
import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

export default function FamiliaPage() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState<FamilyBuilderState | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

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
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const data = (await res.json()) as {
          perfil: FamilyProfileDocument | null;
        };
        if (cancelled) return;
        setInitialState(familyBuilderFromDocument(data.perfil));
        setLoadError(null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Error");
          setInitialState(emptyFamilyBuilderState());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function saveProfile(state: FamilyBuilderState) {
    const res = await fetch("/api/familia/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemaVersion: 1,
        perfil: familyBuilderToDocument(state),
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(data?.message ?? "No se pudo guardar");
    }
  }

  async function exportData() {
    const res = await fetch("/api/familia/export");
    if (!res.ok) throw new Error("No se pudo exportar");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chacachon-datos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount(confirm: string) {
    if (confirm !== "ELIMINAR") {
      throw new Error("Escribe ELIMINAR para confirmar el borrado.");
    }
    const res = await fetch("/api/familia/cuenta", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "ELIMINAR" }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(data?.message ?? "No se pudo eliminar");
    }
    await signOut({ callbackUrl: "/" });
  }

  if (authStatus === "loading" || loading) {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-center text-cream-muted">
        Cargando tu casa…
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-center">
        <h1 className="title-display text-3xl">Tu familia</h1>
        <p className="intro-copy mt-3 text-sm">
          Inicia sesión para armar tu casa y personalizar cuentos.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow"
        >
          Entrar con Google
        </Link>
      </main>
    );
  }

  if (!initialState) {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-center text-coral">
        {loadError ?? "No se pudo cargar el perfil"}
      </main>
    );
  }

  return (
    <main className="family-page mx-auto max-w-lg px-4 py-8 pb-20 sm:px-5">
      {loadError ? (
        <p className="family-alert mb-4" role="status">
          {loadError} — puedes seguir editando y guardar.
        </p>
      ) : null}
      <FamilyProfileBuilder
        key={session?.user?.email ?? "family"}
        initialState={initialState}
        userFirstName={session?.user?.name?.split(" ")[0]}
        onSave={saveProfile}
        onExport={() => {
          void exportData().catch(() => undefined);
        }}
        onDeleteAccount={async (confirm) => {
          try {
            await deleteAccount(confirm);
          } catch (e) {
            window.alert(e instanceof Error ? e.message : "Error");
          }
        }}
      />
    </main>
  );
}
