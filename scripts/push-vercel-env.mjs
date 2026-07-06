/**
 * Sube DATABASE_URL y DIRECT_URL a Vercel.
 * Requiere: .env generado por fetch-neon-env.mjs y vercel link al proyecto.
 */

import { execSync } from "child_process";
import fs from "fs";

function loadEnv(path) {
  const env = {};
  for (const line of fs.readFileSync(path, "utf8").split("\n")) {
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

const env = loadEnv(".env");
const vars = ["DATABASE_URL", "DIRECT_URL"];

for (const name of vars) {
  if (!env[name]) throw new Error(`Missing ${name} in .env`);
  for (const target of ["production", "preview", "development"]) {
    try {
      execSync(`npx vercel@latest env rm ${name} ${target} --yes`, {
        stdio: "ignore",
      });
    } catch {
      /* may not exist */
    }
    execSync(`npx vercel@latest env add ${name} ${target} --yes`, {
      input: env[name],
      encoding: "utf8",
    });
    console.log(`✓ ${name} → ${target}`);
  }
}

console.log("✓ Vercel env vars updated");
