import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  familyProfileEssentialSchema,
  type FamilyProfileDocument,
} from "@/lib/family-profile-schema";
import { prisma } from "@/lib/prisma";

const DEFAULT_PROFILE_PATH = path.join(
  process.cwd(),
  "perfiles/familia-chacachon.json",
);

async function loadDefaultProfile(): Promise<FamilyProfileDocument> {
  const raw = await readFile(DEFAULT_PROFILE_PATH, "utf8");
  const doc = JSON.parse(raw) as { perfil?: unknown };
  const parsed = familyProfileEssentialSchema.safeParse(doc.perfil);
  if (!parsed.success) {
    throw new Error("Perfil demo inválido en perfiles/familia-chacachon.json");
  }
  return parsed.data;
}

export type ReaderProfileSource = "user" | "demo";

export type ReaderProfile = {
  perfil: FamilyProfileDocument;
  source: ReaderProfileSource;
};

/** Perfil del lector: usuario autenticado o demo Chacachón. */
export async function getReaderProfile(
  userId: string | null,
): Promise<ReaderProfile> {
  if (userId) {
    const row = await prisma.familyProfile.findUnique({
      where: { userId },
      select: { perfil: true },
    });
    if (row?.perfil) {
      const parsed = familyProfileEssentialSchema.safeParse(row.perfil);
      if (parsed.success) {
        return { perfil: parsed.data, source: "user" };
      }
    }
  }

  return { perfil: await loadDefaultProfile(), source: "demo" };
}
