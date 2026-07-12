"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  TRIAL_COMPANION_NAME_MAX,
  TRIAL_CLASSICS,
  TRIAL_COMPANIONS,
  TRIAL_LESSONS,
  TRIAL_MOMENTS,
  TRIAL_NAME_MAX,
  buildTrialPayload,
  formatCompanionLabel,
  getTrialClassic,
  getTrialMoment,
  normalizeTrialName,
  resolveTrialDefaults,
  saveTrialStory,
  type TrialPath,
  type TrialStoryPayload,
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
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [companionNames, setCompanionNames] = useState("");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const summary = useMemo(() => {
    const frame =
      path === "classic"
        ? getTrialClassic(classicId).label
        : getTrialMoment(momentId).label;
    const pathLabel =
      path === "classic" ? "Cuento clásico" : "Historia de casa";
    const companions = TRIAL_COMPANIONS.filter((c) =>
      companionIds.includes(c.id),
    );
    const companionLabel =
      formatCompanionLabel(companions, companionNames) ?? "Solo";
    const lessonLabel =
      TRIAL_LESSONS.find((l) => l.id === activeLessonId)?.label ?? "";
    return { frame, pathLabel, companionLabel, lessonLabel };
  }, [
    path,
    classicId,
    momentId,
    companionIds,
    companionNames,
    activeLessonId,
  ]);

  function toggleCompanion(id: string) {
    setCompanionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

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

  async function finish(skipExtras: boolean) {
    const normalized = validateName();
    if (!normalized) {
      setStep("basics");
      return;
    }

    const input = {
      name: normalized,
      path,
      momentId: path === "moment" ? momentId : null,
      classicId: path === "classic" ? classicId : null,
      companionIds: skipExtras ? [] : companionIds,
      companionNames: skipExtras ? null : companionNames || null,
      lessonId: skipExtras ? null : activeLessonId,
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cuentos/probar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => null)) as
        | (TrialStoryPayload & { message?: string })
        | null;

      if (res.ok && data?.markdown) {
        saveTrialStory({
          name: data.name,
          path: data.path,
          momentId: data.momentId ?? null,
          classicId: data.classicId ?? null,
          companionId: data.companionId ?? data.companionIds?.[0] ?? null,
          companionIds: data.companionIds ?? [],
          companionNames: data.companionNames ?? null,
          lessonId: data.lessonId ?? null,
          markdown: data.markdown,
          createdAt: data.createdAt,
          frameLabel: data.frameLabel,
          lessonLabel: data.lessonLabel,
          companionLabel: data.companionLabel ?? null,
          source: data.source ?? "mock",
        });
        router.push("/leer/prueba");
        return;
      }

      if (res.status === 429) {
        setError(
          data?.message ??
            "Ya usaste tu prueba con IA. Ingresa gratis para crear más.",
        );
        return;
      }

      const local = buildTrialPayload(input);
      saveTrialStory({ ...local, source: "mock" });
      router.push("/leer/prueba");
    } catch {
      const local = buildTrialPayload(input);
      saveTrialStory({ ...local, source: "mock" });
      router.push("/leer/prueba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trial-page mx-auto max-w-lg px-4 py-8 pb-16 sm:px-6">
      <header className="text-center">
        <p className="profile-picker__eyebrow">Gratis · 1 cuento con IA</p>
        <h1 className="title-display mt-2 text-3xl sm:text-4xl">
          Un cuento de tu casa
        </h1>
        <p className="intro-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
          Historia de casa o clásico conocido — con el nombre de tu niño. Un
          cuento generado con IA, sin cuenta. Si te gusta, ingresa gratis para
          guardar más.
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
        <span
          className={
            step === "basics"
              ? "trial-steps__dot trial-steps__dot--on"
              : "trial-steps__dot"
          }
        >
          1
        </span>
        <span className="trial-steps__line" />
        <span
          className={
            step === "optional"
              ? "trial-steps__dot trial-steps__dot--on"
              : "trial-steps__dot"
          }
        >
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
              disabled={loading}
            />
          </label>

          <fieldset className="trial-form__challenges">
            <legend>¿Sobre qué armamos el cuento?</legend>
            <div className="trial-form__path-list">
              <button
                type="button"
                className={`trial-form__path${path === "moment" ? " trial-form__path--active" : ""}`}
                onClick={() => setPath("moment")}
                disabled={loading}
              >
                <span className="trial-form__path-title">Historia de casa</span>
                <span className="trial-form__path-hint">
                  Pantallas, dormir, compartir, verduras…
                </span>
              </button>
              <button
                type="button"
                className={`trial-form__path${path === "classic" ? " trial-form__path--active" : ""}`}
                onClick={() => setPath("classic")}
                disabled={loading}
              >
                <span className="trial-form__path-title">Cuento clásico</span>
                <span className="trial-form__path-hint">
                  Cerditos, Caperucita, Cabritos…
                </span>
              </button>
            </div>
          </fieldset>

          {path === "moment" ? (
            <fieldset className="trial-form__challenges">
              <legend>Selecciona un reto</legend>
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
                      disabled={loading}
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
                      disabled={loading}
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

          <button
            type="submit"
            className="family-btn family-btn--primary w-full"
            disabled={loading}
          >
            Continuar
          </button>
          <button
            type="button"
            className="trial-form__skip"
            onClick={() => {
              if (!validateName()) return;
              setCompanionIds([]);
              setCompanionNames("");
              setStep("optional");
            }}
            disabled={loading}
          >
            Ver resumen y crear
          </button>
        </form>
      ) : (
        <div className="trial-form mt-4">
          <p className="trial-form__optional-lead">
            Opcional — puedes saltarlo. Elige quién acompaña (uno o más) y qué
            aprenden.
          </p>

          <fieldset className="trial-form__challenges">
            <legend>¿Quién acompaña? (puedes elegir varios)</legend>
            <div className="trial-form__challenge-list">
              <label
                className={`trial-form__chip${companionIds.length === 0 ? " trial-form__chip--active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={companionIds.length === 0}
                  onChange={() => setCompanionIds([])}
                  disabled={loading}
                />
                Solo
              </label>
              {TRIAL_COMPANIONS.map((c) => (
                <label
                  key={c.id}
                  className={`trial-form__chip${companionIds.includes(c.id) ? " trial-form__chip--active" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={companionIds.includes(c.id)}
                    onChange={() => toggleCompanion(c.id)}
                    disabled={loading}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>

          {companionIds.length > 0 ? (
            <label className="trial-form__field trial-form__field--centered">
              Nombre(s) de quien acompaña (opcional)
              <input
                value={companionNames}
                onChange={(e) => setCompanionNames(e.target.value)}
                placeholder="Ej. Carolina, o Ana y Tito"
                maxLength={TRIAL_COMPANION_NAME_MAX}
                disabled={loading}
              />
            </label>
          ) : null}

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
                    disabled={loading}
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

          <section className="trial-form__summary" aria-label="Resumen del cuento">
            <h2 className="trial-form__summary-title">Así quedará tu cuento</h2>
            <p className="trial-form__summary-hint">
              Puedes editar los campos. Los chips de arriba también cambian el
              resumen.
            </p>

            <label className="trial-form__summary-row">
              <span>Protagonista</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={TRIAL_NAME_MAX}
                disabled={loading}
              />
            </label>

            <div className="trial-form__summary-row trial-form__summary-row--static">
              <span>Tipo</span>
              <p>
                {summary.pathLabel}: <strong>{summary.frame}</strong>
                <button
                  type="button"
                  className="trial-form__summary-edit"
                  onClick={() => setStep("basics")}
                  disabled={loading}
                >
                  Cambiar
                </button>
              </p>
            </div>

            <div className="trial-form__summary-row trial-form__summary-row--static">
              <span>Acompañan</span>
              <p>
                <strong>{summary.companionLabel}</strong>
              </p>
            </div>

            {companionIds.length > 0 ? (
              <label className="trial-form__summary-row">
                <span>Nombre(s) de quien acompaña</span>
                <input
                  value={companionNames}
                  onChange={(e) => setCompanionNames(e.target.value)}
                  placeholder="Ej. Carolina, o Ana y Tito"
                  maxLength={TRIAL_COMPANION_NAME_MAX}
                  disabled={loading}
                />
              </label>
            ) : null}

            <label className="trial-form__summary-row">
              <span>Qué aprenden</span>
              <select
                value={activeLessonId}
                onChange={(e) => setLessonId(e.target.value)}
                disabled={loading}
              >
                {TRIAL_LESSONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <button
            type="button"
            className="family-btn family-btn--primary w-full"
            onClick={() => finish(false)}
            disabled={loading}
          >
            {loading ? "Creando con IA…" : "Crear cuento con IA"}
          </button>
          <button
            type="button"
            className="trial-form__skip"
            onClick={() => finish(true)}
            disabled={loading}
          >
            Crear sin acompañantes
          </button>
          <button
            type="button"
            className="trial-form__back"
            onClick={() => setStep("basics")}
            disabled={loading}
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
