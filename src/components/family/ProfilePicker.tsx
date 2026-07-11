"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MAX_READER_PROFILES,
  addReaderProfile,
  canAddReaderProfile,
  type ActiveProfile,
  writeActiveProfile,
} from "@/lib/active-profile";

type Props = {
  profiles: ActiveProfile[];
  activeId: string | null;
  continueHref?: string;
  manageHref?: string;
  required?: boolean;
  onProfilesChange: (profiles: ActiveProfile[]) => void;
};

export default function ProfilePicker({
  profiles,
  activeId,
  continueHref = "/",
  manageHref = "/familia",
  required = false,
  onProfilesChange,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(profiles.length === 0);

  const isFirst = profiles.length === 0;
  const canAdd = canAddReaderProfile(profiles.length);

  function select(profile: ActiveProfile) {
    writeActiveProfile(profile);
    router.push(continueHref);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = addReaderProfile(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onProfilesChange([...profiles, result.profile]);
    writeActiveProfile(result.profile);
    setName("");
    setAdding(false);
    router.push(continueHref);
  }

  return (
    <div className="profile-picker">
      <header className="profile-picker__hero">
        <p className="profile-picker__eyebrow">
          {isFirst ? "Bienvenida a tu espacio" : "¿Quién entra hoy?"}
        </p>
        <h1 className="title-display profile-picker__title">
          {isFirst
            ? "¿Cómo te llamas?"
            : required && !activeId
              ? "Elige un perfil para continuar"
              : "Elige un perfil"}
        </h1>
        <p className="intro-copy profile-picker__lead">
          {isFirst
            ? "Crea tu primer perfil (máximo 5 en la cuenta). La familia del cuento se arma aparte en la casa."
            : `Hasta ${MAX_READER_PROFILES} perfiles. Cada uno guarda su ritmo de lectura; los créditos son de la familia.`}
        </p>
      </header>

      {!isFirst ? (
        <ul className="profile-picker__grid" role="list">
          {profiles.map((tile) => {
            const selected = tile.id === activeId;
            return (
              <li key={tile.id}>
                <button
                  type="button"
                  className={`profile-picker__tile${selected ? " profile-picker__tile--active" : ""}`}
                  onClick={() => select(tile)}
                >
                  <span
                    className="profile-picker__avatar"
                    style={{ ["--avatar-hue" as string]: tile.hue }}
                    aria-hidden="true"
                  >
                    {tile.initial}
                  </span>
                  <span className="profile-picker__name">{tile.label}</span>
                  <span className="profile-picker__meta">Perfil de lectura</span>
                  {selected ? (
                    <span className="profile-picker__badge">Último</span>
                  ) : null}
                </button>
              </li>
            );
          })}
          {canAdd && !adding ? (
            <li>
              <button
                type="button"
                className="profile-picker__tile profile-picker__tile--add"
                onClick={() => {
                  setAdding(true);
                  setError(null);
                }}
              >
                <span className="profile-picker__avatar profile-picker__avatar--add" aria-hidden="true">
                  +
                </span>
                <span className="profile-picker__name">Añadir perfil</span>
                <span className="profile-picker__meta">
                  {profiles.length}/{MAX_READER_PROFILES}
                </span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {adding || isFirst ? (
        <form className="profile-picker__create" onSubmit={handleCreate}>
          {!isFirst ? (
            <p className="profile-picker__create-title">Nuevo perfil</p>
          ) : null}
          <label className="profile-picker__field">
            Nombre
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Papá, Nico, Simón…"
              maxLength={40}
              autoFocus
              autoComplete="nickname"
              required
            />
          </label>
          {error ? (
            <p className="profile-picker__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="profile-picker__create-actions">
            <button type="submit" className="family-btn family-btn--primary">
              {isFirst ? "Entrar" : "Crear y entrar"}
            </button>
            {!isFirst ? (
              <button
                type="button"
                className="family-btn family-btn--ghost"
                onClick={() => {
                  setAdding(false);
                  setName("");
                  setError(null);
                }}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <p className="profile-picker__foot">
        <Link href={manageHref}>Editar la casa familiar</Link>
        {!required || activeId ? (
          <>
            {" · "}
            <Link href="/">Volver al inicio</Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
