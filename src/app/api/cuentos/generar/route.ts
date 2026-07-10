import { NextResponse } from "next/server";
import { moderateRecipeSelection } from "@/lib/content-moderation";
import { saveGeneratedStory } from "@/lib/generated-stories.server";
import {
  GenerationLimitError,
  assertGenerationAllowed,
} from "@/lib/generation-limits";
import {
  generateStoryRequestSchema,
  selectionMissingRequired,
  toSelectionSlice,
} from "@/lib/recipe-selection";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUser } from "@/lib/session";
import { generateStory } from "@/lib/story-generation.server";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { message: "Entra con Google para crear tu cuento." },
      { status: 401 },
    );
  }

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

  const moderation = moderateRecipeSelection(parsed.data.selection);
  if (moderation) {
    return NextResponse.json({ message: moderation }, { status: 400 });
  }

  try {
    await assertGenerationAllowed(user.id);
  } catch (error) {
    if (error instanceof GenerationLimitError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }
    throw error;
  }

  try {
    const slice = toSelectionSlice(parsed.data.selection);
    const { perfil } = await getReaderProfile(user.id);
    const draft = await generateStory({
      selection: slice,
      perfil,
      accentCode: parsed.data.accentCode,
    });
    const id = await saveGeneratedStory({
      ...draft,
      userId: user.id,
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
