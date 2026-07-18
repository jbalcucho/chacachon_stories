import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { setProviderOverrideAction } from "@/app/(site)/admin/actions";
import { getProviderOverrideForAdmin } from "@/lib/dev-provider-override";
import { getSessionUser } from "@/lib/session";
import {
  getAllStoriesForAdmin,
  statusLabel,
  variantLabel,
} from "@/lib/stories";

export const metadata: Metadata = {
  title: "Catálogo (admin)",
  robots: { index: false, follow: false },
};

const PROVIDER_OPTIONS = [
  {
    value: null,
    label: "Automático",
    hint: "Orden normal: Gemini → Claude → plantilla.",
  },
  {
    value: "gemini" as const,
    label: "Forzar Gemini",
    hint: "Si falla o no hay key, cae a plantilla (no prueba Claude).",
  },
  {
    value: "claude" as const,
    label: "Forzar Claude",
    hint: "Si falla o no hay key, cae a plantilla (no prueba Gemini).",
  },
];

export default async function AdminCatalogPage() {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) notFound();

  const stories = await getAllStoriesForAdmin();
  const published = stories.filter((s) => s.status === "PUBLISHED").length;
  const drafts = stories.length - published;
  const providerOverride = await getProviderOverrideForAdmin(true);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const claudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 pb-16 text-cream">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-honey-glow">
          Panel interno
        </p>
        <h1 className="mt-1 text-2xl font-bold">Catálogo de cuentos</h1>
        <p className="mt-2 text-sm text-night-soft">
          {stories.length} cuentos · {published} publicados · {drafts} en
          preparación. Vista de solo lectura.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-bold">Configuración avanzada (dev)</h2>
        <p className="mt-1 text-sm text-night-soft">
          Compara Gemini vs. Claude forzando qué proveedor genera el próximo
          cuento en <Link href="/crear/adaptar" className="text-honey-glow underline">/crear</Link>.
          Solo afecta tu sesión de admin — el resto de las familias sigue en
          automático. El proveedor real usado queda visible en{" "}
          <Link href="/mis-cuentos" className="text-honey-glow underline">
            Mis cuentos
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PROVIDER_OPTIONS.map((opt) => {
            const active = providerOverride === opt.value;
            const disabled =
              (opt.value === "gemini" && !geminiConfigured) ||
              (opt.value === "claude" && !claudeConfigured);
            return (
              <form key={opt.label} action={setProviderOverrideAction}>
                <input type="hidden" name="provider" value={opt.value ?? ""} />
                <button
                  type="submit"
                  disabled={disabled}
                  title={
                    disabled
                      ? "No hay API key configurada para este proveedor."
                      : opt.hint
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? "border-honey-glow bg-honey-glow/20 text-honey-glow"
                      : "border-white/15 bg-white/5 text-cream hover:border-white/30"
                  }`}
                >
                  {opt.label}
                  {active ? " ✓" : ""}
                </button>
              </form>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-night-soft">
          Gemini: {geminiConfigured ? "key configurada" : "sin key"} · Claude:{" "}
          {claudeConfigured ? "key configurada" : "sin key"}
        </p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night-soft">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Lector</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.slug} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <span className="font-semibold">{story.title}</span>
                  <span className="block text-xs text-night-soft">
                    {story.slug}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      story.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    {statusLabel(story.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-night-soft">
                  {variantLabel(story.variant)}
                </td>
                <td className="px-4 py-3">
                  {story.openPath ? (
                    <Link
                      href={story.openPath}
                      className="text-honey-glow underline"
                    >
                      Abrir
                    </Link>
                  ) : (
                    <span className="text-night-soft">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
