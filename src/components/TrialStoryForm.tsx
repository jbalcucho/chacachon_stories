"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useRotatingMessage } from "@/lib/use-rotating-message";
import {
  DEFAULT_TRIAL_AGE_BAND_ID,
  TRIAL_AGE_BANDS,
  TRIAL_COMPANION_NAME_MAX,
  TRIAL_CLASSICS,
  TRIAL_COMPANIONS,
  TRIAL_LESSONS,
  TRIAL_MOMENTS,
  TRIAL_NAME_MAX,
  TRIAL_PETS,
  buildTrialPayload,
  buildTrialStoryBlurb,
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
  const [ageBandId, setAgeBandId] = useState(DEFAULT_TRIAL_AGE_BAND_ID);
  const [path, setPath] = useState<TrialPath>("moment");
  const [momentId, setMomentId] = useState(TRIAL_MOMENTS[0].id);
  const [classicId, setClassicId] = useState(TRIAL_CLASSICS[0].id);
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [companionNameById, setCompanionNameById] = useState<
    Record<string, string>
  >({});
  const [petId, setPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [showCompanionNames, setShowCompanionNames] = useState(false);
  const [showPetName, setShowPetName] = useState(false);
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadingMessages = useMemo(
    () => [
      `Imaginando el mundo de ${name || "tu peque"}…`,
      "Puliendo el cierre del cuento…",
      "Revisando que quede perfecto…",
    ],
    [name],
  );
  const loadingMessage = useRotatingMessage(loadingMessages, loading);

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
  const activeLessonLabel =
    TRIAL_LESSONS.find((l) => l.id === activeLessonId)?.label ?? "";

  const selectedCompanions = useMemo(
    () => TRIAL_COMPANIONS.filter((c) => companionIds.includes(c.id)),
    [companionIds],
  );

  const storyBlurb = useMemo(
    () =>
      buildTrialStoryBlurb({
        name: name.trim() || "el protagonista",
        path,
        ageBandId,
        momentId,
        classicId,
        companionIds,
        companionNameById,
        petId,
        petName,
        lessonId: activeLessonId,
      }),
    [
      name,
      path,
      ageBandId,
      momentId,
      classicId,
      companionIds,
      companionNameById,
      petId,
      petName,
      activeLessonId,
    ],
  );

  function toggleCompanion(id: string) {
    setCompanionIds((prev) => {
      if (prev.includes(id)) {
        setCompanionNameById((names) => {
          const next = { ...names };
          delete next[id];
          return next;
        });
        const nextIds = prev.filter((x) => x !== id);
        if (nextIds.length === 0) setShowCompanionNames(false);
        return nextIds;
      }
      return [...prev, id];
    });
  }

  function setCompanionName(id: string, value: string) {
    setCompanionNameById((prev) => ({ ...prev, [id]: value }));
  }

  function clearCompanions() {
    setCompanionIds([]);
    setCompanionNameById({});
    setShowCompanionNames(false);
  }

  function clearPet() {
    setPetId(null);
    setPetName("");
    setShowPetName(false);
  }

  function clearExtras() {
    clearCompanions();
    clearPet();
    setLessonId(null);
    setShowLessonPicker(false);
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
      ageBandId,
      momentId: path === "moment" ? momentId : null,
      classicId: path === "classic" ? classicId : null,
      companionIds: skipExtras ? [] : companionIds,
      companionNameById: skipExtras ? null : companionNameById,
      petId: skipExtras ? null : petId,
      petName: skipExtras ? null : petName || null,
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
          ageBandId: data.ageBandId ?? ageBandId,
          ageBandLabel: data.ageBandLabel ?? "",
          momentId: data.momentId ?? null,
          classicId: data.classicId ?? null,
          companionId: data.companionId ?? data.companionIds?.[0] ?? null,
          companionIds: data.companionIds ?? [],
          companionNameById: data.companionNameById ?? null,
          companionNames: null,
          petId: data.petId ?? null,
          petName: data.petName ?? null,
          lessonId: data.lessonId ?? null,
          markdown: data.markdown,
          createdAt: data.createdAt,
          frameLabel: data.frameLabel,
          lessonLabel: data.lessonLabel,
          companionLabel: data.companionLabel ?? null,
          petLabel: data.petLabel ?? null,
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

  function createNowFromBasics() {
    if (!validateName()) return;
    void finish(true);
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
            <legend>Edad del niño</legend>
            <div className="trial-form__challenge-list">
              {TRIAL_AGE_BANDS.map((band) => (
                <label
                  key={band.id}
                  className={`trial-form__chip${ageBandId === band.id ? " trial-form__chip--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="ageBand"
                    value={band.id}
                    checked={ageBandId === band.id}
                    onChange={() => setAgeBandId(band.id)}
                    disabled={loading}
                  />
                  {band.label}
                </label>
              ))}
            </div>
          </fieldset>

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
            type="button"
            className="family-btn family-btn--primary w-full"
            onClick={createNowFromBasics}
            disabled={loading}
          >
            {loading ? loadingMessage : "Crear con IA"}
          </button>
          <button
            type="submit"
            className="trial-form__skip"
            disabled={loading}
          >
            Añadir familia (opcional)
          </button>
        </form>
      ) : (
        <div className="trial-form mt-4">
          <p className="trial-form__optional-lead">
            Opcional — puedes crear ya. Añade familia solo si quieres.
          </p>

          <section className="trial-form__summary" aria-label="Resumen del cuento">
            <h2 className="trial-form__summary-title">Así quedará tu cuento</h2>
            <p className="trial-form__summary-blurb">{storyBlurb}</p>
            <p className="trial-form__summary-meta">
              {path === "classic" ? "Cuento clásico" : "Historia de casa"}:{" "}
              <strong>
                {path === "classic"
                  ? getTrialClassic(classicId).label
                  : getTrialMoment(momentId).label}
              </strong>
              <button
                type="button"
                className="trial-form__summary-edit"
                onClick={() => setStep("basics")}
                disabled={loading}
              >
                Cambiar
              </button>
            </p>
          </section>

          <fieldset className="trial-form__challenges">
            <legend>¿Quién acompaña?</legend>
            <div className="trial-form__challenge-list">
              <label
                className={`trial-form__chip${companionIds.length === 0 ? " trial-form__chip--active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={companionIds.length === 0}
                  onChange={() => clearCompanions()}
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
            {selectedCompanions.length > 0 ? (
              <div className="trial-form__advanced">
                {!showCompanionNames ? (
                  <button
                    type="button"
                    className="trial-form__advanced-toggle"
                    onClick={() => setShowCompanionNames(true)}
                    disabled={loading}
                  >
                    Nombrar acompañantes (opcional)
                  </button>
                ) : (
                  <div className="trial-form__companion-names">
                    {selectedCompanions.map((c) => (
                      <label key={c.id} className="trial-form__field">
                        {c.label}
                        <input
                          value={companionNameById[c.id] ?? ""}
                          onChange={(e) =>
                            setCompanionName(c.id, e.target.value)
                          }
                          placeholder={`Ej. nombre de ${c.label.toLowerCase()}`}
                          maxLength={TRIAL_COMPANION_NAME_MAX}
                          disabled={loading}
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      className="trial-form__advanced-toggle"
                      onClick={() => setShowCompanionNames(false)}
                      disabled={loading}
                    >
                      Ocultar nombres
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </fieldset>

          <fieldset className="trial-form__challenges">
            <legend>¿Hay una mascota?</legend>
            <div className="trial-form__challenge-list">
              <label
                className={`trial-form__chip${petId === null ? " trial-form__chip--active" : ""}`}
              >
                <input
                  type="radio"
                  name="pet"
                  checked={petId === null}
                  onChange={() => clearPet()}
                  disabled={loading}
                />
                Ninguna
              </label>
              {TRIAL_PETS.map((p) => (
                <label
                  key={p.id}
                  className={`trial-form__chip${petId === p.id ? " trial-form__chip--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="pet"
                    checked={petId === p.id}
                    onChange={() => {
                      setPetId(p.id);
                      setShowPetName(false);
                    }}
                    disabled={loading}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            {petId ? (
              <div className="trial-form__advanced">
                {!showPetName ? (
                  <button
                    type="button"
                    className="trial-form__advanced-toggle"
                    onClick={() => setShowPetName(true)}
                    disabled={loading}
                  >
                    Nombrar mascota (opcional)
                  </button>
                ) : (
                  <label className="trial-form__field">
                    Nombre
                    <input
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Ej. Bingo"
                      maxLength={TRIAL_COMPANION_NAME_MAX}
                      disabled={loading}
                      autoFocus
                    />
                  </label>
                )}
              </div>
            ) : null}
          </fieldset>

          <div className="trial-form__lesson-soft">
            <p>
              Sugerido: <strong>{activeLessonLabel}</strong>
              <button
                type="button"
                className="trial-form__summary-edit"
                onClick={() => setShowLessonPicker((v) => !v)}
                disabled={loading}
              >
                {showLessonPicker ? "Listo" : "Cambiar"}
              </button>
            </p>
            {showLessonPicker ? (
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
                      onChange={() => {
                        setLessonId(l.id);
                        setShowLessonPicker(false);
                      }}
                      disabled={loading}
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="trial-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="family-btn family-btn--primary w-full"
            onClick={() => finish(false)}
            disabled={loading}
          >
            {loading ? loadingMessage : "Crear con IA"}
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
