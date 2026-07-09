import { NextResponse } from "next/server";
import {
  familyProfileEssentialSchema,
  type FamilyProfileDocument,
} from "@/lib/family-profile-schema";
import { interpolateProfile } from "@/lib/interpolation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const DEMO_TEMPLATE =
  "Buenas noches, {{niño_1}}. {{mama}} dice: «{{frase_mama}}». {{papa}} añade: «{{frase_papa}}». En {{hogar}} de {{ciudad}}, sin {{pantalla_que_usan}} esta noche.";

/** Demo de interpolación con el perfil guardado (HTML-safe). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const row = await prisma.familyProfile.findUnique({
    where: { userId: user.id },
  });

  if (!row) {
    return NextResponse.json(
      { message: "Aún no hay perfil familiar. Complétalo en /familia." },
      { status: 404 },
    );
  }

  const parsed = familyProfileEssentialSchema.safeParse(row.perfil);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "El perfil guardado no pasa validación" },
      { status: 422 },
    );
  }

  const perfil = parsed.data as FamilyProfileDocument;
  const text = interpolateProfile(DEMO_TEMPLATE, perfil);

  return NextResponse.json({
    template: DEMO_TEMPLATE,
    text,
    note: "Los valores están escapados para HTML (anti-XSS).",
  });
}
