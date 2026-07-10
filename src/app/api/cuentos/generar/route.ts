import { NextResponse } from "next/server";
import {
  generateStoryRequestSchema,
  selectionMissingRequired,
  toSelectionSlice,
} from "@/lib/recipe-selection";
import { saveGeneratedStory } from "@/lib/generated-stories.server";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUserId } from "@/lib/session";
import { generateStory } from "@/lib/story-generation.server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const raw = body as { selection?: unknown; accentCode?: unknown };
  const parsed = generateStoryRequestSchema.safeParse({
    selection: raw?.selection ?? body,
    accentCode: raw?.accentCode,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Receta inválida", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const missing = selectionMissingRequired(parsed.data.selection);
  if (missing) {
    return NextResponse.json({ message: missing }, { status: 400 });
  }

  try {
    const userId = await getSessionUserId();
    const slice = toSelectionSlice(parsed.data.selection);
    const { perfil } = await getReaderProfile(userId);
    const draft = await generateStory({
      selection: slice,
      perfil,
      accentCode: parsed.data.accentCode,
    });
    const id = await saveGeneratedStory({
      ...draft,
      userId,
      recipe: parsed.data.selection,
    });

    return NextResponse.json({ id, source: draft.source });
  } catch (error) {
    console.error("[api/cuentos/generar] error:", error);
    return NextResponse.json(
      { message: "No pudimos crear el cuento. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
