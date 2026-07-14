import { z } from "zod";
import { moderateUserText } from "@/lib/content-moderation";

const MAX_MARKDOWN_LENGTH = 8000;

const importTrialStorySchema = z.object({
  markdown: z.string().trim().min(1).max(MAX_MARKDOWN_LENGTH),
  name: z.string().trim().max(64).optional().nullable(),
  path: z.enum(["moment", "classic"]).optional().nullable(),
  ageBandId: z.string().trim().max(32).optional().nullable(),
  momentId: z.string().trim().max(64).optional().nullable(),
  classicId: z.string().trim().max(64).optional().nullable(),
  source: z.enum(["gemini", "claude", "mock"]).optional().nullable(),
});

export type ImportTrialStoryRequest = z.infer<typeof importTrialStorySchema>;

export type ImportTrialStoryGuardOk = {
  ok: true;
  data: ImportTrialStoryRequest;
};

export type ImportTrialStoryGuardFail = {
  ok: false;
  status: 400 | 401;
  message: string;
};

/**
 * Validaciones síncronas de POST /api/cuentos/importar-trial.
 * Facilita tests de API sin montar Next.js completo.
 */
export function guardImportTrialStoryRequest(input: {
  userId: string | null;
  body: unknown;
}): ImportTrialStoryGuardOk | ImportTrialStoryGuardFail {
  if (!input.userId) {
    return {
      ok: false,
      status: 401,
      message: "Entra con Google para guardar tu cuento.",
    };
  }

  if (input.body == null || typeof input.body !== "object") {
    return { ok: false, status: 400, message: "JSON inválido" };
  }

  const parsed = importTrialStorySchema.safeParse(input.body);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Cuento de prueba inválido." };
  }

  if (moderateUserText(parsed.data.markdown)) {
    return { ok: false, status: 400, message: "Contenido no permitido." };
  }

  return { ok: true, data: parsed.data };
}
