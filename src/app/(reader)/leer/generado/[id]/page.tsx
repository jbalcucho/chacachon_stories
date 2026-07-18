import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import {
  canReadGeneratedStory,
  getGeneratedStory,
} from "@/lib/generated-stories.server";
import { generatedStoryMarkdownToContent } from "@/lib/story-reader";
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

  const content = generatedStoryMarkdownToContent(story.bodyMarkdown);

  return (
    <StoryReader
      content={content}
      profileSource="user"
      storyTitle={content.title}
      storySlug={`generado/${id}`}
      backHref="/mis-cuentos"
      backLabel="Mis cuentos"
      pdfHref={`/api/cuentos/pdf/generado/${id}`}
    />
  );
}
