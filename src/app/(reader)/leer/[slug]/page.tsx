import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { loadPersonalizedStory } from "@/lib/story-reader";
import { buildCatalogStoryMetadata } from "@/lib/story-share";
import { getPublishedStoryBySlug } from "@/lib/stories";
import { hasPersonalizedReader } from "@/lib/story-content-index";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!hasPersonalizedReader(slug)) return { title: "Cuento" };

  const story = await getPublishedStoryBySlug(slug);
  return buildCatalogStoryMetadata(
    slug,
    story?.title ?? "Cuento",
    story?.description,
  );
}

export default async function LeerPage({ params }: PageProps) {
  const { slug } = await params;

  if (!hasPersonalizedReader(slug)) notFound();

  const story = await getPublishedStoryBySlug(slug);
  if (!story) notFound();

  const userId = await getSessionUserId();
  const { perfil, source } = await getReaderProfile(userId);
  const content = await loadPersonalizedStory(slug, perfil);
  if (!content) notFound();

  return (
    <StoryReader
      content={content}
      profileSource={source}
      storyTitle={story.title}
      storySlug={slug}
      shareable
      loginCallbackUrl={`/leer/${slug}`}
    />
  );
}
