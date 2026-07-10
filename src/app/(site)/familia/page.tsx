"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { newEntityId } from "@/lib/family-profile-schema";

type Status = "idle" | "loading" | "saving" | "saved" | "error";

export default function FamiliaPage() {
  const { data: session, status: authStatus } = useSession();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [demoText, setDemoText] = useState<string | null>(null);

  const [ciudad, setCiudad] = useState("Bogotá");
  const [apellido, setApellido] = useState("");
  const [hogar, setHogar] = useState("el apartamento");
  const [nino1Nombre, setNino1Nombre] = useState("");
  const [nino1Apodo, setNino1Apodo] = useState("");
  const [nino2Nombre, setNino2Nombre] = useState("");
  const [nino2Apodo, setNino2Apodo] = useState("");
  const [mamaNombre, setMamaNombre] = useState("");
  const [mamaApodo, setMamaApodo] = useState("");
  const [papaNombre, setPapaNombre] = useState("");
  const [papaApodo, setPapaApodo] = useState("");
  const [mascota1Nombre, setMascota1Nombre] = useState("");
  const [mascota2Nombre, setMascota2Nombre] = useState("");
  const [colegioAnterior, setColegioAnterior] = useState("");
  const [colegioActual, setColegioActual] = useState("");
  const [fraseMama, setFraseMama] = useState("");
  const [frasePapa, setFrasePapa] = useState("");
  const [nino1Id, setNino1Id] = useState("");
  const [nino2Id, setNino2Id] = useState("");
  const [mamaId, setMamaId] = useState("");
  const [papaId, setPapaId] = useState("");
  const [mascota1Id, setMascota1Id] = useState("");
  const [mascota2Id, setMascota2Id] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await fetch("/api/familia/perfil");
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const data = (await res.json()) as {
          perfil: {
            meta?: {
              ciudad?: string;
              apellido_hogar?: string;
              como_le_dicen_al_hogar?: string;
            };
            ninos?: Array<{
              id: string;
              nombre: string;
              apodo?: string;
              orden?: number;
            }>;
            adultos?: Array<{
              id: string;
              rol: string;
              nombre: string;
              apodo?: string;
              frases_tipicas?: string[];
            }>;
            mascotas?: Array<{ id: string; nombre: string }>;
            extra?: {
              colegio?: { anterior?: string; actual?: string };
            };
          } | null;
        };

        if (cancelled) return;
        const p = data.perfil;
        if (p) {
          setCiudad(p.meta?.ciudad ?? "Bogotá");
          setApellido(p.meta?.apellido_hogar ?? "");
          setHogar(p.meta?.como_le_dicen_al_hogar ?? "el apartamento");
          const kids = [...(p.ninos ?? [])].sort(
            (a, b) => (a.orden ?? 99) - (b.orden ?? 99),
          );
          if (kids[0]) {
            setNino1Id(kids[0].id);
            setNino1Nombre(kids[0].nombre);
            setNino1Apodo(kids[0].apodo ?? "");
          }
          if (kids[1]) {
            setNino2Id(kids[1].id);
            setNino2Nombre(kids[1].nombre);
            setNino2Apodo(kids[1].apodo ?? "");
          }
          const mama = p.adultos?.find((a) => a.rol === "mama");
          const papa = p.adultos?.find((a) => a.rol === "papa");
          if (mama) {
            setMamaId(mama.id);
            setMamaNombre(mama.nombre);
            setMamaApodo(mama.apodo ?? "");
            setFraseMama(mama.frases_tipicas?.[0] ?? "");
          }
          if (papa) {
            setPapaId(papa.id);
            setPapaNombre(papa.nombre);
            setPapaApodo(papa.apodo ?? "");
            setFrasePapa(papa.frases_tipicas?.[0] ?? "");
          }
          const mascotas = p.mascotas ?? [];
          if (mascotas[0]) {
            setMascota1Id(mascotas[0].id);
            setMascota1Nombre(mascotas[0].nombre);
          }
          if (mascotas[1]) {
            setMascota2Id(mascotas[1].id);
            setMascota2Nombre(mascotas[1].nombre);
          }
          setColegioAnterior(p.extra?.colegio?.anterior ?? "");
          setColegioActual(p.extra?.colegio?.actual ?? "");
        }
        setStatus("idle");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus("saving");

    const ninos = [
      {
        id: nino1Id || newEntityId("nino"),
        nombre: nino1Nombre.trim(),
        apodo: nino1Apodo.trim() || undefined,
        orden: 1,
      },
    ];
    if (nino2Nombre.trim()) {
      ninos.push({
        id: nino2Id || newEntityId("nino"),
        nombre: nino2Nombre.trim(),
        apodo: nino2Apodo.trim() || undefined,
        orden: 2,
      });
    }

    const adultos = [];
    if (mamaNombre.trim()) {
      adultos.push({
        id: mamaId || newEntityId("adulto"),
        rol: "mama" as const,
        nombre: mamaNombre.trim(),
        apodo: mamaApodo.trim() || undefined,
        frases_tipicas: fraseMama.trim() ? [fraseMama.trim()] : undefined,
      });
    }
    if (papaNombre.trim()) {
      adultos.push({
        id: papaId || newEntityId("adulto"),
        rol: "papa" as const,
        nombre: papaNombre.trim(),
        apodo: papaApodo.trim() || undefined,
        frases_tipicas: frasePapa.trim() ? [frasePapa.trim()] : undefined,
      });
    }

    const mascotas = [];
    if (mascota1Nombre.trim()) {
      mascotas.push({
        id: mascota1Id || newEntityId("mascota"),
        nombre: mascota1Nombre.trim(),
      });
    }
    if (mascota2Nombre.trim()) {
      mascotas.push({
        id: mascota2Id || newEntityId("mascota"),
        nombre: mascota2Nombre.trim(),
      });
    }

    if (adultos.length === 0) {
      setError("Agrega al menos un adulto (mamá o papá).");
      setStatus("error");
      return;
    }

    const res = await fetch("/api/familia/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemaVersion: 1,
        perfil: {
          meta: {
            ciudad: ciudad.trim() || undefined,
            apellido_hogar: apellido.trim() || undefined,
            como_le_dicen_al_hogar: hogar.trim() || undefined,
            codigo_acento: "neutro",
          },
          adultos,
          ninos,
          mascotas: mascotas.length > 0 ? mascotas : undefined,
          extra: {
            colegio: {
              anterior: colegioAnterior.trim() || undefined,
              actual: colegioActual.trim() || undefined,
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(data?.message ?? "No se pudo guardar");
      setStatus("error");
      return;
    }

    setStatus("saved");
    const demo = await fetch("/api/familia/demo-interpolacion");
    if (demo.ok) {
      const payload = (await demo.json()) as { text: string };
      setDemoText(payload.text);
    }
  }

  async function exportData() {
    const res = await fetch("/api/familia/export");
    if (!res.ok) {
      setError("No se pudo exportar");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chacachon-datos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (deleteConfirm !== "ELIMINAR") {
      setError('Escribe ELIMINAR para confirmar el borrado.');
      return;
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
      setError(data?.message ?? "No se pudo eliminar");
      return;
    }
    await signOut({ callbackUrl: "/" });
  }

  if (authStatus === "loading" || status === "loading") {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-center text-cream-muted">
        Cargando perfil…
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <main className="mx-auto max-w-lg px-5 py-12 text-center">
        <h1 className="title-display text-3xl">Tu familia</h1>
        <p className="intro-copy mt-3 text-sm">
          Inicia sesión para guardar nombres y personalizar cuentos.
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

  return (
    <main className="mx-auto max-w-lg px-5 py-10 pb-16">
      <p className="text-sm font-semibold text-honey-glow/90">
        Hola, {session?.user?.name?.split(" ")[0] ?? "familia"}
      </p>
      <h1 className="title-display mt-1 text-3xl sm:text-4xl">
        Perfil familiar
      </h1>
      <p className="intro-copy mt-3 text-sm sm:text-base">
        Capa esencial: con esto ya podemos decir{" "}
        <span className="text-honey-glow">«Buenas noches, {"{{niño_1}}"}»</span>{" "}
        en un cuento.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <fieldset className="space-y-3 rounded-2xl border border-white/12 bg-white/5 p-4">
          <legend className="px-1 text-sm font-bold text-cream">Hogar</legend>
          <label className="block text-xs font-semibold text-cream-muted">
            Ciudad
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-cream-muted">
            Cómo le dicen a la casa
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
              value={hogar}
              onChange={(e) => setHogar(e.target.value)}
              placeholder="el apartamento"
            />
          </label>
          <label className="block text-xs font-semibold text-cream-muted">
            Apellido / nombre del hogar
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Chacachón"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-white/12 bg-white/5 p-4">
          <legend className="px-1 text-sm font-bold text-cream">Niños</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-cream-muted">
              Niño 1 — nombre *
              <input
                required
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={nino1Nombre}
                onChange={(e) => setNino1Nombre(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Apodo
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={nino1Apodo}
                onChange={(e) => setNino1Apodo(e.target.value)}
                placeholder="Nico"
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Niño 2 — nombre
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={nino2Nombre}
                onChange={(e) => setNino2Nombre(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Apodo
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={nino2Apodo}
                onChange={(e) => setNino2Apodo(e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-white/12 bg-white/5 p-4">
          <legend className="px-1 text-sm font-bold text-cream">Adultos</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-cream-muted">
              Mamá — nombre
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={mamaNombre}
                onChange={(e) => setMamaNombre(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Cómo la llaman
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={mamaApodo}
                onChange={(e) => setMamaApodo(e.target.value)}
                placeholder="Pauleta"
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Papá — nombre
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={papaNombre}
                onChange={(e) => setPapaNombre(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Cómo lo llaman
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={papaApodo}
                onChange={(e) => setPapaApodo(e.target.value)}
                placeholder="Chacachón"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-white/12 bg-white/5 p-4">
          <legend className="px-1 text-sm font-bold text-cream">
            Mascotas y colegio
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-cream-muted">
              Mascota 1
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={mascota1Nombre}
                onChange={(e) => setMascota1Nombre(e.target.value)}
                placeholder="Bingo"
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Mascota 2
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={mascota2Nombre}
                onChange={(e) => setMascota2Nombre(e.target.value)}
                placeholder="Mora"
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Colegio anterior
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={colegioAnterior}
                onChange={(e) => setColegioAnterior(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted">
              Colegio actual
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={colegioActual}
                onChange={(e) => setColegioActual(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted sm:col-span-2">
              Frase típica de mamá
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={fraseMama}
                onChange={(e) => setFraseMama(e.target.value)}
                placeholder="Fuera pereza fuera"
              />
            </label>
            <label className="block text-xs font-semibold text-cream-muted sm:col-span-2">
              Frase típica de papá
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
                value={frasePapa}
                onChange={(e) => setFrasePapa(e.target.value)}
                placeholder="Duérmanse o les apago"
              />
            </label>
          </div>
        </fieldset>

        {error ? (
          <p className="text-sm font-semibold text-coral" role="alert">
            {error}
          </p>
        ) : null}
        {status === "saved" ? (
          <p className="text-sm font-semibold text-mint" role="status">
            Perfil guardado.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-xl border-2 border-honey/45 bg-honey/20 px-5 py-3 text-sm font-bold text-honey-glow transition hover:bg-honey/30 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando…" : "Guardar perfil"}
        </button>
      </form>

      {demoText ? (
        <div className="mt-6 rounded-2xl border border-mint/30 bg-mint/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-mint">
            Vista previa personalizada
          </p>
          <p className="mt-2 font-serif text-sm leading-relaxed text-cream">
            {demoText}
          </p>
        </div>
      ) : null}

      <section className="mt-10 space-y-4 border-t border-white/10 pt-8">
        <h2 className="font-display text-lg font-bold text-cream">
          Tus datos (Ley 1581)
        </h2>
        <button
          type="button"
          onClick={exportData}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-white/15"
        >
          Exportar mis datos (JSON)
        </button>
        <div className="rounded-2xl border border-coral/35 bg-coral/10 p-4">
          <p className="text-xs leading-relaxed text-cream-muted">
            Eliminar cuenta borra tu usuario y el perfil familiar. No se puede
            deshacer.
          </p>
          <label className="mt-3 block text-xs font-semibold text-cream-muted">
            Escribe ELIMINAR para confirmar
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-night/40 px-3 py-2 text-sm text-cream"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={deleteAccount}
            className="mt-3 w-full rounded-xl border border-coral/50 bg-coral/20 px-4 py-2.5 text-sm font-bold text-coral-soft transition hover:bg-coral/30"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-cream-muted">
        <Link href="/" className="font-semibold text-honey-glow hover:underline">
          ← Volver a la biblioteca
        </Link>
      </p>
    </main>
  );
}
