import { NextResponse } from "next/server";
import { saveTrialStoryDebugSnapshot } from "@/lib/trial-story-debug-save.server";

export const runtime = "nodejs";

type Body = {
  name?: string | null;
  ageBandId?: string | null;
  ageBandLabel?: string | null;
  path?: string | null;
  momentId?: string | null;
  classicId?: string | null;
  markdown?: string | null;
  source?: string | null;
  createdAt?: string | null;
  note?: string | null;
};

/** Guarda un trial ya en sessionStorage (p. ej. el cuento actual) en `.tmp/`. */
export async function POST(request: Request) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SAVE_TRIAL_STORIES !== "1"
  ) {
    return NextResponse.json({ message: "No disponible" }, { status: 404 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const markdown = body.markdown?.trim() ?? "";
  if (!markdown) {
    return NextResponse.json(
      { message: "Falta markdown del cuento." },
      { status: 400 },
    );
  }

  const saved = await saveTrialStoryDebugSnapshot({
    name: body.name,
    ageBandId: body.ageBandId,
    ageBandLabel: body.ageBandLabel,
    path: body.path,
    momentId: body.momentId,
    classicId: body.classicId,
    markdown,
    source: body.source,
    createdAt: body.createdAt,
    note: body.note ?? "client-sync",
  });

  if (!saved) {
    return NextResponse.json(
      { message: "Guardado desactivado." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    latestPath: saved.latestPath,
    stampedPath: saved.stampedPath,
  });
}
