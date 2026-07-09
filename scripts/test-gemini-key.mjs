import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^GEMINI_API_KEY="(.*)"/);
    if (m) return m[1];
  }
  return "";
}

const key = loadEnvLocal();
if (!key) {
  console.log("RESULT: NO_KEY");
  process.exit(1);
}

const modelsToTry = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
].filter(Boolean);

const uniqueModels = [...new Set(modelsToTry)];

for (const model of uniqueModels) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Di hola en una palabra" }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  });
  const body = await res.json().catch(() => ({}));
  const snippet =
    body.candidates?.[0]?.content?.parts?.[0]?.text ??
    body.error?.message?.slice(0, 120) ??
    "sin respuesta";
  console.log(`MODEL=${model} HTTP=${res.status} DETAIL=${snippet}`);
  if (res.ok) {
    console.log("RESULT: OK");
    process.exit(0);
  }
}

console.log("RESULT: FAILED_ALL_MODELS");
process.exit(2);
