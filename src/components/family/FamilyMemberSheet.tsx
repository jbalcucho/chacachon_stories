"use client";

import { useEffect, useId, useRef } from "react";
import type {
  AdultRole,
  ChildTraitId,
  FamilyAdultDraft,
  FamilyChildDraft,
  FamilyMemberDraft,
  FamilyPetDraft,
} from "@/lib/family-profile-builder";
import {
  ADULT_ROLE_OPTIONS,
  CHILD_TRAIT_OPTIONS,
} from "@/lib/family-profile-builder";

type Props = {
  open: boolean;
  title: string;
  member: FamilyMemberDraft | null;
  onClose: () => void;
  onSave: (member: FamilyMemberDraft) => void;
  onDelete?: () => void;
};

export default function FamilyMemberSheet({
  open,
  title,
  member,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open, member?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !member) return null;

  function updateChild(patch: Partial<FamilyChildDraft>) {
    if (member?.kind !== "nino") return;
    onSave({ ...member, ...patch });
  }

  function updateAdult(patch: Partial<FamilyAdultDraft>) {
    if (member?.kind !== "adulto") return;
    onSave({ ...member, ...patch });
  }

  function updatePet(patch: Partial<FamilyPetDraft>) {
    if (member?.kind !== "mascota") return;
    onSave({ ...member, ...patch });
  }

  function toggleTrait(id: ChildTraitId) {
    if (member?.kind !== "nino") return;
    const has = member.traits.includes(id);
    updateChild({
      traits: has
        ? member.traits.filter((t) => t !== id)
        : [...member.traits, id],
    });
  }

  return (
    <div className="family-sheet" role="presentation">
      <button
        type="button"
        className="family-sheet__backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="family-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="family-sheet__head">
          <h2 id={titleId} className="family-sheet__title">
            {title}
          </h2>
          <button
            type="button"
            className="family-sheet__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="family-sheet__body">
          {member.kind === "nino" ? (
            <>
              <label className="family-field">
                Nombre
                <input
                  ref={firstFieldRef}
                  value={member.nombre}
                  onChange={(e) => updateChild({ nombre: e.target.value })}
                  placeholder="Nicolás"
                />
              </label>
              <label className="family-field">
                ¿Cómo le dicen en casa?
                <input
                  value={member.apodo}
                  onChange={(e) => updateChild({ apodo: e.target.value })}
                  placeholder="Nico"
                />
              </label>
              <fieldset className="family-traits">
                <legend>¿Qué le pasa a menudo?</legend>
                <div className="family-traits__list">
                  {CHILD_TRAIT_OPTIONS.map((opt) => {
                    const on = member.traits.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`family-trait${on ? " family-trait--on" : ""}`}
                        aria-pressed={on}
                        onClick={() => toggleTrait(opt.id)}
                      >
                        <span className="family-trait__label">{opt.label}</span>
                        <span className="family-trait__hint">{opt.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          ) : null}

          {member.kind === "adulto" ? (
            <>
              <label className="family-field">
                Nombre
                <input
                  ref={firstFieldRef}
                  value={member.nombre}
                  onChange={(e) => updateAdult({ nombre: e.target.value })}
                  placeholder="Julie"
                />
              </label>
              <label className="family-field">
                ¿Cómo le dicen?
                <input
                  value={member.apodo}
                  onChange={(e) => updateAdult({ apodo: e.target.value })}
                  placeholder="Pauleta / mamá"
                />
              </label>
              <label className="family-field">
                Rol
                <select
                  value={member.rol}
                  onChange={(e) =>
                    updateAdult({ rol: e.target.value as AdultRole })
                  }
                >
                  {ADULT_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="family-field">
                Frase típica (opcional)
                <input
                  value={member.frase}
                  onChange={(e) => updateAdult({ frase: e.target.value })}
                  placeholder="Fuera pereza fuera"
                />
              </label>
            </>
          ) : null}

          {member.kind === "mascota" ? (
            <>
              <label className="family-field">
                Nombre
                <input
                  ref={firstFieldRef}
                  value={member.nombre}
                  onChange={(e) => updatePet({ nombre: e.target.value })}
                  placeholder="Bingo"
                />
              </label>
              <label className="family-field">
                ¿Cómo es?
                <input
                  value={member.personalidad}
                  onChange={(e) =>
                    updatePet({ personalidad: e.target.value })
                  }
                  placeholder="gordo y perezoso / miedosa"
                />
              </label>
            </>
          ) : null}
        </div>

        <div className="family-sheet__actions">
          {onDelete ? (
            <button
              type="button"
              className="family-btn family-btn--danger"
              onClick={onDelete}
            >
              Quitar
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="family-btn family-btn--primary"
            onClick={onClose}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
