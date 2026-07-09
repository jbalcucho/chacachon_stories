"use client";

import BrandIllustration from "@/components/BrandIllustration";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type {
  RecipeIngredient,
  RecipeIngredients,
  RecipeKind,
} from "@/lib/story-recipe";
import {
  buildInitialRecipeSelection,
  buildRecipeSynopsis,
  buildRecipeTitle,
  buildRecipeWizardSteps,
  getRecipeBlocker,
  getRecipeSuggestion,
  getStepBlocker,
  hasPlantillaMolde,
  personAvatarHue,
  personAvatarInitial,
  type RecipeSelectionSlice,
  type RecipeWizardStep,
} from "@/lib/recipe-summary";

type Props = {
  ingredients: RecipeIngredients;
  profileSource: "user" | "demo";
  plantillaSlug?: string | null;
};

type ZoneKey = keyof RecipeSelectionSlice;

type ZoneConfig = {
  key: ZoneKey;
  title: string;
  hint: string;
  empty: string;
  accepts: RecipeKind[];
  max: number;
  options: (ing: RecipeIngredients) => RecipeIngredient[];
};

const ZONE_CONFIGS: Record<ZoneKey, ZoneConfig> = {
  heroes: {
    key: "heroes",
    title: "Héroes",
    hint: "Toca para elegir · hasta 3",
    empty: "Toca un nombre abajo",
    accepts: ["persona"],
    max: 3,
    options: (i) => i.personas,
  },
  reto: {
    key: "reto",
    title: "El reto",
    hint: "Elige 1",
    empty: "Toca un dilema abajo",
    accepts: ["dilema"],
    max: 1,
    options: (i) => i.dilemas,
  },
  aprenden: {
    key: "aprenden",
    title: "Qué aprenden",
    hint: "Hasta 2",
    empty: "Toca una lección abajo",
    accepts: ["emocion"],
    max: 2,
    options: (i) => i.emociones,
  },
  lugar: {
    key: "lugar",
    title: "¿Dónde pasa?",
    hint: "Elige 1",
    empty: "Toca un lugar abajo",
    accepts: ["lugar"],
    max: 1,
    options: (i) => i.lugares,
  },
  mascota: {
    key: "mascota",
    title: "Mascota",
    hint: "Opcional · 1",
    empty: "¿Aparece alguna mascota?",
    accepts: ["mascota"],
    max: 1,
    options: (i) => i.mascotas,
  },
  acompanantes: {
    key: "acompanantes",
    title: "Acompañantes",
    hint: "Hasta 4",
    empty: "¿Quién más aparece?",
    accepts: ["persona", "mascota"],
    max: 4,
    options: (i) => [...i.personas, ...i.mascotas],
  },
  rolReto: {
    key: "rolReto",
    title: "Rol de reto",
    hint: "Quien hace de «lobo» · 1",
    empty: "¿Quién interpreta el reto?",
    accepts: ["persona", "mascota"],
    max: 1,
    options: (i) => [...i.mascotas, ...i.personas],
  },
  objeto: {
    key: "objeto",
    title: "Objeto especial",
    hint: "Hasta 2",
    empty: "Un detalle con protagonismo",
    accepts: ["objeto"],
    max: 2,
    options: (i) => i.objetos,
  },
  molde: {
    key: "molde",
    title: "Molde clásico",
    hint: "Opcional · 1",
    empty: "¿Mezclar con un clásico?",
    accepts: ["molde"],
    max: 1,
    options: (i) => i.moldes,
  },
};

const EXTRA_ZONE_KEYS: ZoneKey[] = [
  "mascota",
  "acompanantes",
  "rolReto",
  "objeto",
];

type ZoneBlockProps = {
  config: ZoneConfig;
  ingredients: RecipeIngredients;
  selection: RecipeIngredient[];
  activeKind: RecipeKind | null;
  dragEnabled: boolean;
  pulseTokenId: string | null;
  compact?: boolean;
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
  compact = false,
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
    <div className={`recipe-block${compact ? " recipe-block--compact" : ""}`}>
      {compact ? (
        <p className="recipe-block__mini-title">{config.title}</p>
      ) : null}
      <div
        className={`recipe-zone${isTarget ? " recipe-zone--target" : ""}${over ? " recipe-zone--over" : ""}${compact ? " recipe-zone--compact" : ""}`}
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
        {!compact ? (
          <div className="recipe-zone__head">
            <span className="recipe-zone__title">{config.title}</span>
            <span className="recipe-zone__hint">{config.hint}</span>
          </div>
        ) : (
          <span className="recipe-zone__hint recipe-zone__hint--solo">
            {config.hint}
          </span>
        )}
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
  const wizardSteps = useMemo(
    () => buildRecipeWizardSteps(promoteMolde),
    [promoteMolde],
  );

  const [selection, setSelection] = useState<RecipeSelectionSlice>(() =>
    buildInitialRecipeSelection(ingredients, plantillaSlug),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [activeKind, setActiveKind] = useState<RecipeKind | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pulseTokenId, setPulseTokenId] = useState<string | null>(null);

  const currentStep = wizardSteps[stepIndex];
  const isLastStep = stepIndex === wizardSteps.length - 1;
  const isReviewStep = currentStep.id === "review";
  const isExtrasStep = currentStep.id === "extras";

  const allById = useMemo(() => {
    const map = new Map<string, RecipeIngredient>();
    for (const list of Object.values(ingredients)) {
      for (const ing of list) map.set(ing.id, ing);
    }
    return map;
  }, [ingredients]);

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const pulseToken = useCallback((id: string) => {
    setPulseTokenId(id);
    window.setTimeout(() => setPulseTokenId(null), 320);
  }, []);

  const toggle = useCallback(
    (zone: ZoneKey, ing: RecipeIngredient) => {
      const config = ZONE_CONFIGS[zone];
      setSelection((prev) => {
        const current = prev[zone];
        const max = config.max;
        if (current.some((i) => i.id === ing.id)) {
          return { ...prev, [zone]: current.filter((i) => i.id !== ing.id) };
        }
        if (current.length >= max) {
          if (max === 1) {
            pulseToken(ing.id);
            return { ...prev, [zone]: [ing] };
          }
          flashNotice(`Máximo ${max} en “${config.title}”.`);
          return prev;
        }
        pulseToken(ing.id);
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [flashNotice, pulseToken],
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
      const config = ZONE_CONFIGS[zone];
      if (!ing || !config.accepts.includes(ing.kind)) return;
      setSelection((prev) => {
        const current = prev[zone];
        const max = config.max;
        if (current.some((i) => i.id === id)) return prev;
        if (current.length >= max) {
          if (max === 1) {
            pulseToken(ing.id);
            return { ...prev, [zone]: [ing] };
          }
          flashNotice(`Máximo ${max} en “${config.title}”.`);
          return prev;
        }
        pulseToken(ing.id);
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [allById, flashNotice, pulseToken],
  );

  const title = useMemo(() => buildRecipeTitle(selection), [selection]);
  const synopsis = useMemo(() => buildRecipeSynopsis(selection), [selection]);
  const suggestion = useMemo(() => getRecipeSuggestion(selection), [selection]);
  const blocker = getRecipeBlocker(selection);
  const canGenerate = blocker === null;

  const stepBlocker = useMemo(() => {
    if (isReviewStep || isExtrasStep) return null;
    if (!currentStep.zoneKey) return null;
    return getStepBlocker(
      currentStep.zoneKey,
      selection,
      currentStep.optional,
    );
  }, [currentStep, isExtrasStep, isReviewStep, selection]);

  const extraZoneKeys = useMemo((): ZoneKey[] => {
    if (promoteMolde) return EXTRA_ZONE_KEYS;
    return [...EXTRA_ZONE_KEYS, "molde"];
  }, [promoteMolde]);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(wizardSteps.length - 1, i + 1));
  }, [wizardSteps.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      if (index > stepIndex) return;
      setStepIndex(index);
    },
    [stepIndex],
  );

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
    <div className="recipe-wizard">
      {profileSource === "demo" ? (
        <p className="crear-banner crear-banner--info">
          Estás viendo la familia demo Chacachón. Entra y completa tu perfil para
          usar los nombres de tu casa.
        </p>
      ) : null}

      {plantillaSlug && selection.molde[0] ? (
        <p className="recipe-plantilla-badge" role="status">
          Plantilla: <strong>{selection.molde[0].label}</strong>
        </p>
      ) : null}

      <nav className="recipe-wizard__track" aria-label="Pasos de la receta">
        <div className="recipe-wizard__track-bar">
          <span
            className="recipe-wizard__track-fill"
            style={{
              width: `${((stepIndex + 1) / wizardSteps.length) * 100}%`,
            }}
          />
        </div>
        <ol className="recipe-wizard__steps">
          {wizardSteps.map((step, index) => {
            const passed = index < stepIndex;
            const filled =
              passed ||
              (step.zoneKey
                ? selection[step.zoneKey].length > 0
                : step.id === "extras" || step.id === "review");
            const done = passed || (index !== stepIndex && filled);
            const active = index === stepIndex;
            const clickable = index < stepIndex;

            return (
              <li
                key={step.id}
                className={[
                  "recipe-wizard__step",
                  active ? "recipe-wizard__step--active" : "",
                  done ? "recipe-wizard__step--done" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {clickable ? (
                  <button
                    type="button"
                    className="recipe-wizard__step-btn"
                    onClick={() => goToStep(index)}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="recipe-wizard__step-num">
                      {done && !active ? "✓" : index + 1}
                    </span>
                    <span className="recipe-wizard__step-label">
                      {stepLabelShort(step)}
                    </span>
                  </button>
                ) : (
                  <span className="recipe-wizard__step-btn recipe-wizard__step-btn--static">
                    <span className="recipe-wizard__step-num">
                      {done && !active ? "✓" : index + 1}
                    </span>
                    <span className="recipe-wizard__step-label">
                      {stepLabelShort(step)}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="recipe-wizard__panel" aria-labelledby="recipe-step-title">
        <header className="recipe-wizard__header">
          <h2 id="recipe-step-title" className="recipe-wizard__title">
            {currentStep.title}
          </h2>
          <p className="recipe-wizard__subtitle">{currentStep.subtitle}</p>
        </header>

        {isReviewStep ? (
          <div className="recipe-wizard__review">
            {suggestion ? (
              <p className="recipe-suggestion" role="note">
                💡 {suggestion}
              </p>
            ) : null}

            <div className="recipe-summary">
              <div className="recipe-summary__cover" aria-hidden="true">
                <BrandIllustration variant="recipe" />
              </div>
              <div className="recipe-summary__body">
                <p className="recipe-summary__label">Así quedará</p>
                {title ? (
                  <h3 className="recipe-summary__title">{title}</h3>
                ) : null}
                <p className="recipe-summary__text">
                  {synopsis ??
                    "Completa los pasos anteriores para ver la idea del cuento."}
                </p>
              </div>
            </div>

            <RecipeRecap selection={selection} steps={wizardSteps} />
          </div>
        ) : isExtrasStep ? (
          <div className="recipe-wizard__extras">
            {extraZoneKeys.map((key) => (
              <ZoneBlock
                key={key}
                config={ZONE_CONFIGS[key]}
                selection={selection[key]}
                compact
                {...zoneBlockProps}
              />
            ))}
          </div>
        ) : currentStep.zoneKey ? (
          <ZoneBlock
            config={ZONE_CONFIGS[currentStep.zoneKey]}
            selection={selection[currentStep.zoneKey]}
            {...zoneBlockProps}
          />
        ) : null}

        {notice ? (
          <p className="recipe-notice" role="status">
            {notice}
          </p>
        ) : null}

        {stepBlocker ? (
          <p className="recipe-wizard__hint" role="status">
            {stepBlocker}
          </p>
        ) : null}
      </section>

      <div className="recipe-wizard__dock">
        <footer className="recipe-wizard__footer">
          <button
            type="button"
            className="recipe-wizard__nav recipe-wizard__nav--back"
            disabled={stepIndex === 0}
            onClick={goBack}
          >
            ← Atrás
          </button>

          {isReviewStep ? (
            <button
              type="button"
              className={`recipe-generate recipe-wizard__nav recipe-wizard__nav--next${canGenerate ? " recipe-generate--ready" : ""}`}
              disabled={!canGenerate}
              onClick={() =>
                flashNotice("La generación con IA llega en la siguiente fase ✨")
              }
            >
              {canGenerate ? "✨ Crear mi cuento" : blocker}
            </button>
          ) : (
            <button
              type="button"
              className="recipe-wizard__nav recipe-wizard__nav--next"
              disabled={
                !isExtrasStep &&
                !currentStep.optional &&
                Boolean(stepBlocker)
              }
              onClick={goNext}
            >
              {isExtrasStep || (currentStep.optional && stepBlocker)
                ? "Omitir y continuar →"
                : "Siguiente →"}
            </button>
          )}
        </footer>
      </div>

      {!isReviewStep ? (
        <p className="crear-footnote mt-2 text-center text-xs">
          Paso {stepIndex + 1} de {wizardSteps.length}
          {isLastStep ? "" : " · la IA escribe en el último paso"}
        </p>
      ) : (
        <p className="crear-footnote mt-2 text-center text-xs">
          La IA escribe pronto · hoy puedes armar y guardar la receta.
        </p>
      )}
    </div>
  );
}

function stepLabelShort(step: RecipeWizardStep): string {
  if (step.id === "heroes") return "Héroes";
  if (step.id === "reto") return "Reto";
  if (step.id === "aprenden") return "Lección";
  if (step.id === "lugar") return "Lugar";
  if (step.id === "molde") return "Clásico";
  if (step.id === "extras") return "Extras";
  return "Revisar";
}

function RecipeRecap({
  selection,
  steps,
}: {
  selection: RecipeSelectionSlice;
  steps: RecipeWizardStep[];
}) {
  const coreSteps = steps.filter(
    (s) => s.zoneKey && s.id !== "molde" && s.id !== "extras" && s.id !== "review",
  );

  return (
    <ul className="recipe-recap" aria-label="Resumen de elecciones">
      {coreSteps.map((step) => {
        if (!step.zoneKey) return null;
        const items = selection[step.zoneKey];
        return (
          <li key={step.id} className="recipe-recap__item">
            <span className="recipe-recap__label">{stepLabelShort(step)}</span>
            <span className="recipe-recap__value">
              {items.length > 0
                ? items.map((i) => i.label).join(", ")
                : "—"}
            </span>
          </li>
        );
      })}
      {selection.molde[0] ? (
        <li className="recipe-recap__item">
          <span className="recipe-recap__label">Clásico</span>
          <span className="recipe-recap__value">{selection.molde[0].label}</span>
        </li>
      ) : null}
    </ul>
  );
}
