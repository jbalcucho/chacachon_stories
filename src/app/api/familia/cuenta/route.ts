import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/**
 * Elimina la cuenta del usuario y el perfil familiar (cascade).
 * Body opcional: { confirm: "ELIMINAR" }
 */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  let confirm = "";
  try {
    const body = (await request.json()) as { confirm?: string };
    confirm = body.confirm ?? "";
  } catch {
    /* empty body ok if query used */
  }

  const url = new URL(request.url);
  if (!confirm) confirm = url.searchParams.get("confirm") ?? "";

  if (confirm !== "ELIMINAR") {
    return NextResponse.json(
      {
        message:
          'Confirma el borrado enviando { "confirm": "ELIMINAR" } en el body.',
      },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true, deletedUserId: user.id });
}
