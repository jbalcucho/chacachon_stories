"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  TRIAL_CLASSICS,
  TRIAL_COMPANIONS,
  TRIAL_LESSONS,
  TRIAL_MOMENTS,
  TRIAL_NAME_MAX,
  buildTrialPayload,
  normalizeTrialName,
  resolveTrialDefaults,
  saveTrialStory,
  type TrialPath,
} from "@/lib/trial-story";

type Step = "basics" | "optional";

export default function TrialStoryForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("basics");
  const [name, setName] = useState("");
  const [path, setPath] = useState<TrialPath>("moment");
  const [momentId, setMomentId] = useState(TRIAL_MOMENTS[0].id);
  const [classicId, setClassicId] = useState(TRIAL_CLASSICS[0].id);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedLessonId = useMemo(() => {
    const defaults = resolveTrialDefaults({
      name: name || "Nico",
      path,
      momentId,
      classicId,
    });
    return defaults.lesson.id;
  }, [path, momentId, classicId, name]);

  const activeLessonId = lessonId ?? suggestedLessonId;

  function validateName(): string | null {
    const normalized = normalizeTrialName(name);
    if (!normalized) {
      setError("Escribe un nombre corto (1–24 letras).");
      return null;
    }
    setError(null);
    return normalized;
  }

  function goOptional(e: React.FormEvent) {
    e.preventDefault();
    if (!validateName()) return;
    setStep("optional");
  }

  function finish(skipExtras: boolean) {
    const normalized = validateName();
    if (!normalized) {
      setStep("basics");
      return;
    }

    const payload = buildTrialPayload({
      name: normalized,
      path,
      momentId: path === "moment" ? momentId : null,
      classicId: path === "classic" ? classicId : null,
      companionId: skipExtras ? null : companionId,
      lessonId: skipExtras ? null : activeLessonId,
    });
    saveTrialStory(payload);
    router.push("/leer/prueba");
  }

  return (
    <div className="trial-page mx-auto max-w-lg px-4 py-8 pb-16 sm:px-6">
      <header className="text-center">
        <p className="profile-picker__eyebrow">Gratis · sin cuenta</p>
        <h1 className="title-display mt-2 text-3xl sm:text-4xl">
          Un cuento de tu casa
        </h1>
        <p className="intro-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
          Momento real o clásico conocido — con el nombre de tu niño. La familia
          y la enseñanza son opcionales. Si te gusta, ingresa gratis para
          guardarlas.
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

      <div className="trial-steps" aria-hidden="true">
        <span className={step === "basics" ? "trial-steps__dot trial-steps__dot--on" : "trial-steps__dot"}>
          1
        </span>
        <span className="trial-steps__line" />
        <span className={step === "optional" ? "trial-steps__dot trial-steps__dot--on" : "trial-steps__dot"}>
          2
        </span>
      </div>

      {step === "basics" ? (
        <form className="trial-form mt-4" onSubmit={goOptional}>
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
            <legend>¿Sobre qué armamos el cuento?</legend>
            <div className="trial-form__path-list">
              <button
                type="button"
                className={`trial-form__path${path === "moment" ? " trial-form__path--active" : ""}`}
                onClick={() => setPath("moment")}
              >
                <span className="trial-form__path-title">Momento de casa</span>
                <span className="trial-form__path-hint">
                  Noche, trancón, pantallas…
                </span>
              </button>
              <button
                type="button"
                className={`trial-form__path${path === "classic" ? " trial-form__path--active" : ""}`}
                onClick={() => setPath("classic")}
              >
                <span className="trial-form__path-title">Cuento clásico</span>
                <span className="trial-form__path-hint">
                  Cerditos, Caperucita… con tu niño
                </span>
              </button>
            </div>
          </fieldset>

          {path === "moment" ? (
            <fieldset className="trial-form__challenges">
              <legend>Elige el momento</legend>
              <div className="trial-form__challenge-list">
                {TRIAL_MOMENTS.map((m) => (
                  <label
                    key={m.id}
                    className={`trial-form__chip${momentId === m.id ? " trial-form__chip--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="moment"
                      value={m.id}
                      checked={momentId === m.id}
                      onChange={() => {
                        setMomentId(m.id);
                        setLessonId(null);
                      }}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset className="trial-form__challenges">
              <legend>Elige el clásico</legend>
              <div className="trial-form__classic-list">
                {TRIAL_CLASSICS.map((c) => (
                  <label
                    key={c.id}
                    className={`trial-form__classic${classicId === c.id ? " trial-form__classic--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="classic"
                      value={c.id}
                      checked={classicId === c.id}
                      onChange={() => {
                        setClassicId(c.id);
                        setLessonId(null);
                      }}
                    />
                    <span className="trial-form__classic-title">{c.label}</span>
                    <span className="trial-form__classic-hint">{c.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error ? (
            <p className="trial-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="family-btn family-btn--primary w-full">
            Continuar
          </button>
          <button
            type="button"
            className="trial-form__skip"
            onClick={() => finish(true)}
          >
            Crear ya (sin extras)
          </button>
        </form>
      ) : (
        <div className="trial-form mt-4">
          <p className="trial-form__optional-lead">
            Opcional — puedes saltarlo. Así se siente Chacachón: familia y
            enseñanza, sin obligarte.
          </p>

          <fieldset className="trial-form__challenges">
            <legend>¿Quién acompaña? (opcional)</legend>
            <div className="trial-form__challenge-list">
              <label
                className={`trial-form__chip${companionId === null ? " trial-form__chip--active" : ""}`}
              >
                <input
                  type="radio"
                  name="companion"
                  checked={companionId === null}
                  onChange={() => setCompanionId(null)}
                />
                Solo
              </label>
              {TRIAL_COMPANIONS.map((c) => (
                <label
                  key={c.id}
                  className={`trial-form__chip${companionId === c.id ? " trial-form__chip--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="companion"
                    value={c.id}
                    checked={companionId === c.id}
                    onChange={() => setCompanionId(c.id)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="trial-form__challenges">
            <legend>¿Qué aprenden? (sugerido, editable)</legend>
            <div className="trial-form__challenge-list">
              {TRIAL_LESSONS.map((l) => (
                <label
                  key={l.id}
                  className={`trial-form__chip${activeLessonId === l.id ? " trial-form__chip--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="lesson"
                    value={l.id}
                    checked={activeLessonId === l.id}
                    onChange={() => setLessonId(l.id)}
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="trial-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="family-btn family-btn--primary w-full"
            onClick={() => finish(false)}
          >
            Crear cuento de prueba
          </button>
          <button
            type="button"
            className="trial-form__skip"
            onClick={() => finish(true)}
          >
            Saltar extras y crear
          </button>
          <button
            type="button"
            className="trial-form__back"
            onClick={() => setStep("basics")}
          >
            ← Volver
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-cream-muted">
        <Link href="/" className="font-semibold text-honey-glow underline">
          Volver al estante
        </Link>
      </p>
    </div>
  );
}
