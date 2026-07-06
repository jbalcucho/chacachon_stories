import Link from "next/link";
import type { StoryCard } from "@/lib/stories";
import { variantLabel } from "@/lib/stories";

const variantIcon: Record<string, string> = {
  NARRATIVE: "🌲",
  APARTMENT: "🏢",
  PILOT: "🚀",
};

const variantBadgeClass: Record<string, string> = {
  NARRATIVE: "bg-forest/20 text-forest-soft",
  APARTMENT: "bg-coral/20 text-coral-soft",
  PILOT: "bg-violet/20 text-violet-soft",
};

type Props = {
  story: StoryCard;
};

export default function StoryCardLink({ story }: Props) {
  const isSoon = story.status !== "PUBLISHED" || !story.htmlPath;
  const icon = variantIcon[story.variant] ?? "📖";
  const badgeClass =
    variantBadgeClass[story.variant] ?? "bg-white/10 text-night-soft";

  if (isSoon) {
    return (
      <article className="flex flex-col rounded-[1.25rem] border border-white/7 bg-night-card p-5 opacity-75 shadow-night">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="text-3xl" aria-hidden="true">
            {icon}
          </span>
          <span className="rounded-md bg-white/8 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-night-soft">
            Próximamente
          </span>
        </div>
        <h2 className="text-lg font-bold text-white">{story.title}</h2>
        {story.moraleja ? (
          <p className="mt-2 text-sm italic text-gold">{story.moraleja}</p>
        ) : null}
        {story.description ? (
          <p className="mt-3 flex-grow font-serif text-sm leading-relaxed text-night-soft">
            {story.description}
          </p>
        ) : null}
        <span className="mt-4 text-sm font-bold text-night-soft">
          En preparación
        </span>
      </article>
    );
  }

  return (
    <Link
      href={story.htmlPath!}
      className="group flex flex-col rounded-[1.25rem] border border-white/7 bg-night-card p-5 shadow-night transition hover:-translate-y-0.5 hover:border-gold/25 hover:bg-night-card-hover"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
        <span
          className={`rounded-md px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${badgeClass}`}
        >
          {variantLabel(story.variant)}
        </span>
      </div>
      <h2 className="text-lg font-bold text-white">{story.title}</h2>
      {story.moraleja ? (
        <p className="mt-2 text-sm italic text-gold">{story.moraleja}</p>
      ) : null}
      {story.description ? (
        <p className="mt-3 flex-grow font-serif text-sm leading-relaxed text-night-soft">
          {story.description}
        </p>
      ) : null}
      <span className="mt-4 text-sm font-bold text-coral-soft transition group-hover:text-gold-soft">
        Leer cuento →
      </span>
    </Link>
  );
}
