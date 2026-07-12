import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type TrialStoryDebugSnapshot = {
  name?: string | null;
  ageBandId?: string | null;
  ageBandLabel?: string | null;
  path?: string | null;
  momentId?: string | null;
  classicId?: string | null;
  markdown: string;
  source?: string | null;
  createdAt?: string | null;
  note?: string | null;
};

function isTrialStoryDebugSaveEnabled(): boolean {
  if (process.env.SAVE_TRIAL_STORIES === "0") return false;
  if (process.env.SAVE_TRIAL_STORIES === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/**
 * Guarda el markdown del trial en `.tmp/` para revisión local conjunta.
 * No-op en producción salvo SAVE_TRIAL_STORIES=1.
 */
export async function saveTrialStoryDebugSnapshot(
  snapshot: TrialStoryDebugSnapshot,
): Promise<{ dir: string; latestPath: string; stampedPath: string } | null> {
  if (!isTrialStoryDebugSaveEnabled()) return null;
  if (!snapshot.markdown?.trim()) return null;

  const dir = path.join(process.cwd(), ".tmp", "trial-stories");
  await mkdir(dir, { recursive: true });

  const createdAt = snapshot.createdAt ?? new Date().toISOString();
  const stamp = createdAt.replace(/[:.]/g, "-");
  const safeName = (snapshot.name ?? "cuento")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü_-]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "cuento";

  const meta = [
    `<!-- trial debug snapshot -->`,
    `<!-- savedAt: ${new Date().toISOString()} -->`,
    `<!-- createdAt: ${createdAt} -->`,
    `<!-- name: ${snapshot.name ?? ""} -->`,
    `<!-- age: ${snapshot.ageBandLabel ?? snapshot.ageBandId ?? ""} -->`,
    `<!-- path: ${snapshot.path ?? ""} -->`,
    `<!-- moment: ${snapshot.momentId ?? ""} -->`,
    `<!-- classic: ${snapshot.classicId ?? ""} -->`,
    `<!-- source: ${snapshot.source ?? ""} -->`,
    snapshot.note ? `<!-- note: ${snapshot.note} -->` : null,
    "",
    snapshot.markdown.trim(),
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const latestPath = path.join(dir, "latest.md");
  const stampedPath = path.join(dir, `${stamp}-${safeName}.md`);
  await writeFile(latestPath, meta, "utf8");
  await writeFile(stampedPath, meta, "utf8");

  return { dir, latestPath, stampedPath };
}
