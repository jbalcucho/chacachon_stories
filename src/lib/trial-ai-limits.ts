/**
 * Cuota anónima para 1 cuento IA de prueba / día (cookie + IP).
 *
 * Dos capas, no un límite doble: la cookie da 1 cuento/navegador/día (lo que
 * ve un usuario normal); el tope de IP (default 2, `TRIAL_AI_DAILY_PER_IP`)
 * es solo un techo de seguridad para redes compartidas, no la cuota anunciada.
 *
 * Apagar temporalmente en pruebas:
 *   TRIAL_AI_LIMITS_DISABLED=1
 * Volver a encender: quitar la variable o ponerla en 0/false.
 */

export class TrialAiLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrialAiLimitError";
  }
}

export const TRIAL_AI_COOKIE = "chacachon_trial_ai_day";

const memoryByIp = new Map<string, { day: string; count: number }>();

/** Kill switch para pruebas de afinado (sin cuota diaria). */
export function isTrialAiLimitsDisabled(): boolean {
  const raw = process.env.TRIAL_AI_LIMITS_DISABLED?.trim().toLowerCase();
  // TEMP (jul 2026): cuota apagada por defecto mientras afinamos el trial.
  // Para reactivar ya: TRIAL_AI_LIMITS_DISABLED=0 (o false/no).
  // Luego volver el default a `false` y quitar este comentario.
  if (raw === "0" || raw === "false" || raw === "no") return false;
  if (raw === "1" || raw === "true" || raw === "yes") return true;
  return true;
}

export function getTrialAiDailyPerIp(): number {
  const raw = process.env.TRIAL_AI_DAILY_PER_IP;
  if (!raw) return 2;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 2;
  return n;
}

export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

export function trialAiCookieAllows(
  cookieHeader: string | null,
  day = utcDayKey(),
): boolean {
  if (!cookieHeader) return true;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${TRIAL_AI_COOKIE}=([^;]+)`),
  );
  if (!match) return true;
  return decodeURIComponent(match[1]) !== day;
}

export function assertTrialAiAllowed(input: {
  ip: string;
  cookieHeader: string | null;
}): void {
  if (isTrialAiLimitsDisabled()) return;

  const day = utcDayKey();
  if (!trialAiCookieAllows(input.cookieHeader, day)) {
    throw new TrialAiLimitError(
      "Ya usaste tu cuento de prueba con IA hoy. Ingresa gratis para crear más, o vuelve mañana.",
    );
  }

  const limit = getTrialAiDailyPerIp();
  const entry = memoryByIp.get(input.ip);
  if (entry && entry.day === day && entry.count >= limit) {
    throw new TrialAiLimitError(
      "Se alcanzó el límite de pruebas con IA en esta red por hoy. Ingresa gratis para seguir creando.",
    );
  }
}

export function recordTrialAiUse(ip: string): void {
  if (isTrialAiLimitsDisabled()) return;

  const day = utcDayKey();
  const entry = memoryByIp.get(ip);
  if (!entry || entry.day !== day) {
    memoryByIp.set(ip, { day, count: 1 });
    return;
  }
  entry.count += 1;
}

export async function assertTrialAiDbAllowed(ip: string): Promise<void> {
  if (isTrialAiLimitsDisabled()) return;
  if (!process.env.DATABASE_URL) return;

  const limit = getTrialAiDailyPerIp();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const { prisma } = await import("@/lib/prisma");
  const used = await prisma.generatedStory.count({
    where: {
      userId: null,
      createdAt: { gte: since },
      recipe: {
        path: ["trialIp"],
        equals: ip,
      },
    },
  });

  if (used >= limit) {
    throw new TrialAiLimitError(
      "Se alcanzó el límite de pruebas con IA en esta red por hoy. Ingresa gratis para seguir creando.",
    );
  }
}

/** Stub en DB para cuota durable entre instancias (si hay DATABASE_URL). */
export async function recordTrialAiInDb(ip: string): Promise<void> {
  if (isTrialAiLimitsDisabled()) return;
  if (!process.env.DATABASE_URL) return;

  const { prisma } = await import("@/lib/prisma");
  await prisma.generatedStory.create({
    data: {
      userId: null,
      title: "[trial-quota]",
      bodyMarkdown: "",
      recipe: { kind: "trial-quota", trialIp: ip },
      source: "trial",
      model: null,
    },
  });
}

export function buildTrialAiCookie(day = utcDayKey()): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${TRIAL_AI_COOKIE}=${encodeURIComponent(day)}; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly${secure}`;
}

/** Borra la cookie de cuota (útil al apagar límites en pruebas). */
export function clearTrialAiCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${TRIAL_AI_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secure}`;
}
