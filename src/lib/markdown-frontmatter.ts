export type Frontmatter = Record<string, string>;

export function parseFrontmatter(raw: string): {
  meta: Frontmatter;
  body: string;
} {
  if (!raw.startsWith("---\n")) {
    return { meta: {}, body: raw };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, body: raw };
  }

  const yaml = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const meta: Frontmatter = {};

  for (const line of yaml.split("\n")) {
    const match = line.match(/^([\w-]+):\s*(.+)$/);
    if (match) meta[match[1]] = match[2].trim();
  }

  return { meta, body };
}
