import { NextResponse } from "next/server";
import { getGenerationQuotaForUser } from "@/lib/generation-limits";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { message: "Entra con Google para ver tu cuota." },
      { status: 401 },
    );
  }

  const quota = await getGenerationQuotaForUser(user.id);
  return NextResponse.json(quota);
}
