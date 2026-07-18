"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  initialTitle: string;
  initialBodyMarkdown: string;
};

export default function EditGeneratedStoryForm({
  id,
  initialTitle,
  initialBodyMarkdown,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [bodyMarkdown, setBodyMarkdown] = useState(initialBodyMarkdown);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const dirty = title !== initialTitle || bodyMarkdown !== initialBodyMarkdown;

  async function handleSave() {
    if (!title.trim() || !bodyMarkdown.trim()) {
      setError("El título y el texto no pueden quedar vacíos.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/cuentos/generado/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), bodyMarkdown }),
      });
      const data = (await res.json().catch(() => null)) as
        | { message?: string; hints?: string[] }
        | null;
      if (!res.ok) {
        setError(data?.message ?? "No pudimos guardar los cambios.");
        setSaving(false);
        return;
      }
      setHints(data?.hints ?? []);
      setSaved(true);
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    }
    setSaving(false);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-cream-muted">
          Título
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaved(false);
          }}
          maxLength={200}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-cream outline-none focus:border-honey-glow/60"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-cream-muted">
          Texto del cuento (markdown)
        </span>
        <textarea
          value={bodyMarkdown}
          onChange={(e) => {
            setBodyMarkdown(e.target.value);
            setSaved(false);
          }}
          rows={18}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs leading-relaxed text-cream outline-none focus:border-honey-glow/60"
        />
        <span className="text-xs text-cream-muted">
          Los títulos de escena usan “## Así”. No borres “Había una vez…” ni
          “Colorín colorado…” si querés que el lector siga paginando bien.
        </span>
      </label>

      {error ? (
        <p className="crear-banner crear-banner--warn" role="alert">
          {error}
        </p>
      ) : null}

      {saved && hints.length === 0 ? (
        <p className="crear-banner crear-banner--info" role="status">
          Guardado ✓
        </p>
      ) : null}

      {saved && hints.length > 0 ? (
        <div className="crear-banner crear-banner--warn" role="status">
          <p className="font-bold">Guardado ✓ — aviso, no bloqueante:</p>
          <ul className="mt-1 list-disc pl-4 text-xs">
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-full border-2 border-honey/45 bg-honey/20 px-5 py-2.5 text-sm font-bold text-honey-glow transition hover:bg-honey/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/leer/generado/${id}`)}
          className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-cream-muted transition hover:text-cream"
        >
          {saved ? "Ir a leerlo" : "Cancelar"}
        </button>
      </div>
    </div>
  );
}
