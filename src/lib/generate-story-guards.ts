import { moderateRecipeSelection } from "@/lib/content-moderation";
import {
  generateStoryRequestSchema,
  selectionMissingRequired,
  type GenerateStoryRequest,
} from "@/lib/recipe-selection";

export type GenerateStoryGuardOk = {
  ok: true;
  data: GenerateStoryRequest;
};

export type GenerateStoryGuardFail = {
  ok: false;
  status: 400 | 401;
  message: string;
  errors?: unknown;
};

/**
 * Validaciones síncronas de POST /api/cuentos/generar (antes de cuota/LLM).
 * Facilita tests de API sin montar Next.js completo.
 */
export function guardGenerateStoryRequest(input: {
  userId: string | null;
  body: unknown;
}): GenerateStoryGuardOk | GenerateStoryGuardFail {
  if (!input.userId) {
    return {
      ok: false,
      status: 401,
      message: "Entra con Google para crear tu cuento.",
    };
  }

  const raw = input.body as { selection?: unknown; accentCode?: unknown } | null;
  if (raw == null || typeof raw !== "object") {
    return { ok: false, status: 400, message: "JSON inválido" };
  }

  const parsed = generateStoryRequestSchema.safeParse({
    selection: raw.selection ?? raw,
    accentCode: raw.accentCode,
  });
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: "Receta inválida",
      errors: parsed.error.flatten(),
    };
  }

  const missing = selectionMissingRequired(parsed.data.selection);
  if (missing) {
    return { ok: false, status: 400, message: missing };
  }

  const moderation = moderateRecipeSelection(parsed.data.selection);
  if (moderation) {
    return { ok: false, status: 400, message: moderation };
  }

  return { ok: true, data: parsed.data };
}
