import { NextResponse } from "next/server";
import {
  recipeSelectionSchema,
  selectionMissingRequired,
  toSelectionSlice,
} from "@/lib/recipe-selection";
import { saveGeneratedStory } from "@/lib/generated-stories.server";
import { getSessionUserId } from "@/lib/session";
import { generateStory } from "@/lib/story-generation.server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = recipeSelectionSchema.safeParse(
    (body as { selection?: unknown })?.selection ?? body,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Receta inválida", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const missing = selectionMissingRequired(parsed.data);
  if (missing) {
    return NextResponse.json({ message: missing }, { status: 400 });
  }

  try {
    const userId = await getSessionUserId();
    const slice = toSelectionSlice(parsed.data);
    const draft = await generateStory(slice);
    const id = await saveGeneratedStory({
      ...draft,
      userId,
      recipe: parsed.data,
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
