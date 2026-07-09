"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  RecipeCategory,
  RecipeIngredient,
  RecipeIngredients,
} from "@/lib/story-recipe";
import { EMOCIONES_MAX, HEROES_MAX } from "@/lib/story-recipe";

type Props = {
  ingredients: RecipeIngredients;
  profileSource: "user" | "demo";
};

type DropZoneProps = {
  title: string;
  hint: string;
  category: RecipeCategory;
  items: RecipeIngredient[];
  empty: string;
  activeDrag: RecipeCategory | null;
  onDropIngredient: (category: RecipeCategory, id: string) => void;
  onRemove: (category: RecipeCategory, id: string) => void;
};

function DropZone({
  title,
  hint,
  category,
  items,
  empty,
  activeDrag,
  onDropIngredient,
  onRemove,
}: DropZoneProps) {
  const [over, setOver] = useState(false);
  const isTarget = activeDrag === category;

  return (
    <div
      className={`recipe-zone${isTarget ? " recipe-zone--target" : ""}${over ? " recipe-zone--over" : ""}`}
      onDragOver={(e) => {
        if (activeDrag !== category) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDropIngredient(category, id);
      }}
    >
      <div className="recipe-zone__head">
        <span className="recipe-zone__title">{title}</span>
        <span className="recipe-zone__hint">{hint}</span>
      </div>
      <div className="recipe-zone__slots">
        {items.length === 0 ? (
          <span className="recipe-zone__empty">{empty}</span>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="recipe-token"
              onClick={() => onRemove(category, item.id)}
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
  );
}

type PaletteProps = {
  title: string;
  category: RecipeCategory;
  options: RecipeIngredient[];
  isSelected: (category: RecipeCategory, id: string) => boolean;
  onToggle: (category: RecipeCategory, id: string) => void;
  onDragStart: (category: RecipeCategory) => void;
  onDragEnd: () => void;
};

function Palette({
  title,
  category,
  options,
  isSelected,
  onToggle,
  onDragStart,
  onDragEnd,
}: PaletteProps) {
  if (options.length === 0) return null;
  return (
    <div className="recipe-palette">
      <p className="recipe-palette__title">{title}</p>
      <div className="recipe-palette__chips">
        {options.map((opt) => {
          const selected = isSelected(category, opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              draggable
              className={`recipe-chip${selected ? " recipe-chip--selected" : ""}`}
              onClick={() => onToggle(category, opt.id)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", opt.id);
                e.dataTransfer.effectAllowed = "copy";
                onDragStart(category);
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

export default function StoryRecipeBuilder({
  ingredients,
  profileSource,
}: Props) {
  const findIn = useCallback(
    (list: RecipeIngredient[], id: string) =>
      list.find((item) => item.id === id) ?? null,
    [],
  );

  const [heroes, setHeroes] = useState<RecipeIngredient[]>(() =>
    ingredients.personajes.slice(0, 1),
  );
  const [mascota, setMascota] = useState<RecipeIngredient | null>(
    () => ingredients.mascotas[0] ?? null,
  );
  const [emociones, setEmociones] = useState<RecipeIngredient[]>(() =>
    ingredients.emociones.filter((e) => e.id === "emo-responsabilidad"),
  );
  const [dilema, setDilema] = useState<RecipeIngredient | null>(
    () => ingredients.dilemas.find((d) => d.id === "dil-dormir") ?? null,
  );
  const [activeDrag, setActiveDrag] = useState<RecipeCategory | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const add = useCallback(
    (category: RecipeCategory, id: string) => {
      if (category === "personaje") {
        const ing = findIn(ingredients.personajes, id);
        if (!ing) return;
        setHeroes((prev) => {
          if (prev.some((p) => p.id === id)) return prev;
          if (prev.length >= HEROES_MAX) {
            flashNotice(`Máximo ${HEROES_MAX} héroes por cuento.`);
            return prev;
          }
          return [...prev, ing];
        });
      } else if (category === "mascota") {
        setMascota(findIn(ingredients.mascotas, id));
      } else if (category === "emocion") {
        const ing = findIn(ingredients.emociones, id);
        if (!ing) return;
        setEmociones((prev) => {
          if (prev.some((p) => p.id === id)) return prev;
          if (prev.length >= EMOCIONES_MAX) {
            flashNotice(`Máximo ${EMOCIONES_MAX} lecciones.`);
            return prev;
          }
          return [...prev, ing];
        });
      } else if (category === "dilema") {
        setDilema(findIn(ingredients.dilemas, id));
      }
    },
    [findIn, flashNotice, ingredients],
  );

  const remove = useCallback((category: RecipeCategory, id: string) => {
    if (category === "personaje") {
      setHeroes((prev) => prev.filter((p) => p.id !== id));
    } else if (category === "mascota") {
      setMascota(null);
    } else if (category === "emocion") {
      setEmociones((prev) => prev.filter((p) => p.id !== id));
    } else if (category === "dilema") {
      setDilema(null);
    }
  }, []);

  const isSelected = useCallback(
    (category: RecipeCategory, id: string) => {
      if (category === "personaje") return heroes.some((h) => h.id === id);
      if (category === "mascota") return mascota?.id === id;
      if (category === "emocion") return emociones.some((e) => e.id === id);
      if (category === "dilema") return dilema?.id === id;
      return false;
    },
    [heroes, mascota, emociones, dilema],
  );

  const toggle = useCallback(
    (category: RecipeCategory, id: string) => {
      if (isSelected(category, id)) remove(category, id);
      else add(category, id);
    },
    [add, isSelected, remove],
  );

  const summary = useMemo(() => {
    if (heroes.length === 0 || !dilema) return null;
    const names =
      heroes.length === 1
        ? heroes[0].label
        : `${heroes.slice(0, -1).map((h) => h.label).join(", ")} y ${heroes[heroes.length - 1].label}`;
    const withPet = mascota ? ` junto a ${mascota.label}` : "";
    const lesson =
      emociones.length > 0
        ? ` aprendiendo sobre ${emociones.map((e) => e.label.toLowerCase()).join(" y ")}`
        : "";
    return `Un cuento donde ${names}${withPet} enfrentan ${dilema.label.toLowerCase()}${lesson}.`;
  }, [heroes, mascota, emociones, dilema]);

  const canGenerate = heroes.length > 0 && dilema !== null;

  return (
    <div className="recipe-builder">
      {profileSource === "demo" ? (
        <p className="crear-banner crear-banner--info">
          Estás viendo la familia demo Chacachón. Entra y completa tu perfil para
          arrastrar a tu propia familia.
        </p>
      ) : null}

      <section className="recipe-board" aria-label="Receta del cuento">
        <DropZone
          title="Héroes"
          hint={`Arrastra o toca · hasta ${HEROES_MAX}`}
          category="personaje"
          items={heroes}
          empty="¿Quiénes protagonizan?"
          activeDrag={activeDrag}
          onDropIngredient={add}
          onRemove={remove}
        />
        <DropZone
          title="Mascota"
          hint="Opcional · 1"
          category="mascota"
          items={mascota ? [mascota] : []}
          empty="¿Aparece alguna mascota?"
          activeDrag={activeDrag}
          onDropIngredient={add}
          onRemove={remove}
        />
        <DropZone
          title="Qué aprenden"
          hint={`Hasta ${EMOCIONES_MAX}`}
          category="emocion"
          items={emociones}
          empty="Elige una lección"
          activeDrag={activeDrag}
          onDropIngredient={add}
          onRemove={remove}
        />
        <DropZone
          title="El reto"
          hint="1 dilema"
          category="dilema"
          items={dilema ? [dilema] : []}
          empty="¿Qué problema resuelven?"
          activeDrag={activeDrag}
          onDropIngredient={add}
          onRemove={remove}
        />
      </section>

      {notice ? (
        <p className="recipe-notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="recipe-palettes">
        <Palette
          title="👨‍👩‍👧 Tu familia"
          category="personaje"
          options={ingredients.personajes}
          isSelected={isSelected}
          onToggle={toggle}
          onDragStart={setActiveDrag}
          onDragEnd={() => setActiveDrag(null)}
        />
        <Palette
          title="🐶 Mascotas"
          category="mascota"
          options={ingredients.mascotas}
          isSelected={isSelected}
          onToggle={toggle}
          onDragStart={setActiveDrag}
          onDragEnd={() => setActiveDrag(null)}
        />
        <Palette
          title="💛 Emociones y lecciones"
          category="emocion"
          options={ingredients.emociones}
          isSelected={isSelected}
          onToggle={toggle}
          onDragStart={setActiveDrag}
          onDragEnd={() => setActiveDrag(null)}
        />
        <Palette
          title="🎯 El reto"
          category="dilema"
          options={ingredients.dilemas}
          isSelected={isSelected}
          onToggle={toggle}
          onDragStart={setActiveDrag}
          onDragEnd={() => setActiveDrag(null)}
        />
      </div>

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
