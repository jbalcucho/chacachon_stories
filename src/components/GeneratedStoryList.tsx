"use client";

import Link from "next/link";
import { useState } from "react";
import {
  formatGeneratedStoryDate,
  labelGeneratedStorySource,
} from "@/lib/generated-story-labels";

export type GeneratedStoryListEntry = {
  id: string;
  title: string;
  source: string;
  createdAt: string;
  hiddenAt: string | null;
};

type Props = {
  stories: GeneratedStoryListEntry[];
};

async function patchStory(
  id: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/cuentos/generado/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    if (!res.ok) return { ok: false, message: data?.message };
    return { ok: true };
  } catch {
    return { ok: false, message: "Sin conexión. Intenta de nuevo." };
  }
}

export default function GeneratedStoryList({ stories: initial }: Props) {
  const [stories, setStories] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleHidden(id: string, hidden: boolean) {
    setBusyId(id);
    setError(null);
    const result = await patchStory(id, { hidden });
    if (result.ok) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, hiddenAt: hidden ? new Date().toISOString() : null }
            : s,
        ),
      );
    } else {
      setError(result.message ?? "No pudimos guardar el cambio.");
    }
    setBusyId(null);
  }

  async function remove(id: string, title: string) {
    if (
      !window.confirm(
        `¿Eliminar “${title}” para siempre? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/cuentos/generado/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(data?.message ?? "No pudimos eliminar el cuento.");
        setBusyId(null);
        return;
      }
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    }
    setBusyId(null);
  }

  return (
    <div className="mt-8">
      {error ? (
        <p className="crear-banner crear-banner--warn mb-3" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="crear-template-list">
        {stories.map((story) => {
          const hidden = Boolean(story.hiddenAt);
          const busy = busyId === story.id;
          return (
            <li key={story.id} className="generated-story-row">
              <Link
                href={`/leer/generado/${story.id}`}
                className={`crear-template-item${hidden ? " crear-template-item--hidden" : ""}`}
              >
                <span className="crear-template-item__title">
                  {story.title}
                  {hidden ? (
                    <span className="generated-story-row__badge">Oculto</span>
                  ) : null}
                </span>
                <span className="crear-template-item__desc">
                  {formatGeneratedStoryDate(new Date(story.createdAt))} ·{" "}
                  {labelGeneratedStorySource(story.source)}
                </span>
              </Link>
              <div className="generated-story-row__actions">
                <Link
                  href={`/mis-cuentos/${story.id}/editar`}
                  className="generated-story-row__action"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleHidden(story.id, !hidden)}
                  className="generated-story-row__action"
                >
                  {hidden ? "Mostrar" : "Ocultar"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(story.id, story.title)}
                  className="generated-story-row__action generated-story-row__action--danger"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
