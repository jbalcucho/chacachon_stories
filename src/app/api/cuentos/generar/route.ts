import { NextResponse } from "next/server";
import { saveGeneratedStory } from "@/lib/generated-stories.server";
import { guardGenerateStoryRequest } from "@/lib/generate-story-guards";
import {
  GenerationLimitError,
  assertGenerationAllowed,
} from "@/lib/generation-limits";
import {
  buildGenerationTelemetry,
  logGenerationTelemetry,
} from "@/lib/generation-telemetry";
import { toSelectionSlice } from "@/lib/recipe-selection";
import { getReaderProfile } from "@/lib/reader-profile";
import { getSessionUser } from "@/lib/session";
import { generateStory } from "@/lib/story-generation.server";

// Generación + gate semántico (7-9s del juez, con posible reintento) superan
// el timeout default de Vercel; mismo margen que /api/cuentos/probar.
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getSessionUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const guarded = guardGenerateStoryRequest({
    userId: user?.id ?? null,
    body,
  });
  if (!guarded.ok) {
    return NextResponse.json(
      { message: guarded.message, errors: guarded.errors },
      { status: guarded.status },
    );
  }

  // user está definido si guard pasó (401 si no).
  const sessionUser = user!;

  try {
    await assertGenerationAllowed(sessionUser.id);
  } catch (error) {
    if (error instanceof GenerationLimitError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }
    throw error;
  }

  const started = Date.now();
  try {
    const slice = toSelectionSlice(guarded.data.selection);
    const { perfil } = await getReaderProfile(sessionUser.id);
    const draft = await generateStory({
      selection: slice,
      perfil,
      accentCode: guarded.data.accentCode,
    });
    const id = await saveGeneratedStory({
      ...draft,
      userId: sessionUser.id,
      recipe: guarded.data.selection,
    });

    logGenerationTelemetry(
      buildGenerationTelemetry({
        userId: sessionUser.id,
        storyId: id,
        source: draft.source,
        model: draft.model,
        durationMs: Date.now() - started,
        bodyMarkdown: draft.bodyMarkdown,
        usage: draft.usage,
      }),
    );

    return NextResponse.json({ id, source: draft.source });
  } catch (error) {
    console.error("[api/cuentos/generar] error:", error);
    return NextResponse.json(
      { message: "No pudimos crear el cuento. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
