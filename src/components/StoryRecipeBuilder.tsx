"use client";

import BrandMark from "@/components/BrandMark";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type {
  RecipeIngredient,
  RecipeIngredients,
  RecipeKind,
} from "@/lib/story-recipe";
import {
  buildInitialRecipeSelection,
  buildRecipeChecklist,
  buildRecipeSynopsis,
  buildRecipeTitle,
  countChecklistDone,
  getRecipeBlocker,
  getRecipeSuggestion,
  hasPlantillaMolde,
  personAvatarHue,
  personAvatarInitial,
  RECIPE_GUIDED_STORAGE_KEY,
  type RecipeSelectionSlice,
} from "@/lib/recipe-summary";

type Props = {
  ingredients: RecipeIngredients;
  profileSource: "user" | "demo";
  plantillaSlug?: string | null;
};

type ZoneKey =
  | "heroes"
  | "reto"
  | "aprenden"
  | "lugar"
  | "mascota"
  | "acompanantes"
  | "rolReto"
  | "objeto"
  | "molde";

type ZoneConfig = {
  key: ZoneKey;
  title: string;
  hint: string;
  empty: string;
  accepts: RecipeKind[];
  max: number;
  core: boolean;
  options: (ing: RecipeIngredients) => RecipeIngredient[];
};

const ZONES: ZoneConfig[] = [
  {
    key: "heroes",
    title: "Héroes",
    hint: "Toca cada chip · hasta 3",
    empty: "¿Quiénes protagonizan?",
    accepts: ["persona"],
    max: 3,
    core: true,
    options: (i) => i.personas,
  },
  {
    key: "reto",
    title: "El reto",
    hint: "1 dilema",
    empty: "¿Qué problema resuelven?",
    accepts: ["dilema"],
    max: 1,
    core: true,
    options: (i) => i.dilemas,
  },
  {
    key: "aprenden",
    title: "Qué aprenden",
    hint: "Hasta 2 lecciones",
    empty: "Elige una lección",
    accepts: ["emocion"],
    max: 2,
    core: true,
    options: (i) => i.emociones,
  },
  {
    key: "lugar",
    title: "¿Dónde pasa?",
    hint: "1 lugar",
    empty: "Elige la ambientación",
    accepts: ["lugar"],
    max: 1,
    core: true,
    options: (i) => i.lugares,
  },
  {
    key: "mascota",
    title: "Mascota",
    hint: "Opcional · 1",
    empty: "¿Aparece alguna mascota?",
    accepts: ["mascota"],
    max: 1,
    core: false,
    options: (i) => i.mascotas,
  },
  {
    key: "acompanantes",
    title: "Acompañantes",
    hint: "Familia o mascotas · hasta 4",
    empty: "¿Quién más aparece?",
    accepts: ["persona", "mascota"],
    max: 4,
    core: false,
    options: (i) => [...i.personas, ...i.mascotas],
  },
  {
    key: "rolReto",
    title: "Rol de reto",
    hint: "Alguien hace de lobo/monstruo · 1",
    empty: "¿Quién interpreta el reto?",
    accepts: ["persona", "mascota"],
    max: 1,
    core: false,
    options: (i) => [...i.mascotas, ...i.personas],
  },
  {
    key: "objeto",
    title: "Objeto especial",
    hint: "Hasta 2",
    empty: "Un elemento con protagonismo",
    accepts: ["objeto"],
    max: 2,
    core: false,
    options: (i) => i.objetos,
  },
  {
    key: "molde",
    title: "Molde clásico",
    hint: "Opcional · 1",
    empty: "¿Mezclar con un cuento clásico?",
    accepts: ["molde"],
    max: 1,
    core: false,
    options: (i) => i.moldes,
  },
];

type Selection = RecipeSelectionSlice;

type ZoneBlockProps = {
  config: ZoneConfig;
  ingredients: RecipeIngredients;
  selection: RecipeIngredient[];
  activeKind: RecipeKind | null;
  dragEnabled: boolean;
  pulseTokenId: string | null;
  onToggle: (zone: ZoneKey, ing: RecipeIngredient) => void;
  onRemove: (zone: ZoneKey, id: string) => void;
  onDropIngredient: (zone: ZoneKey, id: string) => void;
  onDragStart: (kind: RecipeKind) => void;
  onDragEnd: () => void;
};

function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine;
}

function usePreferGuided(): boolean {
  const [prefer, setPrefer] = useState(false);

  useEffect(() => {
    const done = window.localStorage.getItem(RECIPE_GUIDED_STORAGE_KEY);
    const narrow = window.matchMedia("(max-width: 619px)").matches;
    setPrefer(!done && narrow);
  }, []);

  return prefer;
}

function IngredientIcon({ ing }: { ing: RecipeIngredient }) {
  if (ing.kind === "persona") {
    const initial = personAvatarInitial(ing.label);
    const hue = personAvatarHue(ing.id);
    return (
      <span
        className="recipe-chip__avatar"
        style={{ "--avatar-hue": hue } as CSSProperties}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return <span aria-hidden="true">{ing.emoji}</span>;
}

function ZoneBlock({
  config,
  ingredients,
  selection,
  activeKind,
  dragEnabled,
  pulseTokenId,
  onToggle,
  onRemove,
  onDropIngredient,
  onDragStart,
  onDragEnd,
}: ZoneBlockProps) {
  const [over, setOver] = useState(false);
  const options = config.options(ingredients);
  const isTarget = activeKind !== null && config.accepts.includes(activeKind);
  const selectedIds = new Set(selection.map((s) => s.id));

  return (
    <div className="recipe-block">
      <div
        className={`recipe-zone${isTarget ? " recipe-zone--target" : ""}${over ? " recipe-zone--over" : ""}`}
        onDragOver={(e) => {
          if (!isTarget) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const id = e.dataTransfer.getData("text/plain");
          if (id) onDropIngredient(config.key, id);
        }}
      >
        <div className="recipe-zone__head">
          <span className="recipe-zone__title">{config.title}</span>
          <span className="recipe-zone__hint">{config.hint}</span>
        </div>
        <div className="recipe-zone__slots">
          {selection.length === 0 ? (
            <span className="recipe-zone__empty">{config.empty}</span>
          ) : (
            selection.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`recipe-token${pulseTokenId === item.id ? " recipe-token--enter" : ""}`}
                onClick={() => onRemove(config.key, item.id)}
                aria-label={`Quitar ${item.label}`}
              >
                <IngredientIcon ing={item} />
                {item.label}
                <span className="recipe-token__x" aria-hidden="true">
                  ×
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="recipe-palette__chips">
        {options.map((opt) => {
          const selected = selectedIds.has(opt.id);
          return (
            <button
              key={`${config.key}-${opt.id}`}
              type="button"
              draggable={dragEnabled}
              className={`recipe-chip${selected ? " recipe-chip--selected" : ""}`}
              onClick={() => onToggle(config.key, opt)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", opt.id);
                e.dataTransfer.effectAllowed = "copy";
                onDragStart(opt.kind);
              }}
              onDragEnd={onDragEnd}
              aria-pressed={selected}
              title={opt.hint}
            >
              <IngredientIcon ing={opt} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StoryRecipeBuilder({
  ingredients,
  profileSource,
  plantillaSlug = null,
}: Props) {
  const promoteMolde = hasPlantillaMolde(plantillaSlug);
  const dragEnabled = useFinePointer();
  const preferGuided = usePreferGuided();

  const [selection, setSelection] = useState<Selection>(() =>
    buildInitialRecipeSelection(ingredients, plantillaSlug),
  );
  const [activeKind, setActiveKind] = useState<RecipeKind | null>(null);
  const [showMore, setShowMore] = useState(
    () => promoteMolde || Boolean(plantillaSlug),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pulseTokenId, setPulseTokenId] = useState<string | null>(null);
  const [guidedActive, setGuidedActive] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);

  useEffect(() => {
    if (preferGuided) setGuidedActive(true);
  }, [preferGuided]);

  const allById = useMemo(() => {
    const map = new Map<string, RecipeIngredient>();
    for (const list of Object.values(ingredients)) {
      for (const ing of list) map.set(ing.id, ing);
    }
    return map;
  }, [ingredients]);

  const zoneMax = useMemo(() => {
    const map = {} as Record<ZoneKey, ZoneConfig>;
    for (const zone of ZONES) map[zone.key] = zone;
    return map;
  }, []);

  const coreZoneKeys = useMemo((): ZoneKey[] => {
    const base: ZoneKey[] = ["heroes", "reto", "aprenden", "lugar"];
    if (promoteMolde) base.push("molde");
    return base;
  }, [promoteMolde]);

  const guidedZoneKeys = coreZoneKeys;

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const pulseToken = useCallback((id: string) => {
    setPulseTokenId(id);
    window.setTimeout(() => setPulseTokenId(null), 320);
  }, []);

  const exitGuided = useCallback(() => {
    setGuidedActive(false);
    window.localStorage.setItem(RECIPE_GUIDED_STORAGE_KEY, "done");
  }, []);

  const toggle = useCallback(
    (zone: ZoneKey, ing: RecipeIngredient) => {
      setSelection((prev) => {
        const current = prev[zone];
        const max = zoneMax[zone].max;
        if (current.some((i) => i.id === ing.id)) {
          return { ...prev, [zone]: current.filter((i) => i.id !== ing.id) };
        }
        if (current.length >= max) {
          if (max === 1) {
            pulseToken(ing.id);
            return { ...prev, [zone]: [ing] };
          }
          flashNotice(`Máximo ${max} en “${zoneMax[zone].title}”.`);
          return prev;
        }
        pulseToken(ing.id);
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [flashNotice, pulseToken, zoneMax],
  );

  const remove = useCallback((zone: ZoneKey, id: string) => {
    setSelection((prev) => ({
      ...prev,
      [zone]: prev[zone].filter((i) => i.id !== id),
    }));
  }, []);

  const dropIngredient = useCallback(
    (zone: ZoneKey, id: string) => {
      const ing = allById.get(id);
      if (!ing || !zoneMax[zone].accepts.includes(ing.kind)) return;
      setSelection((prev) => {
        const current = prev[zone];
        const max = zoneMax[zone].max;
        if (current.some((i) => i.id === id)) return prev;
        if (current.length >= max) {
          if (max === 1) {
            pulseToken(ing.id);
            return { ...prev, [zone]: [ing] };
          }
          flashNotice(`Máximo ${max} en “${zoneMax[zone].title}”.`);
          return prev;
        }
        pulseToken(ing.id);
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [allById, flashNotice, pulseToken, zoneMax],
  );

  const checklist = useMemo(
    () => buildRecipeChecklist(selection),
    [selection],
  );
  const checklistDone = countChecklistDone(checklist);
  const title = useMemo(() => buildRecipeTitle(selection), [selection]);
  const synopsis = useMemo(() => buildRecipeSynopsis(selection), [selection]);
  const suggestion = useMemo(() => getRecipeSuggestion(selection), [selection]);
  const blocker = getRecipeBlocker(selection);
  const canGenerate = blocker === null;

  const coreZones = useMemo(() => {
    return ZONES.filter((z) => coreZoneKeys.includes(z.key));
  }, [coreZoneKeys]);

  const optionalZones = useMemo(() => {
    const optionalKeys: ZoneKey[] = promoteMolde
      ? ["mascota", "acompanantes", "rolReto", "objeto"]
      : ["mascota", "acompanantes", "rolReto", "objeto", "molde"];
    return ZONES.filter((z) => optionalKeys.includes(z.key));
  }, [promoteMolde]);

  const zonesToRender = useMemo(() => {
    if (!guidedActive) return coreZones;
    const key = guidedZoneKeys[guidedStep];
    return coreZones.filter((z) => z.key === key);
  }, [coreZones, guidedActive, guidedStep, guidedZoneKeys]);

  const guidedZoneConfig = guidedActive
    ? zoneMax[guidedZoneKeys[guidedStep]]
    : null;

  const zoneBlockProps = {
    ingredients,
    activeKind,
    dragEnabled,
    pulseTokenId,
    onToggle: toggle,
    onRemove: remove,
    onDropIngredient: dropIngredient,
    onDragStart: setActiveKind,
    onDragEnd: () => setActiveKind(null),
  };

  return (
    <div className="recipe-builder">
      {profileSource === "demo" ? (
        <p className="crear-banner crear-banner--info">
          Estás viendo la familia demo Chacachón. Entra y completa tu perfil para
          usar los nombres de tu casa.
        </p>
      ) : null}

      {plantillaSlug && selection.molde[0] ? (
        <p className="recipe-plantilla-badge" role="status">
          Plantilla: <strong>{selection.molde[0].label}</strong> — puedes ajustar
          la receta abajo.
        </p>
      ) : null}

      {guidedActive ? (
        <div className="recipe-guided">
          <p className="recipe-guided__label">
            Paso {guidedStep + 1} de {guidedZoneKeys.length}
            {guidedZoneConfig ? ` · ${guidedZoneConfig.title}` : ""}
          </p>
          <div className="recipe-guided__actions">
            <button
              type="button"
              className="recipe-guided__btn"
              disabled={guidedStep === 0}
              onClick={() => setGuidedStep((s) => Math.max(0, s - 1))}
            >
              ← Atrás
            </button>
            {guidedStep < guidedZoneKeys.length - 1 ? (
              <button
                type="button"
                className="recipe-guided__btn recipe-guided__btn--primary"
                onClick={() =>
                  setGuidedStep((s) =>
                    Math.min(guidedZoneKeys.length - 1, s + 1),
                  )
                }
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className="recipe-guided__btn recipe-guided__btn--primary"
                onClick={exitGuided}
              >
                Ver receta completa
              </button>
            )}
            <button
              type="button"
              className="recipe-guided__btn recipe-guided__btn--ghost"
              onClick={exitGuided}
            >
              Saltar guía
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="recipe-guided-toggle"
          onClick={() => {
            setGuidedActive(true);
            setGuidedStep(0);
          }}
        >
          ⊕ Modo guiado paso a paso
        </button>
      )}

      <div
        className={`recipe-board${guidedActive ? " recipe-board--guided" : ""}`}
      >
        {zonesToRender.map((zone) => (
          <ZoneBlock
            key={zone.key}
            config={zone}
            selection={selection[zone.key]}
            {...zoneBlockProps}
          />
        ))}
      </div>

      {!guidedActive ? (
        <>
          <button
            type="button"
            className="recipe-more"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
          >
            {showMore
              ? "− Menos opciones"
              : promoteMolde
                ? "➕ Agregar más (mascota, acompañantes, objeto…)"
                : "➕ Agregar más (mascota, molde clásico, objeto…)"}
          </button>

          {showMore ? (
            <div className="recipe-board recipe-board--optional">
              {optionalZones.map((zone) => (
                <ZoneBlock
                  key={zone.key}
                  config={zone}
                  selection={selection[zone.key]}
                  {...zoneBlockProps}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {suggestion ? (
        <p className="recipe-suggestion" role="note">
          💡 {suggestion}
        </p>
      ) : null}

      {notice ? (
        <p className="recipe-notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="recipe-checklist" aria-label="Progreso de la receta">
        <div className="recipe-checklist__head">
          <span className="recipe-checklist__title">Tu receta</span>
          <span className="recipe-checklist__count">
            {checklistDone}/{checklist.length}
          </span>
        </div>
        <ul className="recipe-checklist__list">
          {checklist.map((item) => (
            <li
              key={item.key}
              className={`recipe-checklist__item${item.done ? " recipe-checklist__item--done" : ""}`}
            >
              <span className="recipe-checklist__mark" aria-hidden="true">
                {item.done ? "✓" : "○"}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="recipe-summary">
        <div className="recipe-summary__cover" aria-hidden="true">
          <BrandMark id="brand-mark-recipe" variant="compact" />
        </div>
        <div className="recipe-summary__body">
          <p className="recipe-summary__label">Tu cuento</p>
          {title ? (
            <h2 className="recipe-summary__title">{title}</h2>
          ) : null}
          <p className="recipe-summary__text">
            {synopsis ??
              "Elige al menos un héroe y un reto para ver la idea del cuento."}
          </p>
        </div>
      </div>

      <button
        type="button"
        className={`recipe-generate${canGenerate ? " recipe-generate--ready" : ""}`}
        disabled={!canGenerate}
        aria-disabled={!canGenerate}
        onClick={() =>
          flashNotice("La generación con IA llega en la siguiente fase ✨")
        }
      >
        {canGenerate ? "✨ Crear mi cuento" : blocker}
      </button>
      <p className="crear-footnote mt-3 text-center text-xs">
        La IA escribe pronto · hoy puedes armar y guardar la receta.
      </p>
    </div>
  );
}
