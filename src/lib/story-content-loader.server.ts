import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStoryContentSource } from "@/lib/story-content-index";

export function resolveStoryFilePath(filePath: string): string {
  return path.join(process.cwd(), filePath);
}

export async function readStorySourceFile(slug: string): Promise<string | null> {
  const source = getStoryContentSource(slug);
  if (!source) return null;
  try {
    return await readFile(resolveStoryFilePath(source.filePath), "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw error;
  }
}
