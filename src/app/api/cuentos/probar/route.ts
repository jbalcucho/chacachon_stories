import { NextResponse } from "next/server";
import { moderateUserText } from "@/lib/content-moderation";
import { generateStory } from "@/lib/story-generation.server";
import {
  TrialAiLimitError,
  assertTrialAiDbAllowed,
  assertTrialAiAllowed,
  buildTrialAiCookie,
  clearTrialAiCookie,
  clientIpFromHeaders,
  isTrialAiLimitsDisabled,
  recordTrialAiInDb,
  recordTrialAiUse,
} from "@/lib/trial-ai-limits";
import {
  TRIAL_NAME_MAX,
  buildTrialSelection,
  getTrialClassic,
  getTrialMoment,
  normalizeTrialName,
  resolveCompanionIds,
  resolveCompanionNameById,
  resolveTrialDefaults,
  type TrialPath,
} from "@/lib/trial-story";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  name?: string;
  path?: TrialPath;
  ageBandId?: string | null;
  momentId?: string | null;
  classicId?: string | null;
  companionId?: string | null;
  companionIds?: string[] | null;
  companionNameById?: Record<string, string> | null;
  companionNames?: string | null;
  petId?: string | null;
  petName?: string | null;
  lessonId?: string | null;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const name = normalizeTrialName(body.name ?? "");
  if (!name) {
    return NextResponse.json(
      { message: "Escribe un nombre corto (1–24 letras)." },
      { status: 400 },
    );
  }
  if (name.length > TRIAL_NAME_MAX || moderateUserText(name)) {
    return NextResponse.json({ message: "Nombre no válido." }, { status: 400 });
  }

  const path: TrialPath = body.path === "classic" ? "classic" : "moment";
  if (path === "classic") {
    getTrialClassic(body.classicId);
  } else {
    getTrialMoment(body.momentId);
  }

  const companionIds = resolveCompanionIds({
    name,
    path,
    companionIds: body.companionIds,
    companionId: body.companionId,
  });
  const companionNameById = body.companionNameById ?? null;

  const input = {
    name,
    path,
    ageBandId: body.ageBandId ?? null,
    momentId: path === "moment" ? body.momentId ?? null : null,
    classicId: path === "classic" ? body.classicId ?? null : null,
    companionIds,
    companionNameById,
    companionNames: body.companionNames ?? null,
    petId: body.petId ?? null,
    petName: body.petName ?? null,
    lessonId: body.lessonId ?? null,
  };

  const ip = clientIpFromHeaders(request.headers);
  const cookieHeader = request.headers.get("cookie");

  try {
    assertTrialAiAllowed({ ip, cookieHeader });
    await assertTrialAiDbAllowed(ip);
  } catch (error) {
    if (error instanceof TrialAiLimitError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }
    throw error;
  }

  const resolved = resolveTrialDefaults(input);
  const selection = buildTrialSelection(input);

  try {
    const draft = await generateStory({
      selection,
      perfil: null,
      accentCode: "neutro",
    });

    recordTrialAiUse(ip);
    await recordTrialAiInDb(ip);

    const response = NextResponse.json({
      name,
      path,
      ageBandId: resolved.ageBand.id,
      ageBandLabel: resolved.ageBand.label,
      momentId: input.momentId,
      classicId: input.classicId,
      companionId: companionIds[0] ?? null,
      companionIds,
      companionNameById: resolveCompanionNameById(input),
      companionNames: null,
      petId: resolved.pet?.id ?? null,
      petName: resolved.petName,
      lessonId: resolved.lesson.id,
      markdown: draft.bodyMarkdown,
      createdAt: new Date().toISOString(),
      frameLabel: resolved.frameLabel,
      lessonLabel: resolved.lesson.label,
      companionLabel: resolved.companionLabel,
      petLabel: resolved.petLabel,
      source: draft.source,
    });
    response.headers.set(
      "Set-Cookie",
      isTrialAiLimitsDisabled() ? clearTrialAiCookie() : buildTrialAiCookie(),
    );
    return response;
  } catch (error) {
    console.error("[api/cuentos/probar] error:", error);
    return NextResponse.json(
      { message: "No se pudo generar el cuento. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
