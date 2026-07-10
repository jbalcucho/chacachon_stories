import type { StoryCard } from "@/lib/stories";
import {
  bookGlowStyle,
  getBookTheme,
  isStorySoon,
} from "@/lib/book-theme";
import { isCreateStoryCard } from "@/lib/create-story";

type Props = {
  story: StoryCard;
  featured?: boolean;
  entering?: boolean;
  leaving?: boolean;
  onClick?: () => void;
};

export default function StoryBook({
  story,
  featured,
  entering,
  leaving,
  onClick,
}: Props) {
  const isSoon = isStorySoon(story.status, story.openPath);
  const isCreate = isCreateStoryCard(story);
  const theme = getBookTheme(story);

  const bookInner = (
    <>
      <div
        className={`book-spine bg-gradient-to-b ${theme.spine}${featured ? " book-spine--shelf" : ""}`}
        aria-hidden="true"
      >
        {featured ? (
          <>
            <span className="book-spine__ridge" aria-hidden="true" />
            <span className="book-spine__pages" aria-hidden="true" />
          </>
        ) : (
          <span className="book-spine-text">
            {story.title.split(/\s+/).slice(0, 2).join(" ")}
          </span>
        )}
      </div>
      <div
        className={`book-cover bg-gradient-to-br ${theme.cover} ring-1`}
      >
        <div className="book-cover-top">
          <span className="book-emoji" aria-hidden="true">
            {theme.emoji}
          </span>
          {isCreate ? (
            <span className="book-badge book-badge--create">IA ✨</span>
          ) : null}
        </div>
        <h2 className="book-title">{story.title}</h2>
      </div>
    </>
  );

  if (featured && onClick) {
    return (
      <button
        type="button"
        className={`book book--featured book--theme-${theme.id}${isCreate ? " book--create" : ""}${isSoon ? " book--soon" : ""}${entering ? " book--entering" : ""}${leaving ? " book--leaving" : ""}`}
        style={bookGlowStyle(theme)}
        onClick={onClick}
        aria-current="true"
        aria-label={`${story.title}, libro activo`}
      >
        {bookInner}
      </button>
    );
  }

  if (isSoon) {
    return (
      <div
        className={`book book--soon book--theme-${theme.id}`}
        style={bookGlowStyle(theme)}
        aria-disabled="true"
      >
        {bookInner}
      </div>
    );
  }

  return null;
}
