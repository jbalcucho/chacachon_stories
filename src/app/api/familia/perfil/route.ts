import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  familyProfilePutSchema,
  type FamilyProfileDocument,
} from "@/lib/family-profile-schema";
import { mergeFamilyProfile } from "@/lib/merge-family-profile";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const row = await prisma.familyProfile.findUnique({
    where: { userId: user.id },
  });

  if (!row) {
    return NextResponse.json({ perfil: null, schemaVersion: 1 });
  }

  return NextResponse.json({
    id: row.id,
    schemaVersion: row.schemaVersion,
    perfil: row.perfil,
    updatedAt: row.updatedAt,
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = familyProfilePutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Perfil inválido", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { schemaVersion, perfil } = parsed.data;
  const existing = await prisma.familyProfile.findUnique({
    where: { userId: user.id },
    select: { perfil: true },
  });
  const merged = mergeFamilyProfile(
    existing?.perfil as FamilyProfileDocument | undefined,
    perfil,
  );
  const perfilJson = merged as unknown as Prisma.InputJsonValue;

  const row = await prisma.familyProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      schemaVersion,
      perfil: perfilJson,
    },
    update: {
      schemaVersion,
      perfil: perfilJson,
    },
  });

  return NextResponse.json({
    id: row.id,
    schemaVersion: row.schemaVersion,
    perfil: merged,
    updatedAt: row.updatedAt,
  });
}
