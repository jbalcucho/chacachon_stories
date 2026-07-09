import type { StoryCard } from "@/lib/stories";
import {
  bookGlowStyle,
  getBookTheme,
  spineTitle,
} from "@/lib/book-theme";

type Props = {
  story: StoryCard;
  onClick: () => void;
  narrow?: boolean;
};

export default function BookSpine({ story, onClick, narrow = false }: Props) {
  const theme = getBookTheme(story);

  return (
    <button
      type="button"
      className={`book-spine-stack__item book-spine-stack__item--${theme.id}${narrow ? " book-spine-stack__item--narrow" : ""}`}
      style={bookGlowStyle(theme)}
      onClick={onClick}
      aria-label={`Elegir ${story.title}`}
      title={story.title}
    >
      <span
        className={`book-spine-stack__spine bg-gradient-to-b ${theme.spine}`}
      >
        <span className="book-spine-stack__ridge" aria-hidden="true" />
        <span className="book-spine-stack__pages" aria-hidden="true" />
        <span className="book-spine-stack__text">{spineTitle(story.title)}</span>
      </span>
    </button>
  );
}
