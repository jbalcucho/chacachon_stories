const DEFAULT_DAILY_LIMIT = 3;

export type GenerationQuota = {
  limit: number;
  used: number;
  remaining: number;
};

export class GenerationLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationLimitError";
  }
}

export function getGenerationDailyLimit(): number {
  const raw = process.env.GENERATION_DAILY_LIMIT;
  if (!raw) return DEFAULT_DAILY_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_DAILY_LIMIT;
  return parsed;
}

/** Cuota de generación en ventana de 24 h para mostrar en vista previa. */
export async function getGenerationQuotaForUser(
  userId: string,
): Promise<GenerationQuota> {
  const limit = getGenerationDailyLimit();
  if (!process.env.DATABASE_URL) {
    return { limit, used: 0, remaining: limit };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { prisma } = await import("@/lib/prisma");
  const used = await prisma.generatedStory.count({
    where: { userId, createdAt: { gte: since } },
  });

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

/** Lanza `GenerationLimitError` si el usuario superó la cuota de 24 h. */
export async function assertGenerationAllowed(userId: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  const { limit, used } = await getGenerationQuotaForUser(userId);

  if (used >= limit) {
    throw new GenerationLimitError(
      `Puedes crear hasta ${limit} cuento${limit === 1 ? "" : "s"} por día. Vuelve mañana o escríbenos si necesitas más.`,
    );
  }
}
