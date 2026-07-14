import { NextResponse } from "next/server";
import { saveGeneratedStory } from "@/lib/generated-stories.server";
import { guardImportTrialStoryRequest } from "@/lib/import-trial-story-guards";
import { getSessionUserId } from "@/lib/session";
import { parseStoryHeader } from "@/lib/story-markdown";
import type { RecipeSelectionPayload } from "@/lib/recipe-selection";

export const runtime = "nodejs";

/** Importa el cuento del trial anónimo (/probar) a la cuenta tras login (Fase 3). */
export async function POST(request: Request) {
  const userId = await getSessionUserId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const guard = guardImportTrialStoryRequest({ userId, body });
  if (!guard.ok) {
    return NextResponse.json({ message: guard.message }, { status: guard.status });
  }

  const { markdown, name, path, ageBandId, momentId, classicId, source } =
    guard.data;
  const parsed = parseStoryHeader(markdown);
  const title = parsed.title && parsed.title !== "Cuento" ? parsed.title : "Cuento de prueba";

  const id = await saveGeneratedStory({
    userId,
    title,
    bodyMarkdown: markdown,
    source: source ?? "mock",
    model: null,
    usage: null,
    recipe: {
      kind: "trial-import",
      name: name ?? null,
      path: path ?? null,
      ageBandId: ageBandId ?? null,
      momentId: momentId ?? null,
      classicId: classicId ?? null,
    } as unknown as RecipeSelectionPayload,
  });

  return NextResponse.json({ id });
}
