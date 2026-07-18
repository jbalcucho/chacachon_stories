import { NextResponse } from "next/server";
import {
  canReadGeneratedStory,
  getGeneratedStory,
} from "@/lib/generated-stories.server";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { generatedStoryMarkdownToContent } from "@/lib/story-reader";
import { buildStoryPdf, pdfFileNameFromTitle } from "@/lib/story-pdf.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  const story = await getGeneratedStory(id);

  if (!story || !canReadGeneratedStory(story, userId)) {
    return NextResponse.json({ message: "Cuento no encontrado" }, { status: 404 });
  }

  const content = generatedStoryMarkdownToContent(story.bodyMarkdown);
  const childName = userId
    ? (await getReaderProfile(userId)).perfil.ninos[0]?.apodo?.trim() || null
    : null;

  const pdf = await buildStoryPdf(content, { childName });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFileNameFromTitle(content.title)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
