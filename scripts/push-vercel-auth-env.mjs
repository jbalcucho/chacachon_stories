/**
 * Sube variables de NextAuth y Google OAuth a Vercel.
 * Lee desde .env.local (o .env).
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
const rotatudisfrazPulled = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../rotatudisfraz/.env.vercel-pulled",
);

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

function pushEnv(name, value, target) {
  try {
    execSync(`npx vercel@latest env rm ${name} ${target} --yes`, {
      stdio: "ignore",
    });
  } catch {
    /* may not exist */
  }
  execSync(`npx vercel@latest env add ${name} ${target} --yes`, {
    input: value,
    encoding: "utf8",
  });
  console.log(`✓ ${name} → ${target}`);
}

const env = { ...loadEnv(rotatudisfrazPulled), ...loadEnv(envPath) };
const PROD_URL = "https://chacachon-stories.vercel.app";
const vars = [
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_EMAILS",
];

for (const name of vars) {
  if (!env[name]) {
    console.warn(`⚠ Skipping ${name} (not set in ${envPath})`);
    continue;
  }
  for (const target of ["production", "preview", "development"]) {
    pushEnv(name, env[name], target);
  }
}

const localAuthUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
pushEnv("NEXTAUTH_URL", PROD_URL, "production");
pushEnv("NEXTAUTH_URL", PROD_URL, "preview");
pushEnv("NEXTAUTH_URL", localAuthUrl, "development");

console.log("✓ Auth env vars updated");
