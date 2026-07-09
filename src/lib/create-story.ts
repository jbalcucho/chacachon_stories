import type { StoryCard } from "@/lib/stories";

export const CREATE_STORY_SLUG = "crear-cuento";

/** Tarjeta virtual del carrusel: abre el hub de creación con IA. */
export const CREATE_STORY_CARD: StoryCard = {
  slug: CREATE_STORY_SLUG,
  title: "Cuento nuevo",
  description: "Crea un cuento con IA y los nombres de tu familia.",
  moraleja: "Humor rolo y tu casa en cada página",
  familyTag: "chacachon",
  htmlPath: null,
  openPath: "/crear",
  variant: "PILOT",
  status: "PUBLISHED",
};

export function isCreateStoryCard(story: { slug: string }): boolean {
  return story.slug === CREATE_STORY_SLUG;
}

export function withCreateStorySlot(stories: StoryCard[]): StoryCard[] {
  if (stories.some((s) => s.slug === CREATE_STORY_SLUG)) return stories;
  return [...stories, CREATE_STORY_CARD];
}
