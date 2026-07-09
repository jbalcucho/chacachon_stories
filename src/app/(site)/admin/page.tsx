import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
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

export default async function AdminCatalogPage() {
  const user = await getSessionUser();
  if (!user || user.role !== UserRole.ADMIN) notFound();

  const stories = await getAllStoriesForAdmin();
  const published = stories.filter((s) => s.status === "PUBLISHED").length;
  const drafts = stories.length - published;

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
