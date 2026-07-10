import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import {
  canReadGeneratedStory,
  getGeneratedStory,
} from "@/lib/generated-stories.server";
import type { PersonalizedStoryContent } from "@/lib/story-reader";
import {
  parseBodyBlocks,
  parseStoryHeader,
  splitBlocksForPagination,
} from "@/lib/story-markdown";
import { getSessionUserId } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const userId = await getSessionUserId();
  const story = await getGeneratedStory(id);
  const readable = story && canReadGeneratedStory(story, userId);
  return {
    title: readable ? story.title : "Cuento",
    robots: { index: false, follow: false },
  };
}

function toContent(markdown: string): PersonalizedStoryContent {
  const parsed = parseStoryHeader(markdown);
  return {
    title: parsed.title,
    subtitle: null,
    blocks: splitBlocksForPagination(parseBodyBlocks(parsed.body)),
  };
}

export default async function LeerGeneradoPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await getSessionUserId();
  const story = await getGeneratedStory(id);
  if (!story) notFound();

  if (!canReadGeneratedStory(story, userId)) {
    if (!userId && story.userId) {
      redirect(
        `/login?callbackUrl=${encodeURIComponent(`/leer/generado/${id}`)}`,
      );
    }
    notFound();
  }

  const content = toContent(story.bodyMarkdown);

  return (
    <StoryReader
      content={content}
      profileSource="user"
      storyTitle={content.title}
      storySlug={`generado/${id}`}
      backHref="/mis-cuentos"
      backLabel="Mis cuentos"
    />
  );
}
