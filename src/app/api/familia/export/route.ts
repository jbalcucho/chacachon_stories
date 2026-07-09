import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/** Exporta cuenta + perfil familiar (Ley 1581 / Habeas Data). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
    },
    familyProfile: dbUser.profile
      ? {
          schemaVersion: dbUser.profile.schemaVersion,
          perfil: dbUser.profile.perfil,
          updatedAt: dbUser.profile.updatedAt,
        }
      : null,
  });
}
