"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  RecipeIngredient,
  RecipeIngredients,
  RecipeKind,
} from "@/lib/story-recipe";

type Props = {
  ingredients: RecipeIngredients;
  profileSource: "user" | "demo";
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
    hint: "Toca o arrastra · hasta 3",
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

type Selection = Record<ZoneKey, RecipeIngredient[]>;

type ZoneBlockProps = {
  config: ZoneConfig;
  ingredients: RecipeIngredients;
  selection: RecipeIngredient[];
  activeKind: RecipeKind | null;
  onToggle: (zone: ZoneKey, ing: RecipeIngredient) => void;
  onRemove: (zone: ZoneKey, id: string) => void;
  onDropIngredient: (zone: ZoneKey, id: string) => void;
  onDragStart: (kind: RecipeKind) => void;
  onDragEnd: () => void;
};

function ZoneBlock({
  config,
  ingredients,
  selection,
  activeKind,
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
                className="recipe-token"
                onClick={() => onRemove(config.key, item.id)}
                aria-label={`Quitar ${item.label}`}
              >
                <span aria-hidden="true">{item.emoji}</span>
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
              draggable
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
              <span aria-hidden="true">{opt.emoji}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function joinNames(items: RecipeIngredient[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

export default function StoryRecipeBuilder({
  ingredients,
  profileSource,
}: Props) {
  const [selection, setSelection] = useState<Selection>(() => ({
    heroes: ingredients.personas.slice(0, 1),
    reto: ingredients.dilemas.filter((d) => d.id === "dil-dormir"),
    aprenden: ingredients.emociones.filter((e) => e.id === "emo-responsabilidad"),
    lugar: ingredients.lugares.filter((l) => l.id === "lug-apartamento"),
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
  }));
  const [activeKind, setActiveKind] = useState<RecipeKind | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const toggle = useCallback(
    (zone: ZoneKey, ing: RecipeIngredient) => {
      setSelection((prev) => {
        const current = prev[zone];
        if (current.some((i) => i.id === ing.id)) {
          return { ...prev, [zone]: current.filter((i) => i.id !== ing.id) };
        }
        if (current.length >= zoneMax[zone].max) {
          flashNotice(`Máximo ${zoneMax[zone].max} en “${zoneMax[zone].title}”.`);
          return prev;
        }
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [flashNotice, zoneMax],
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
        if (current.some((i) => i.id === id)) return prev;
        if (current.length >= zoneMax[zone].max) {
          flashNotice(`Máximo ${zoneMax[zone].max} en “${zoneMax[zone].title}”.`);
          return prev;
        }
        return { ...prev, [zone]: [...current, ing] };
      });
    },
    [allById, flashNotice, zoneMax],
  );

  const summary = useMemo(() => {
    const heroes = selection.heroes;
    const reto = selection.reto[0];
    if (heroes.length === 0 || !reto) return null;

    const names = joinNames(heroes);
    const companions =
      selection.acompanantes.length > 0
        ? ` junto a ${joinNames(selection.acompanantes)}`
        : selection.mascota.length > 0
          ? ` junto a ${selection.mascota[0].label}`
          : "";
    const place = selection.lugar[0] ? ` en ${selection.lugar[0].label.toLowerCase()}` : "";
    const lesson =
      selection.aprenden.length > 0
        ? ` aprendiendo sobre ${selection.aprenden.map((e) => e.label.toLowerCase()).join(" y ")}`
        : "";
    const villain = selection.rolReto[0]
      ? `, con ${selection.rolReto[0].label} en el papel del reto`
      : "";
    const mold = selection.molde[0]
      ? ` Inspirado en ${selection.molde[0].label}.`
      : "";

    return `Un cuento donde ${names}${companions} enfrentan ${reto.label.toLowerCase()}${place}${lesson}${villain}.${mold}`;
  }, [selection]);

  const canGenerate = selection.heroes.length > 0 && selection.reto.length > 0;

  const coreZones = ZONES.filter((z) => z.core);
  const optionalZones = ZONES.filter((z) => !z.core);

  return (
    <div className="recipe-builder">
      {profileSource === "demo" ? (
        <p className="crear-banner crear-banner--info">
          Estás viendo la familia demo Chacachón. Entra y completa tu perfil para
          arrastrar a tu propia familia.
        </p>
      ) : null}

      <div className="recipe-board">
        {coreZones.map((zone) => (
          <ZoneBlock
            key={zone.key}
            config={zone}
            ingredients={ingredients}
            selection={selection[zone.key]}
            activeKind={activeKind}
            onToggle={toggle}
            onRemove={remove}
            onDropIngredient={dropIngredient}
            onDragStart={setActiveKind}
            onDragEnd={() => setActiveKind(null)}
          />
        ))}
      </div>

      <button
        type="button"
        className="recipe-more"
        onClick={() => setShowMore((v) => !v)}
        aria-expanded={showMore}
      >
        {showMore ? "− Menos opciones" : "➕ Agregar más (mascota, lugar de reto, objeto, molde…)"}
      </button>

      {showMore ? (
        <div className="recipe-board recipe-board--optional">
          {optionalZones.map((zone) => (
            <ZoneBlock
              key={zone.key}
              config={zone}
              ingredients={ingredients}
              selection={selection[zone.key]}
              activeKind={activeKind}
              onToggle={toggle}
              onRemove={remove}
              onDropIngredient={dropIngredient}
              onDragStart={setActiveKind}
              onDragEnd={() => setActiveKind(null)}
            />
          ))}
        </div>
      ) : null}

      {notice ? (
        <p className="recipe-notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="recipe-summary">
        <p className="recipe-summary__label">Tu cuento</p>
        <p className="recipe-summary__text">
          {summary ?? "Agrega al menos un héroe y un reto para ver la idea."}
        </p>
      </div>

      <button
        type="button"
        className="recipe-generate"
        disabled={!canGenerate}
        onClick={() =>
          flashNotice("La generación con IA llega en la siguiente fase ✨")
        }
      >
        ✨ Crear mi cuento
      </button>
      <p className="crear-footnote mt-3 text-center text-xs">
        Vista previa de la interacción · la IA aún no está conectada.
      </p>
    </div>
  );
}
