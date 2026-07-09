import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import { getGeneratedStory } from "@/lib/generated-stories.server";
import type { PersonalizedStoryContent } from "@/lib/story-reader";
import { parseBodyBlocks, parseStoryHeader } from "@/lib/story-markdown";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await getGeneratedStory(id);
  return {
    title: story?.title ?? "Cuento",
    robots: { index: false, follow: false },
  };
}

function toContent(markdown: string): PersonalizedStoryContent {
  const parsed = parseStoryHeader(markdown);
  return {
    title: parsed.title,
    subtitle: parsed.subtitle,
    blocks: parseBodyBlocks(parsed.body),
  };
}

export default async function LeerGeneradoPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getGeneratedStory(id);
  if (!story) notFound();

  const content = toContent(story.bodyMarkdown);

  return (
    <StoryReader
      content={content}
      profileSource={story.userId ? "user" : "demo"}
      storyTitle={content.title}
      storySlug={`generado/${id}`}
    />
  );
}
