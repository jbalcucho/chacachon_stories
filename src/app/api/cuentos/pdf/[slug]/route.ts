import { NextResponse } from "next/server";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { hasPersonalizedReader } from "@/lib/story-content-index";
import { buildStoryPdf, pdfFileNameFromTitle } from "@/lib/story-pdf.server";
import { loadPersonalizedStory } from "@/lib/story-reader";

/** Descarga en PDF del catálogo -- solo usuarios registrados (incentivo de
 * registro post-trial, ver docs/plan-mejoras-competitivas.md Fase C1.1). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { message: "Entra con Google para descargar el PDF." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  if (!hasPersonalizedReader(slug)) {
    return NextResponse.json({ message: "Cuento no encontrado" }, { status: 404 });
  }

  const { perfil } = await getReaderProfile(userId);
  const content = await loadPersonalizedStory(slug, perfil);
  if (!content) {
    return NextResponse.json({ message: "Cuento no encontrado" }, { status: 404 });
  }

  const childName = perfil.ninos[0]?.apodo?.trim() || null;
  const pdf = await buildStoryPdf(content, { childName });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFileNameFromTitle(content.title)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
