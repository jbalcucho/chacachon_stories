"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FamilyMemberSheet from "@/components/family/FamilyMemberSheet";
import FamilyStage from "@/components/family/FamilyStage";
import {
  FAMILY_WIZARD_STEPS,
  HOME_LABEL_CHIPS,
  assessFamilyReadiness,
  buildFamilyPreviewSentence,
  createAdultDraft,
  createChildDraft,
  createPetDraft,
  familyBuilderToDocument,
  moveChild,
  reorderChildren,
  type FamilyBuilderState,
  type FamilyMemberDraft,
  type FamilyWizardStepId,
} from "@/lib/family-profile-builder";

type Status = "idle" | "saving" | "saved" | "error";

type Props = {
  initialState: FamilyBuilderState;
  userFirstName?: string;
  onSave: (state: FamilyBuilderState) => Promise<void>;
  onExport: () => void;
  onDeleteAccount: (confirm: string) => Promise<void>;
};

export default function FamilyProfileBuilder({
  initialState,
  userFirstName,
  onSave,
  onExport,
  onDeleteAccount,
}: Props) {
  const [state, setState] = useState(initialState);
  const [step, setStep] = useState<FamilyWizardStepId>("ninos");
  const [selected, setSelected] = useState<FamilyMemberDraft | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const readiness = useMemo(() => assessFamilyReadiness(state), [state]);
  const preview = useMemo(() => buildFamilyPreviewSentence(state), [state]);
  const stepIndex = FAMILY_WIZARD_STEPS.findIndex((s) => s.id === step);

  function openMember(member: FamilyMemberDraft) {
    setSelected(member);
    setSheetOpen(true);
  }

  function upsertMember(member: FamilyMemberDraft) {
    setState((prev) => {
      if (member.kind === "nino") {
        const exists = prev.ninos.some((n) => n.id === member.id);
        return {
          ...prev,
          ninos: exists
            ? prev.ninos.map((n) => (n.id === member.id ? member : n))
            : [...prev.ninos, member],
        };
      }
      if (member.kind === "adulto") {
        const exists = prev.adultos.some((a) => a.id === member.id);
        return {
          ...prev,
          adultos: exists
            ? prev.adultos.map((a) => (a.id === member.id ? member : a))
            : [...prev.adultos, member],
        };
      }
      const exists = prev.mascotas.some((m) => m.id === member.id);
      return {
        ...prev,
        mascotas: exists
          ? prev.mascotas.map((m) => (m.id === member.id ? member : m))
          : [...prev.mascotas, member],
      };
    });
    setSelected(member);
  }

  function deleteSelected() {
    if (!selected) return;
    const id = selected.id;
    setState((prev) => ({
      ...prev,
      ninos: prev.ninos.filter((n) => n.id !== id),
      adultos: prev.adultos.filter((a) => a.id !== id),
      mascotas: prev.mascotas.filter((m) => m.id !== id),
    }));
    setSelected(null);
    setSheetOpen(false);
  }

  function addToZone(zone: "ninos" | "adultos" | "mascotas") {
    if (zone === "ninos") {
      if (state.ninos.length >= 6) return;
      const draft = createChildDraft({ orden: state.ninos.length + 1 });
      upsertMember(draft);
      openMember(draft);
      setStep("ninos");
      return;
    }
    if (zone === "adultos") {
      if (state.adultos.length >= 4) return;
      const hasMama = state.adultos.some((a) => a.rol === "mama");
      const draft = createAdultDraft({ rol: hasMama ? "papa" : "mama" });
      upsertMember(draft);
      openMember(draft);
      setStep("adultos");
      return;
    }
    if (state.mascotas.length >= 5) return;
    const draft = createPetDraft();
    upsertMember(draft);
    openMember(draft);
    setStep("sabor");
  }

  async function handleSave(andCreate: boolean) {
    setError(null);
    const check = assessFamilyReadiness(state);
    if (!check.ready) {
      setError(check.missing.join(". "));
      setStatus("error");
      if (!state.ninos.some((n) => n.nombre.trim())) setStep("ninos");
      else setStep("adultos");
      return;
    }

    // Validate document shape lightly
    const doc = familyBuilderToDocument(state);
    if (doc.ninos.length === 0 || doc.adultos.length === 0) {
      setError("Necesitas al menos un niño y un adulto con nombre.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    try {
      await onSave(state);
      setStatus("saved");
      if (andCreate) {
        window.location.href = "/crear";
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
      setStatus("error");
    }
  }

  return (
    <div className="family-builder">
      <header className="family-builder__hero">
        <p className="family-builder__hello">
          Hola, {userFirstName ?? "familia"}
        </p>
        <h1 className="title-display family-builder__title">Tu casa</h1>
        <p className="intro-copy family-builder__lead">
          Arma el elenco del cuento: nombres, apodos y un poco de sabor. En ~2
          minutos ya puedes crear.
        </p>
      </header>

      <FamilyStage
        state={state}
        selectedId={selected?.id ?? null}
        onSelect={openMember}
        onAdd={addToZone}
        onReorderChild={(fromId, toId) =>
          setState((prev) => ({
            ...prev,
            ninos: reorderChildren(prev.ninos, fromId, toId),
          }))
        }
      />

      <p className="family-preview" role="status">
        {preview}
      </p>

      <div className="family-meter" aria-label="Completitud del perfil">
        <div className="family-meter__row">
          <span>Listo para cuentos</span>
          <strong>{readiness.completeness}%</strong>
        </div>
        <div className="family-meter__track">
          <div
            className="family-meter__fill"
            style={{ width: `${readiness.completeness}%` }}
          />
        </div>
      </div>

      <nav className="family-steps" aria-label="Pasos del perfil">
        {FAMILY_WIZARD_STEPS.map((s, index) => (
          <button
            key={s.id}
            type="button"
            className={`family-steps__item${step === s.id ? " family-steps__item--active" : ""}${index < stepIndex ? " family-steps__item--done" : ""}`}
            onClick={() => setStep(s.id)}
          >
            <span className="family-steps__num">{index + 1}</span>
            <span className="family-steps__label">{s.title}</span>
          </button>
        ))}
      </nav>

      <section className="family-panel">
        {step === "ninos" ? (
          <>
            <h2 className="family-panel__title">¿Para quién es el cuento?</h2>
            <p className="family-panel__hint">
              Añade 1 a 3 niños. El apodo es lo que más suena en el cuento.
              Arrastra para ordenar (mayor → menor) en escritorio.
            </p>
            <div className="family-panel__list">
              {state.ninos.map((nino, index) => (
                <div key={nino.id} className="family-row">
                  <button
                    type="button"
                    className="family-row__main"
                    onClick={() => openMember(nino)}
                  >
                    <span className="family-row__title">
                      {nino.apodo || nino.nombre || `Niño ${index + 1}`}
                    </span>
                    <span className="family-row__sub">
                      {nino.traits.length
                        ? `${nino.traits.length} detalle(s)`
                        : "Toca para editar"}
                    </span>
                  </button>
                  <div className="family-row__move">
                    <button
                      type="button"
                      aria-label="Subir"
                      disabled={index === 0}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          ninos: moveChild(prev.ninos, nino.id, -1),
                        }))
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      disabled={index === state.ninos.length - 1}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          ninos: moveChild(prev.ninos, nino.id, 1),
                        }))
                      }
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="family-btn family-btn--ghost"
              onClick={() => addToZone("ninos")}
            >
              + Añadir niño/a
            </button>
          </>
        ) : null}

        {step === "adultos" ? (
          <>
            <h2 className="family-panel__title">¿Quiénes viven en casa?</h2>
            <p className="family-panel__hint">
              Mamá, papá, cuidador… Al menos uno. La frase típica da mucho sabor.
            </p>
            <div className="family-panel__list">
              {state.adultos.map((adulto) => (
                <button
                  key={adulto.id}
                  type="button"
                  className="family-row family-row--solo"
                  onClick={() => openMember(adulto)}
                >
                  <span className="family-row__title">
                    {adulto.apodo || adulto.nombre || "Adulto"}
                  </span>
                  <span className="family-row__sub">
                    {adulto.frase || "Toca para editar"}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="family-btn family-btn--ghost"
              onClick={() => addToZone("adultos")}
            >
              + Añadir adulto
            </button>
          </>
        ) : null}

        {step === "hogar" ? (
          <>
            <h2 className="family-panel__title">¿Cómo le dicen a casa?</h2>
            <p className="family-panel__hint">
              Elige una etiqueta. La ciudad es libre — no tiene que ser Bogotá.
            </p>
            <div className="family-home-chips">
              {HOME_LABEL_CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`family-home-chip${state.home.hogar === label ? " family-home-chip--on" : ""}`}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      home: { ...prev.home, hogar: label },
                    }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="family-field">
              O escribe otra
              <input
                value={state.home.hogar}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    home: { ...prev.home, hogar: e.target.value },
                  }))
                }
                placeholder="el apartamento"
              />
            </label>
            <label className="family-field">
              Ciudad
              <input
                value={state.home.ciudad}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    home: { ...prev.home, ciudad: e.target.value },
                  }))
                }
                placeholder="Tu ciudad"
              />
            </label>
            <label className="family-field">
              Apellido / nombre del hogar (opcional)
              <input
                value={state.home.apellido}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    home: { ...prev.home, apellido: e.target.value },
                  }))
                }
                placeholder="Familia García"
              />
            </label>
          </>
        ) : null}

        {step === "sabor" ? (
          <>
            <h2 className="family-panel__title">Un poco de sabor</h2>
            <p className="family-panel__hint">
              Opcional. Mascotas y detalles del niño mejoran el cuento, pero no
              bloquean.
            </p>
            <div className="family-panel__list">
              {state.mascotas.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  className="family-row family-row--solo"
                  onClick={() => openMember(pet)}
                >
                  <span className="family-row__title">
                    {pet.nombre || "Mascota"}
                  </span>
                  <span className="family-row__sub">
                    {pet.personalidad || "Toca para editar"}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="family-btn family-btn--ghost"
              onClick={() => addToZone("mascotas")}
            >
              + Añadir mascota
            </button>
            <p className="family-panel__hint family-panel__hint--spaced">
              Tip: abre un niño en la casa y marca “pantallas”, “dormir”, etc.
            </p>
          </>
        ) : null}

        {step === "listo" ? (
          <>
            <h2 className="family-panel__title">¿Listos para el cuento?</h2>
            <p className="family-panel__hint">{preview}</p>
            {!readiness.ready ? (
              <p className="family-alert" role="alert">
                Falta: {readiness.missing.join("; ")}.
              </p>
            ) : (
              <p className="family-ok" role="status">
                Perfil suficiente para personalizar cuentos.
              </p>
            )}
          </>
        ) : null}
      </section>

      {error ? (
        <p className="family-alert" role="alert">
          {error}
        </p>
      ) : null}
      {status === "saved" ? (
        <p className="family-ok" role="status">
          Perfil guardado.
        </p>
      ) : null}

      <div className="family-actions">
        {stepIndex > 0 ? (
          <button
            type="button"
            className="family-btn family-btn--ghost"
            onClick={() =>
              setStep(FAMILY_WIZARD_STEPS[stepIndex - 1].id)
            }
          >
            Atrás
          </button>
        ) : (
          <span />
        )}
        {stepIndex < FAMILY_WIZARD_STEPS.length - 1 ? (
          <button
            type="button"
            className="family-btn family-btn--primary"
            onClick={() =>
              setStep(FAMILY_WIZARD_STEPS[stepIndex + 1].id)
            }
          >
            Siguiente
          </button>
        ) : (
          <div className="family-actions__stack">
            <button
              type="button"
              className="family-btn family-btn--primary"
              disabled={status === "saving"}
              onClick={() => handleSave(true)}
            >
              {status === "saving"
                ? "Guardando…"
                : "Guardar y crear cuento"}
            </button>
            <button
              type="button"
              className="family-btn family-btn--ghost"
              disabled={status === "saving"}
              onClick={() => handleSave(false)}
            >
              Solo guardar
            </button>
          </div>
        )}
      </div>

      <section className="family-privacy">
        <h2 className="family-privacy__title">Tus datos (Ley 1581)</h2>
        <button
          type="button"
          className="family-btn family-btn--ghost"
          onClick={onExport}
        >
          Exportar mis datos (JSON)
        </button>
        <div className="family-privacy__danger">
          <p>
            Eliminar cuenta borra tu usuario y el perfil familiar. No se puede
            deshacer.
          </p>
          <label className="family-field">
            Escribe ELIMINAR para confirmar
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="family-btn family-btn--danger"
            onClick={() => onDeleteAccount(deleteConfirm)}
          >
            Eliminar mi cuenta
          </button>
        </div>
      </section>

      <p className="family-builder__back">
        <Link href="/">← Volver a la biblioteca</Link>
      </p>

      <FamilyMemberSheet
        open={sheetOpen}
        title={
          selected?.kind === "nino"
            ? "Editar niño/a"
            : selected?.kind === "adulto"
              ? "Editar adulto"
              : "Editar mascota"
        }
        member={selected}
        onClose={() => setSheetOpen(false)}
        onSave={upsertMember}
        onDelete={selected ? deleteSelected : undefined}
      />
    </div>
  );
}
