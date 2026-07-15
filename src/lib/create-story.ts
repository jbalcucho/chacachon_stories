export const CREATE_STORY_SLUG = "crear-cuento";

export function isCreateStoryCard(story: { slug: string }): boolean {
  return story.slug === CREATE_STORY_SLUG;
}
