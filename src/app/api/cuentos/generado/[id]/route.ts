import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteGeneratedStory,
  getGeneratedStory,
  setGeneratedStoryHidden,
  updateGeneratedStory,
} from "@/lib/generated-stories.server";
import { getSessionUser } from "@/lib/session";
import { sanitizeFairyTaleBookends } from "@/lib/story-markdown";
import { analyzeStoryMarkdown } from "@/lib/story-quality";

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  bodyMarkdown: z.string().trim().min(1).max(20_000).optional(),
  hidden: z.boolean().optional(),
});

/**
 * El dueño edita el texto de su propio cuento y/o lo oculta/reactiva.
 * Es un cuento privado, no compartible (ver story-share.ts) -- el gate
 * semántico (pago, 7-9s) no corre aquí; solo el gate de regex (gratis,
 * instantáneo) como aviso no bloqueante para no romper sin querer la
 * estructura que necesita el paginador del lector.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const story = await getGeneratedStory(id);
  if (!story || story.userId !== user.id) {
    return NextResponse.json({ message: "Cuento no encontrado" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos inválidos", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, bodyMarkdown, hidden } = parsed.data;
  let hints: string[] = [];

  if (title !== undefined || bodyMarkdown !== undefined) {
    const cleanBody =
      bodyMarkdown !== undefined
        ? sanitizeFairyTaleBookends(bodyMarkdown)
        : undefined;
    const ok = await updateGeneratedStory(id, user.id, {
      title,
      bodyMarkdown: cleanBody,
    });
    if (!ok) {
      return NextResponse.json({ message: "No se pudo guardar" }, { status: 500 });
    }
    if (cleanBody) {
      // El guardado ya sucedió -- si el análisis de calidad falla por
      // cualquier razón, nunca debe convertir un guardado exitoso en un
      // 500 para el usuario. Los "hints" son solo un aviso, no un gate.
      try {
        const report = analyzeStoryMarkdown(cleanBody, { heroName: null });
        hints = report.findings
          .filter((f) => f.severity !== "info")
          .map((f) => f.message);
      } catch (error) {
        console.error("[api/cuentos/generado] análisis de calidad falló:", error);
      }
    }
  }

  if (hidden !== undefined) {
    const ok = await setGeneratedStoryHidden(id, user.id, hidden);
    if (!ok) {
      return NextResponse.json({ message: "No se pudo guardar" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, hints });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteGeneratedStory(id, user.id);
  if (!deleted) {
    return NextResponse.json({ message: "Cuento no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
