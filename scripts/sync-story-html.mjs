#!/usr/bin/env node
/**
 * Sincroniza el cuerpo narrativo de cuentos/*.md → public/cuentos/*.html
 * (conserva estilos, toolbar y script del HTML existente).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const PAIRS = [
  {
    md: "cuentos/familia-chacachon-el-lobo-y-las-palabras.md",
    html: "public/cuentos/familia-chacachon-el-lobo-y-las-palabras.html",
    badge: "Chacachón · Vereda y bosque",
  },
  {
    md: "cuentos/familia-chacachon-cerditos-caperucita.md",
    html: "public/cuentos/familia-chacachon-cerditos-caperucita.html",
    badge: "Chacachón · Edificio",
  },
  {
    md: "cuentos/familia-chacachon-nico-dia-sin-pantallas.md",
    html: "public/cuentos/familia-chacachon-nico-dia-sin-pantallas.html",
    badge: "Chacachón · Apartamento",
  },
  {
    md: "cuentos/familia-chacachon-operacion-a-dormir.md",
    html: "public/cuentos/familia-chacachon-operacion-a-dormir.html",
    badge: "Chacachón · Apartamento",
  },
];

function stripFrontmatter(raw) {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return raw;
  return raw.slice(end + 4).trimStart();
}

function inlineFormat(text) {
  return text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function parseMarkdown(body) {
  const lines = body.split("\n");
  let title = "";
  let subtitle = "";
  const blocks = [];
  let currentScene = null;
  let paragraph = [];

  function flushParagraph() {
    const text = paragraph.join(" ").trim();
    if (text) {
      if (!currentScene) currentScene = { heading: null, paragraphs: [] };
      currentScene.paragraphs.push(text);
    }
    paragraph = [];
  }

  function flushScene() {
    flushParagraph();
    if (currentScene && (currentScene.heading || currentScene.paragraphs.length)) {
      blocks.push(currentScene);
    }
    currentScene = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (trimmed === "---") continue;
    if (trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("> ")) {
      subtitle = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushScene();
      currentScene = { heading: trimmed.slice(3).trim(), paragraphs: [] };
      continue;
    }
    paragraph.push(trimmed);
  }
  flushScene();

  return { title, subtitle, blocks };
}

function paragraphsToHtml(paragraphs) {
  return paragraphs
    .map((p) => `      <p>${inlineFormat(p)}</p>`)
    .join("\n");
}

function buildArticle(blocks) {
  return blocks
    .map((scene) => {
      const parts = [];
      if (scene.heading) {
        parts.push(`      <h2>${inlineFormat(scene.heading)}</h2>`);
      }
      parts.push(paragraphsToHtml(scene.paragraphs));
      return parts.join("\n");
    })
    .join("\n\n");
}

function buildHeader({ title, subtitle, badge }) {
  return `    <header>
      <div class="badge">${badge}</div>
      <h1>${inlineFormat(title)}</h1>
      <p class="subtitle">${inlineFormat(subtitle)}</p>
    </header>`;
}

function syncPair({ md, html, badge }) {
  const mdPath = path.join(root, md);
  const htmlPath = path.join(root, html);
  if (!existsSync(mdPath) || !existsSync(htmlPath)) {
    console.error(`SKIP: falta ${md} o ${html}`);
    return false;
  }

  const parsed = parseMarkdown(stripFrontmatter(readFileSync(mdPath, "utf8")));
  const article = buildArticle(parsed.blocks);
  const header = buildHeader({ ...parsed, badge });
  let page = readFileSync(htmlPath, "utf8");

  page = page.replace(/<header>[\s\S]*?<\/header>/, header);
  page = page.replace(
    /<article id="story">[\s\S]*?<\/article>/,
    `<article id="story">\n${article}\n    </article>`,
  );

  writeFileSync(htmlPath, page, "utf8");
  console.log(`OK: ${path.basename(html)} ← ${path.basename(md)}`);
  return true;
}

let ok = true;
for (const pair of PAIRS) {
  if (!syncPair(pair)) ok = false;
}

if (!ok) process.exit(1);
