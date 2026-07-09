import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { loadPersonalizedStory } from "@/lib/story-reader";
import { getPublishedStoryBySlug } from "@/lib/stories";
import { hasPersonalizedReader } from "@/lib/story-content-index";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!hasPersonalizedReader(slug)) return { title: "Cuento" };

  const story = await getPublishedStoryBySlug(slug);
  const title = story?.title ?? "Cuento";
  const description = story?.description ?? undefined;
  const url = `/leer/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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
    />
  );
}
