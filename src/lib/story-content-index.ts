import storyManifest from "@/data/story-content-manifest.json";

export type StoryContentKind = "template" | "markdown";

export type StoryContentSource = {
  slug: string;
  kind: StoryContentKind;
  filePath: string;
  familyTag?: string;
};

type StoryOpenPathInput = {
  slug: string;
  status: string;
  htmlPath: string | null;
};

type StoryWithOpenPath<T extends StoryOpenPathInput> = T & {
  openPath: string | null;
};

const sources = storyManifest.sources as Record<string, StoryContentSource>;

export function hasPersonalizedReader(slug: string): boolean {
  return slug in sources;
}

export function getStoryContentSource(
  slug: string,
): StoryContentSource | null {
  return sources[slug] ?? null;
}

export function listPersonalizedReaderSlugs(): string[] {
  return Object.keys(sources);
}

/** Ruta de apertura: lector dinámico si hay fuente, si no HTML estático. */
export function resolveStoryOpenPath(story: StoryOpenPathInput): string | null {
  if (story.status !== "PUBLISHED") return null;
  if (hasPersonalizedReader(story.slug)) return `/leer/${story.slug}`;
  return story.htmlPath;
}

export function withOpenPath<T extends StoryOpenPathInput>(
  story: T,
): StoryWithOpenPath<T> {
  return { ...story, openPath: resolveStoryOpenPath(story) };
}

export function withOpenPaths<T extends StoryOpenPathInput>(
  stories: T[],
): StoryWithOpenPath<T>[] {
  return stories.map(withOpenPath);
}
