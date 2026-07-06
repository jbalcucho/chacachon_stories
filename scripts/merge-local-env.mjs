/**
 * Fusiona .env (Neon) + auth de rotatudisfraz en .env.local para desarrollo local.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rotatudisfrazEnv = path.resolve(
  __dirname,
  "../../rotatudisfraz/.env.vercel-pulled",
);
const rotatudisfrazLocal = path.resolve(
  __dirname,
  "../../rotatudisfraz/.env.local",
);

const AUTH_KEYS = [
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_EMAILS",
];

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const db = loadEnv(".env");
const auth = {
  ...loadEnv(rotatudisfrazLocal),
  ...loadEnv(rotatudisfrazEnv),
};
const lines = [
  "# Merged by scripts/merge-local-env.mjs — do not commit",
  `DATABASE_URL="${db.DATABASE_URL ?? ""}"`,
  `DIRECT_URL="${db.DIRECT_URL ?? ""}"`,
  "",
  "NEXTAUTH_URL=\"http://localhost:3000\"",
];

for (const key of AUTH_KEYS) {
  if (auth[key]) lines.push(`${key}="${auth[key]}"`);
}

fs.writeFileSync(".env.local", lines.join("\n") + "\n");
console.log("✓ .env.local merged (Neon + auth)");
