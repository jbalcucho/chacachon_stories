"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  TRIAL_CHALLENGES,
  TRIAL_NAME_MAX,
  buildTrialStoryMarkdown,
  normalizeTrialName,
  saveTrialStory,
} from "@/lib/trial-story";

export default function TrialStoryForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [challengeId, setChallengeId] = useState(TRIAL_CHALLENGES[0].id);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizeTrialName(name);
    if (!normalized) {
      setError("Escribe un nombre corto (1–24 letras).");
      return;
    }
    const markdown = buildTrialStoryMarkdown(normalized, challengeId);
    saveTrialStory({
      name: normalized,
      challengeId,
      markdown,
      createdAt: new Date().toISOString(),
    });
    router.push("/leer/prueba");
  }

  return (
    <div className="trial-page mx-auto max-w-lg px-4 py-8 pb-16 sm:px-6">
      <header className="text-center">
        <p className="profile-picker__eyebrow">Gratis · sin cuenta</p>
        <h1 className="title-display mt-2 text-3xl sm:text-4xl">
          Un cuento con tu nombre
        </h1>
        <p className="intro-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
          Ideal para la noche, el trancón o una espera. Un cuento con el nombre
          de tu casa — no un catálogo infinito. Si te gusta, ingresa gratis
          para guardar tu familia.
        </p>
      </header>

      {session?.user ? (
        <p className="crear-banner crear-banner--info mt-6" role="status">
          Ya tienes sesión.{" "}
          <Link href="/crear" className="font-bold text-honey-glow underline">
            Mejor crea un cuento de verdad →
          </Link>
        </p>
      ) : null}

      <form className="trial-form mt-8" onSubmit={onSubmit}>
        <label className="trial-form__field">
          Nombre del protagonista
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Sofía"
            maxLength={TRIAL_NAME_MAX}
            autoComplete="nickname"
            autoFocus
            required
          />
        </label>

        <fieldset className="trial-form__challenges">
          <legend>¿De qué va el cuento?</legend>
          <div className="trial-form__challenge-list">
            {TRIAL_CHALLENGES.map((c) => (
              <label
                key={c.id}
                className={`trial-form__chip${challengeId === c.id ? " trial-form__chip--active" : ""}`}
              >
                <input
                  type="radio"
                  name="challenge"
                  value={c.id}
                  checked={challengeId === c.id}
                  onChange={() => setChallengeId(c.id)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p className="trial-form__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="family-btn family-btn--primary w-full">
          Crear cuento de prueba
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-muted">
        <Link href="/" className="font-semibold text-honey-glow underline">
          Volver al estante
        </Link>
      </p>
    </div>
  );
}
