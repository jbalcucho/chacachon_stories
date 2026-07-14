# Estado del proyecto — Chacachón Stories

**Snapshot técnico y de producto** · Fecha: **2026-07-13**  
**Repo:** `/Users/jbalcucho/MyProjects/balcu-apps/chacachon_stories`  
**Producción citada en docs:** https://chacachon-stories.vercel.app  
**Último commit relevante al cortar este documento:** `7cfa8c2` (2026-07-12) — *Harden trial story voice and stabilize the end-of-book CTA.*  
**Propósito de este archivo:** que otra IA (Claude u otra) entienda el proyecto **sin** recorrer carpeta por carpeta. No sustituye el código; resume hechos verificados en el repo.

**Convenciones:** rutas relativas al root del repo. No se pegan cuerpos de código; se describen módulos y contratos. Donde docs y código divergen, se marca **INCONSISTENCIA**.

---

## 1. Resumen ejecutivo

Chacachón Stories es una app consumer (Next.js 15 + Neon/Prisma + NextAuth Google + generación LLM) de cuentos infantiles personalizados en español colombiano, con lectura tipo libro y prueba anónima en `/probar`.

**Estado real (no aspiracional):** MVP **funcional en producción** para el loop principal *generar → leer → pedir cuenta*, con autenticación Google, perfil familiar JSON, cuota diaria de generación para usuarios logueados, biblioteca `/mis-cuentos`, y lector con paginación DOM. El trial anónimo sí llama a la IA (`POST /api/cuentos/probar`) y guarda en `sessionStorage`; hay CTA de conversión al final del libro.

**Qué falta o está hueco:** el **corpus editorial curado está vacío** (`cuentos/` solo tiene README; `story-content-manifest.json` → `sources: {}`; `prisma/seed.ts` hace `deleteMany` y no inserta historias). Las “muestras” del guest home son **3 HTML fijos** en `public/cuentos/demo-*.html` + constantes en código, no el catálogo DB. La calidad depende casi por completo de un **prompt largo + few-shots hardcodeados + léxico colombiano + semillas aleatorias**, no de un corpus dorado. Límites de abuso en trial están **desactivados por defecto** (TEMP jul 2026). Monetización (Fase C) no implementada. Plantillas clásicas en `/crear/plantillas` están **vacías**.

**Cercanía a MVP funcional:** ~**75–85%** del alcance del brief de producto **como app operable**; ~**30–40%** del norte editorial de calidad (voz fantasía/colombiana alineada en prompt reciente, pero sin corpus, con biblia aún centrada en casa/cotidiano, y docs desalineados). Producto usable; identidad editorial **inestable entre docs y código**.

---

## 2. Idea de negocio y producto

### 2.1 Propuesta de valor *tal como está implementada hoy*

| Claim del brief | Qué hace el código realmente |
|-----------------|------------------------------|
| Niño como héroe / receta simple | Sí: trial pide nombre, edad 3–5\|6–8\|9–12, momento o clásico; `/crear/adaptar` arma receta completa. |
| Voz tradición oral + humor colombiano | Parcial: system/user prompt en `src/lib/story-prompt.ts` + `story-colombian-lexicon.ts` + few-shots; calidad **variable** (salida LLM). Sanitiza Había una vez / colorín colorado. |
| No coach de rutina | Intentado en prompt (anti sala/TV, anti dulces sueños); trial “momentos” siguen siendo temas domésticos (dormir, pantallas, verduras) mapeados a semilla simbólica. |
| Guardar en familia | Sí post-login: `GeneratedStory` + `/mis-cuentos`. El trial **no** guarda en DB al terminar; CTA manda a login → `/crear`. |
| Muestras curadas de marca | Solo 3 demos HTML huérfanas del seed; **no** hay cuentos markdown canónicos publicados. |

La propuesta de valor *sentida* hoy = **generador personalizado + lector agradable + prueba sin fricción**, más que “biblioteca Chacachón de cuentos modelo”.

### 2.2 Flujo de usuario real (rutas y componentes)

#### A) Guest trial (camino principal de adquisición)

1. **Home** `src/app/(site)/page.tsx` — estantería guest; CTA “Crear gratis” → `/probar`. Muestras desde `DEMO_SHOWCASE_STORIES` (`src/lib/onboarding.ts`) abriendo HTML estático `/cuentos/demo-*.html` (no el lector Next de slug de DB).
2. **`/probar`** `src/app/(site)/probar/page.tsx` → `src/components/TrialStoryForm.tsx`.
3. Submit → **`POST /api/cuentos/probar`** (`src/app/api/cuentos/probar/route.ts`): valida/modera nombre; (si límites ON) cookie + IP + stub DB; llama `generateStory` (`src/lib/story-generation.server.ts`); responde markdown + meta.
4. Cliente guarda payload en **`sessionStorage`** clave `chacachon.trialStory.v3` (`src/lib/trial-story.ts` → `saveTrialStory`) y navega a `/leer/prueba`.
5. Si la API falla (excepto 429), el form puede **caer a mock local** y abrir el lector igual.
6. **`/leer/prueba`** `src/app/(reader)/leer/prueba/page.tsx`: lee sessionStorage → `trialMarkdownToContent` (sanitiza bookends) → `StoryReader` con `endConversion` → link login `callbackUrl=/crear`.
7. Side-effect: `POST /api/dev/trial-story` persiste snapshot en `tmp/trial-stories/` (no prod salvo env).

#### B) Usuario logueado (creación durable)

1. Login Google: `/login` → NextAuth `src/app/api/auth/[...nextauth]/route.ts` + `src/lib/auth.ts`.
2. Perfil: `/familia`, `/perfiles` — `FamilyProfile` JSON (`src/app/api/familia/perfil`).
3. Hub **`/crear`** → `CrearHub`: rutas a `/crear/adaptar`, `/crear/plantillas` (lista vacía), `/familia`.
4. **`/crear/adaptar`** + `StoryRecipeBuilder`: preview cuota `GET /api/cuentos/cuota` → `POST /api/cuentos/generar` (auth + moderación receta + cuota) → redirect **`/leer/generado/[id]`**.
5. Biblioteca **`/mis-cuentos`** (middleware + redirect server si no hay sesión).

#### C) Lectura de catálogo / share

- `/leer/[slug]` para historias del modelo `Story` si existen en DB (hoy seed vacío → poco usable salvo datos previos).
- OG por slug: `src/app/(reader)/leer/[slug]/opengraph-image.tsx`.
- Docs mencionan `/leer/operacion-a-dormir` — **slug no existe** en seed/manifest.

### 2.3 Alcance del brief: construido vs pendiente

| Ítem brief §Alcance | Estado |
|---------------------|--------|
| Generación Gemini → Claude → mock | ✅ Implementado |
| `/probar` + `/leer/prueba` | ✅ |
| Hub `/crear` + receta + acentos | ✅ (plantillas vacías) |
| Login Google | ✅ |
| Perfil familiar | ✅ |
| Cuentos guardados / mis-cuentos | ✅ |
| Lector tipo libro | ✅ |
| Guardrails editoriales en prompt + sanitizer | ✅ parcial (saliendo dependiente del LLM) |
| Léxico oral colombiano | ✅ archivo + inject |
| Corpus de cuentos buenos como motor | ❌ vacío; brief lo marca como “dirección futura” |
| Trial → guardar *ese* cuento en cuenta | ❌ CTA crea flujo nuevo en `/crear`, no importa trial a DB |
| Monetización | ❌ Fase C |
| Rate limit trial en prod | ⚠️ código existe, **OFF** por default |

**Estimación cobertura brief producto operable:** ~**80%**.  
**Estimación norte editorial + conversión “guardar este cuento”:** ~**40–50%**.

### 2.4 Diferenciación vs competencia (evaluada contra *output* real)

| Diferenciador declarado | Evidencia en código/salida |
|-------------------------|----------------------------|
| Tradición oral (Había/Era + colorín) | Prompt + `sanitizeFairyTaleBookends`; trial dumps recientes suelen cumplir. |
| Fantasía clara, no sala/TV default | Prompt jul-2026 lo exige; biblia y demos HTML guest **aún son domésticos**. Salidas trial mixtas (Lucho-desierto bueno; Martha-nave aún aparece). |
| Humor colombiano | Léxico + seeds; a veces bien (¿me hablaban?, por un pelo), a veces pegado. |
| No checklist moral | Sanitizer/quality penaliza sermón; cierres LLM aún pueden “enseñar”. |
| Corpus marca | **No hay corpus**; poca diferenciación durable frente a otro prompt bien escrito. |

**Conclusión:** la diferenciación está **en el prompt**, no en activos editoriales versionados. Competidores consumer típicos también hacen prompt+API; Chacachón no tiene aún ventaja estructural de contenido.

---

## 3. Arquitectura técnica

### 3.1 Stack con versiones reales (`package.json`)

| Pieza | Versión |
|-------|---------|
| next | ^15.4.10 |
| react / react-dom | 19.1.0 |
| next-auth | ^4.24.11 |
| @prisma/client / prisma | ^5.22.0 |
| zod | ^3.24.1 |
| tailwindcss | ^4 (dev) |
| typescript | ^5 |
| vitest | ^3.2.7 |
| engines.node | >=22 |

Deploy asumido: Vercel. DB: Neon Postgres (`DATABASE_URL`, `DIRECT_URL`). Scripts útiles: `validate:catalog`, `validate:quality`, `sync:cuentos`, `sync:html`, `db:*`, CI en `.github/workflows/ci.yml` (catalog, quality, typecheck, lint, test, build).

### 3.2 Flujo de datos (textual)

```
Usuario (browser)
  → páginas App Router (site | reader)
  → fetch APIs /api/*
       → guards (sesión Zod / moderación / cuotas)
       → generateStory(system+user prompts)
            → Gemini API (si GEMINI_API_KEY)
            → else/fail Claude (si ANTHROPIC_API_KEY)
            → else mock markdown
       → sanitizeFairyTaleBookends
  → Persistencia:
       Trial: sessionStorage (+ opcional tmp/trial-stories)
       Logueado: Postgres GeneratedStory
  → StoryReader + useBookPagination (medida DOM)
```

### 3.3 Fallback Gemini → Claude → mock (código real)

Archivo: `src/lib/story-generation.server.ts`.

| Paso | Condición | Detalle |
|------|-----------|---------|
| 1 Gemini | `GEMINI_API_KEY` | Modelos: `GEMINI_MODEL` o candidatos `gemini-3.1-flash-lite-preview`, `gemini-flash-lite-latest`, `gemini-flash-latest`. `maxOutputTokens=2200`, `temperature=1.05`, `topP=0.95`. |
| 2 Claude | si Gemini no / falla y hay `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest` o `ANTHROPIC_MODEL`; `max_tokens=2200`; **sin temperature explícita**. |
| 3 Mock | ambos fallan o sin keys | `buildMockStoryMarkdown` (`src/lib/story-mock.ts`). |

Nunca deja al caller sin draft (salvo errores de ruta distintos). Post-proceso: bookends. **INCONSISTENCIA:** comentario en `story-mock.ts` / algunos docs antiguos aún hablan “sin Anthropic”; el orden real es **Gemini primero**.

### 3.4 Estructura de carpetas (qué hay, no solo árbol)

| Ruta | Contenido real |
|------|----------------|
| `src/app/(site)/` | Marketing, home, login, crear, familia, probar, mis-cuentos, admin, privacidad |
| `src/app/(reader)/leer/` | Lectores `[slug]`, `prueba`, `generado/[id]` |
| `src/app/api/` | auth, cuentos/{probar,generar,cuota}, familia/*, dev/trial-story |
| `src/components/` | UI producto; `family/*` onboarding; `StoryReader`, bookshelf, trial form, recipe builder |
| `src/lib/` | Núcleo de dominio: prompts, generación, trial, quality, pagination, auth/session, límites, recipes |
| `src/hooks/` | `useBookPagination.tsx` |
| `src/data/` | `story-content-manifest.json` (vacío), `story-redirects.json` (`[]`) |
| `cuentos/` | **Solo README** — corpus vacío |
| `public/cuentos/` | 3 demos HTML guest |
| `perfiles/` | Fixtures JSON locales (familia-chacachón, balcutron, garcia) |
| `prisma/` | schema + migrations + seed wipe |
| `docs/` | Brief, biblia, roadmap, IA, architecture, etc. |
| `scripts/` | sync/validate manifest HTML quality, neon/vercel helpers, icons |
| `tmp/trial-stories/` | Snapshots locales de trials (gitignored) |
| Root | `GuiaAcentos.md`, `StackTecnico.md`, `README.md`, `contextonew.md`, etc. |

### 3.5 Autenticación — estado real

| Aspecto | Hecho |
|---------|--------|
| Proveedor | Google OAuth únicamente (`src/lib/auth.ts`) |
| Sesión | JWT; `userId` + `role` en token (`src/types/next-auth.d.ts`) |
| Upsert user | En sign-in; rol admin vía `ADMIN_EMAILS` |
| Middleware | Protege solo `/familia/*`, `/admin/*`, `/mis-cuentos/*` — **`/crear` no está en matcher** (la generación sí exige sesión en API) |
| `requireSessionUser` | Nombre engañoso: retorna null, no throw (`src/lib/session.ts`) |
| SessionProvider | Solo layout site |

### 3.6 Esquema Neon + Prisma

Archivo: `prisma/schema.prisma`.

| Modelo | Rol | Notas |
|--------|-----|-------|
| `User` | Cuenta | email unique, role USER\|ADMIN |
| `FamilyProfile` | 1:1 user | `perfil` Json, schemaVersion |
| `Story` | Catálogo editorial | slug, accentCode, variant, status, htmlPath… |
| `GeneratedStory` | Salida IA | title, bodyMarkdown, recipe Json, source, model; **`userId` string nullable sin `@relation` FK** |

Enums: `UserRole`, `StoryStatus`, `StoryVariant` (NARRATIVE\|APARTMENT\|PILOT).  
Migraciones: init, generated_stories, accent default neutro.  
**Seed:** limpia `Story`; no publica demos.

---

## 4. Sistema editorial (corazón del proyecto)

### 4.1 Corpus curado

| Fuente | Cantidad | Calidad / notas | Última señal |
|--------|----------|-----------------|--------------|
| `cuentos/*.md` | **0** | README dice catálogo vacío a propósito (jul 2026) | README 2026-07-10 |
| Manifest `sources` | **0** | `generatedAt` 2026-07-12 | sync script |
| `public/cuentos/*.html` | **3** | demos guest; no pairados en `sync-story-html` (`PAIRS=[]`) | archivos presentes |
| Seed DB `Story` | **0** tras seed | wipe only | seed.ts |
| `tmp/trial-stories` | **16** md | dumps de calidad variable (debug, no canónicos) | 2026-07-12 |
| Few-shots código | 4 acentos × 3 fragmentos | Hardcode oral/fantasía reciente | `story-prompt-examples.ts` |
| `CLASSIC_PLANTILLAS` | **[]** | `/crear/plantillas` vacío | `story-plantillas.ts` |

**Conclusión:** no hay “biblioteca dorada” versionada. El producto editorial vivo es el **prompt**.

### 4.2 Inyección de few-shots (mecanismo real)

1. `buildStoryPrompt` (`story-prompt.ts`) arma `user` incluyendo `buildFewShotBlock(accentCode)`.
2. `buildFewShotBlock` (`story-prompt-examples.ts`) selecciona set por acento y pega tres bloques etiquetados (apertura, diálogo, aventura) con instrucción de **imitar, no copiar trama**.
3. Van en **cada request** al proveedor (junto a system: core + léxico + voz acento; user: receta, edad, variedad).
4. **No** leen `cuentos/*.md`.

Semillas: `buildVarietySeedBlock` elige mundo (~12% espacio), rol, deseo, acción, humor, emoción, cierre, hábito.

### 4.3 `validate:quality` — existe y qué valida

- npm script → `tsx scripts/validate-story-quality.mjs`.
- Núcleo: `src/lib/story-quality.ts`.
- Checks (umbral): palabras 350–600 (warn), escenas 3–5, avg sentence ≤22 palabras, oraciones/párrafo ≤5, diálogo ≥12% (info), sensores ≥4, regulación ≥2 (info), sermón = error, abstract ≤2, subtítulo moraleja = error.
- Pass: 0 errores y ≤3 warns.
- Script filtra slugs seed publicados con `familyTag: chacachon` ∩ manifest → **con seed vacío sale OK “estante vacío”**. **No valida** demos HTML ni trials en `tmp/`.

También existe `validate:catalog` (consistencia manifest/redirects; hoy trivialmente OK).

### 4.4 Biblia editorial vs código — ¿los “7 pilares”?

En `docs/biblia-editorial.md` §1 hay **7 ítems numerados** (mundo reconocible casa/colegio; personal; pedagógico sin sermón; humor reconocimiento; ritmo oral; toque mágico Había una vez; sin marca). El footer dice **“cinco pilares”** — **INCONSISTENCIA interna de la biblia**.

| Pilar biblia | ¿Reflejado en prompt/`story-quality`? |
|--------------|----------------------------------------|
| 1 Mundo casa/barrio sensorial | **Contradicho** por prompt: mundo inventado con gancho; **prohibido** default sala/TV. |
| 2 Personal / agencia | Sí (receta/perfil). |
| 3 Sin sermón | Sí (prompt + quality error). |
| 4 Humor reconocimiento | Sí, pero prompt empuja colombianada/Chavo-espíritu vs humor solo cotidiano casa. |
| 5 Oído / frases cortas | Sí (edad 6–8 ≤12–15 palabras; quality avg ≤22). |
| 6 Había una vez | Sí + sanitizer; biblia ancla “mundo del niño”, prompt ancla **mundo inventado**. |
| 7 Sin Chacachón | Sí. |

**INCONSISTENCIA grave:** biblia (casa) vs prompt (fantasía bosque/aldea) vs demos guest (domésticos) vs quality que **premia** regex “regulación” tipo cuerpo (cercano al catálogo clínico que el prompt prohíbe).

Extensión: biblia/quality **350–600**; prompt core **400–700**.

Acentos: biblia menciona regionales amplios; código solo `neutro|bogota_rolo|bogota_ninos|bogota_cachaco` (`story-accent.ts` + `GuiaAcentos.md`).

---

## 5. Documentación — auditoría de consistencia

### 5.1 Inventario `docs/`

| Archivo | Líneas (~) | ¿Actualizado vs código? | Hallazgos |
|---------|------------|-------------------------|-----------|
| `brief-proyecto-chacachon.md` | 104 | Parcialmente sí (producto) | Corpus “futuro” honesto; no documenta trial limits OFF ni plantillas vacías. |
| `biblia-editorial.md` | 269 | **Desfasada** en mundo narrativo | Footer 5 vs 7 pilares; §10 antes de §9; ejemplos tablet/casa vs prompt. |
| `roadmap.md` | 138 | Mayoría features ✅ correctas | Aún dice fuentes en `cuentos/*.md`; A8 Gemini pago pendiente. |
| `ia-generacion.md` | 302 | Stack generación OK-ish | Habla pulir demos/few-shots ricos; corpus vacío. |
| `architecture.md` | 131 | Stack OK | Banner “Sprint 0”; implica fuentes md vivas. |
| `database.md` | 110 | Modelos OK | “Solo PUBLISHED → public/cuentos” vs demos HTML sin filas seed. |
| `demo-mode.md` | 87 | Trial/docs reciente | Alguna fila aún vibra “mock”; luego documenta API — residual. |
| `crear-flow.md` | 198 | Wizard sí | Ref `operacion-a-dormir` / plantillas obsoleto. |
| `compartir-cuentos.md` | 53 | OG sí | URL `/leer/operacion-a-dormir` **rota**. |
| `access-and-services.md` | 126 | Auth/servicios mezclado | Claim **“seed 4+ historias”** falso. |
| `guia-neuroeducacion-cuentos.md` | 106 | Referencia / conflicto | Empuja moraleja/regulación clínica / PEER — choca con biblia anti-sermón y prompt anti-catálogo. |
| `legacy-static-index.html` | — | Archivo | No es doc vivo. |

Root docs no en `docs/`: `StackTecnico.md` (Claude-primary viejo), `GuiaAcentos.md` (amplia vs código limitado), `README.md` breve, `contextonew.md` / `ContextoChacachon.md` legacy possible.

### 5.2 Lista específica de inconsistencias

1. **Mundo narrativo:** brief + prompt = fantasía; biblia + demos + crear defaults históricos = casa/apartamento.  
2. **Corpus:** roadmap/architecture hablan de `cuentos/*.md`; carpeta vacía.  
3. **Seed count:** `access-and-services` “4+” vs seed wipe 0.  
4. **Demos vs regla DB→HTML:** database.md vs 3 HTML sin Story PUBLISHED.  
5. **Proveedor primario:** StackTecnico/Contexto Claude-first vs código Gemini-first.  
6. **Trial limits:** UI “1 cuento”, código default 2/día IP, flag **disabled**.  
7. **Palabras objetivo:** 350–600 vs 400–700.  
8. **Pilares:** 7 en §1, “cinco” en footer biblia.  
9. **Numeración biblia:** sección 10 aparece antes que 9.  
10. **Slug operacion-a-dormir** citado en compartir/crear-flow — ausente.  
11. **Quality vs prompt** en señales corporales de emoción.  
12. **Plantillas:** docs B4 “prefill” vs arrays vacíos.  
13. **`GeneratedStory.userId`** sin FK pese a docs de “propiedad”.  
14. **Neuroeducación** vs anti-sermón producto.  
15. **Few-shots:** biblia §10 sugiere corpus md; realidad = TS hardcode.

---

## 6. Deuda técnica y gaps conocidos

### 6.1 TODOs/FIXMEs

- Búsqueda `TODO|FIXME|HACK|XXX` en `src`/`scripts`: **sin matches**.  
- Comentario **TEMP** explícito: `src/lib/trial-ai-limits.ts` — límites trial OFF salvo `TRIAL_AI_LIMITS_DISABLED=0`.

### 6.2 Tests vs cobertura

| Métrica | Valor |
|---------|-------|
| Archivos `*.test.ts` | **28** |
| Líneas tests (~) | **1826** |
| Áreas cubiertas | prompt, markdown/bookends, quality, trial, pagination, limits, moderation, recipe, onboarding, telemetry, accents… |
| No cubierto / débil | E2E browser; rutas API integration reales; HTML demos; validación calidad de salida LLM; ownership prod edge cases |

CI corre unit + typecheck + lint + catalog/quality + build (DB dummy).

### 6.3 Mencionado en docs / no implementado (o vacío)

- Corpus `cuentos/*.md` y few-shots derivados del corpus.  
- Seed de historias publicadas.  
- `sync-story-html` pairs.  
- Plantillas clásicas pobladas.  
- Monetización Wompi/MP / freemium.  
- Import trial → `GeneratedStory` del mismo texto.  
- Multi-acento nacional completo de GuiaAcentos.  
- A8 plan Gemini pago (proceso, no código).  
- Retención W4 / analytics de negocio (no hay evidencia de producto en repo).

### 6.4 Riesgos técnicos evidentes

| Riesgo | Detalle |
|--------|---------|
| Costo LLM trial | Límites OFF → abuso anónimo fácil si la URL es pública. |
| Temp Gemini 1.05 | Alta creatividad; alimenta deriva de tono. |
| Prompt largo | ~núcleo 7k+ chars + few-shots + léxico + seeds → reglas medias se diluyen. |
| Sin FK GeneratedStory→User | Integridad referencial débil; huérfanos posibles. |
| `/crear` sin middleware | Mitigado por API 401; UI puede mostrar wizard a guests hasta generar. |
| Moderación substring | Evita lo grosero obvio; no es classifier semántico. |
| Fallback mock silencioso | Usuario puede no notar que no hubo IA (salvo source en payload). |
| Memoria fallback GeneratedStory | Solo no-prod; prod exige DB (bien documentado en roadmap A5). |
| Docs podados confunden agentes | Corpus “existe” en texto y no en disco. |
| `dev/trial-story` sin auth | Mitigado por 404 prod; en local escribe disco. |

---

## 7. Snapshot de métricas simples

### 7.1 Código (aprox., 2026-07-13)

| Área | Archivos | Líneas (~) |
|------|----------|------------|
| `src/lib` (sin tests) | 53 | 6913 |
| `src/lib` tests | 28 | 1826 |
| `src/components` | 33 | 5386 |
| `src/app` | 33 | 2192 |
| `scripts` | 11 | 956 |
| `docs/*.md` | 11 | 1624 |
| App code (lib+comp+app, sin tests) | 119 | **~14491** |

Módulos editoriales densos: `trial-story.ts` 885 · `story-prompt.ts` 447 · `story-quality.ts` 285 · `story-generation.server.ts` 246.

### 7.2 Cuentos

| Tipo | N |
|------|---|
| Curados md | 0 |
| Demo HTML guest | 3 |
| Filas Story tras seed limpio | 0 |
| Trials debug md | 16 (incl. `latest.md`) |

### 7.3 Últimos commits relevantes por área (git log -1)

| Área | Commit | Fecha | Mensaje corto |
|------|--------|-------|---------------|
| Prompt / voice | `7cfa8c2` | 2026-07-12 | Harden trial story voice + end CTA |
| StoryReader / CSS CTA | `7cfa8c2` | 2026-07-12 | mismo |
| API cuentos | `7cfa8c2` | 2026-07-12 | mismo (probar/dev) |
| Docs (batch previo) | `14cb5c3` etc. | 2026-07-11 | tune voice / openings |
| Prisma accent | `9ef00a3` | 2026-07-10 | Default accent neutro |

Serie 2026-07-11: sanitizers Había una vez, trial limits TEMP off, reader titles, trial UX.

---

## 8. Preguntas abiertas para decisión humana

1. **¿Cuál es la fuente de verdad editorial?** ¿Biblia (casa/pertenencia) o prompt actual (fantasía bosque/aldea)? Hay que unificar docs y demos guest.  
2. **¿Se reconstruye el corpus en `cuentos/*.md` o se abandona el modelo “manifest+seed” a favor de solo demos HTML + IA?** Hoy el pipeline de sync/validate es un no-op útil.  
3. **¿El trial debe poder “guardar este cuento” en la cuenta** (import markdown) o solo empujar a crear otro?  
4. **¿Reactivar límites trial en producción ahora** o solo tras A8 (Gemini pago)? Riesgo de costo vs fricción.  
5. **¿Temperature 1.05** se mantiene (variedad) o se baja para control editorial?  
6. **¿Las plantillas `/crear/plantillas` se llenan con clásicos** o se oculta la ruta hasta tener contenido?  
7. **¿`GeneratedStory.userId` gana FK real** y política de borrado/cascade?  
8. **¿`guia-neuroeducacion`** es normativa de producto o archive?** Si es normativa, choca con anti-sermón.  
9. **Alcance de acentos:** ¿seguir solo Bogotá+neutro o implementar guía completa?  
10. **¿El CTA post-trial callbackUrl=`/crear` es correcto** o debería ser `/familia` / onboarding corto primero?

---

## Apéndice A — Mapa rápido de APIs

| Ruta | Auth | Función |
|------|------|---------|
| `POST /api/cuentos/probar` | No | Trial IA |
| `POST /api/cuentos/generar` | Sí | IA + save |
| `GET /api/cuentos/cuota` | Sí | Quota UI |
| `GET/PUT /api/familia/perfil` | Sí | Perfil JSON |
| `GET /api/familia/export` | Sí | Export Ley 1581 |
| `DELETE /api/familia/cuenta` | Sí | Borrar cuenta |
| `GET /api/familia/demo-interpolacion` | Sí | Demo strings |
| `POST /api/dev/trial-story` | No (404 prod) | Dump tmp |
| `/api/auth/[...nextauth]` | — | Google |

## Apéndice B — Archivos “tocar primero” para otra IA

Si el siguiente trabajo es **calidad narrativa:** `src/lib/story-prompt.ts`, `story-prompt-examples.ts`, `story-colombian-lexicon.ts`, `story-markdown.ts`, `docs/biblia-editorial.md` (reconciliar).  

Si es **producto/conversión:** `TrialStoryForm.tsx`, `leer/prueba/page.tsx`, `trial-ai-limits.ts`, posible bridge trial→DB.  

Si es **catálogo:** `cuentos/`, `prisma/seed.ts`, `sync-story-*.mjs`, `story-plantillas.ts`, `DEMO_SHOWCASE_STORIES`.  

Si es **seguridad/costo:** `trial-ai-limits.ts`, `generation-limits.ts`, `content-moderation.ts`, env keys.

## Apéndice C — Lo que este snapshot no incluye

- Contenido secretos `.env` / claves reales.  
- Métricas de producción (Vercel analytics, costos Gemini) — no están en el repo.  
- Diff línea a línea de cada trial en `tmp/`.  
- Auditoría de accesibilidad visual completa del CSS del lector.

---

---

## Apéndice D — Inventario `src/lib` (archivos de dominio, sin tests)

| Archivo | ~LOC | Propósito |
|---------|------|-----------|
| `active-profile.ts` | 197 | Perfil activo multi-miembro en cliente |
| `admin.ts` | 20 | `ADMIN_EMAILS` → rol |
| `auth.ts` | 65 | NextAuth options Google + JWT |
| `book-carousel.ts` | 102 | Lógica estantería/carrusel |
| `book-theme.ts` | 114 | Temas de papel lector |
| `brand-illustration*.ts` | ~30 | Marca / ilustración server |
| `brand-mark-svg.ts` | 115 | SVG marca |
| `content-moderation.ts` | 92 | Bloqueo URL/HTML/email/tel/slang |
| `create-story.ts` | 20 | Helpers crear |
| `family-profile-builder.ts` | 418 | Construcción/edición ficha familia |
| `family-profile-completion.ts` | 105 | Completitud onboarding |
| `family-profile-schema.ts` | 96 | Zod perfil |
| `generate-story-guards.ts` | 65 | Auth+Zod+moderation para `/generar` |
| `generated-stories.server.ts` | 167 | CRUD GeneratedStory + memory fallback no-prod |
| `generated-story-labels.ts` | 21 | Labels UI source |
| `generation-limits.ts` | 57 | Cuota 24h usuario |
| `generation-telemetry.ts` | 114 | Logging costo estimado / alertas |
| `interpolation.ts` | 203 | Sustitución nombres en demos |
| `markdown-frontmatter.ts` | 26 | Frontmatter parse |
| `merge-family-profile.ts` | 34 | Merge PUT perfil |
| `onboarding.ts` | 93 | `DEMO_SHOWCASE_STORIES` + guest UX |
| `prisma.ts` | 15 | Client singleton |
| `reader-profile.ts` | 49 | Perfil en contexto lector |
| `recipe-preview.ts` | 35 | Preview sin gastar cuota |
| `recipe-selection.ts` | 63 | Selección receta |
| `recipe-summary.ts` | 390 | Resumen receta / blurb |
| `route-fade.ts` | 25 | Animación rutas |
| `session.ts` | 44 | getSessionUser* |
| `site-url.ts` | 5 | URL canónica |
| `stories.ts` | 188 | Catálogo Story DB + fallbacks |
| `story-accent.ts` | 95 | Acentos + labels + voice block |
| `story-book-dom-pagination.ts` | 471 | Paginar bloque DOM |
| `story-book-pages.ts` | 79 | Tipos página libro |
| `story-colombian-lexicon.ts` | 70 | Prefer/evitar/dichos |
| `story-content-index.ts` | 55 | Índice contenido |
| `story-content-loader.server.ts` | 21 | Carga md cuentos |
| `story-generation.server.ts` | 246 | Orquestación LLM |
| `story-markdown.ts` | 289 | Parse + bookends fairy |
| `story-mock.ts` | 70 | Plantilla fallback |
| `story-paragraph-split.ts` | 36 | Troceo párrafos |
| `story-personalization.ts` | 111 | Personalizar lectura slug |
| `story-plantillas.ts` | 56 | Prefills (vacío) |
| `story-prompt-examples.ts` | 80 | Few-shots |
| `story-prompt.ts` | 447 | System/user prompt builder |
| `story-quality.ts` | 285 | Métricas QA markdown |
| `story-reader.ts` | 71 | Tipos PersonalizedStoryContent |
| `story-recipe.ts` | 262 | Catálogo ingredientes wizard |
| `story-share.ts` | 57 | Share helpers |
| `trial-ai-limits.ts` | 154 | Límites trial (OFF default) |
| `trial-story-debug-save.server.ts` | 69 | Dump `tmp/trial-stories` |
| `trial-story.ts` | 885 | Modelo trial + mock + age bands + moments |

## Apéndice E — Inventario componentes UI principales

| Componente | ~LOC | Rol |
|------------|------|-----|
| `StoryRecipeBuilder.tsx` | 1051 | Wizard `/crear/adaptar` |
| `TrialStoryForm.tsx` | 653 | Flujo `/probar` |
| `FamilyProfileBuilder.tsx` | 602 | Ficha familia |
| `StoryReader.tsx` | 531 | Lector libro + endConversion |
| `StoryBookshelf.tsx` | 430 | Estantería home |
| `FamilyMemberSheet.tsx` | 243 | Sheet miembro |
| `ProfilePicker.tsx` | 183 | Selector perfiles |
| `CrearHub.tsx` | 130 | Hub `/crear` |
| `RecipeGenerationPreview.tsx` | 131 | Preview + cuota |
| `SkyScenery.tsx` | 128 | Escenario cielo home |
| `OnboardingGate.tsx` | 121 | Gate onboarding |
| `StoryPageBlocks.tsx` | 104 | Bloques página |
| `StoryBook.tsx` | 99 | Shell libro |
| `SiteHeader.tsx` | 92 | Header |
| `StoryShareButton.tsx` | 78 | Compartir |
| `CreateStorySlot.tsx` | 80 | Slot CTA crear |
| resto | <70 c/u | Auth, brand, gates, footer, SW |

## Apéndice F — Trial: momentos, clásicos, acompañantes

Fuente: `src/lib/trial-story.ts`.

**Momentos (`TRIAL_MOMENTS`):** `pantallas`, `dormir`, `compartir`, `verduras`.  
**Clásicos:** `cerditos`, `caperucita`, `renacuajo`, `cabritos`.  
**Age bands:** `3-5`, `6-8` (default), `9-12` — cada una con `guidance` inyectada al prompt.  
**Acompañantes:** mamá, papá, hermano/a, abuelo/a, amigo/a.  
**Mascotas:** perro, gato, otra.  
**Lecciones catalog:** respeto, responsabilidad, hábitos, prudencia, valentía, empatía, autoestima, generosidad (semilla; el prompt pide implícito).

**INCONSISTENCIA verbal:** el path se llamó “Historia de casa” en commits, pero el prompt empuja **no** ambientar en la casa.

## Apéndice G — Variables de entorno (desde `.env.example` + uso en código)

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` / `DIRECT_URL` | Prisma / Neon |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Auth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth |
| `ADMIN_EMAILS` | Roles admin |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Provider 1 |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Provider 2 |
| `GENERATION_DAILY_LIMIT` | Default 3 / 24h |
| `GENERATION_COST_ALERT_USD` | Telemetría alerta |
| `TRIAL_AI_DAILY_PER_IP` | Default 2 si límites ON |
| `TRIAL_AI_LIMITS_DISABLED` | Forzar ON/OFF explícito |
| `SAVE_TRIAL_STORIES` | Dump tmp en prod si `1` |
| `NODE_ENV` | Branching prod |

Archivos locales presentes en máquina de desarrollo (no commitear): `.env`, `.env.local` (verificados solo por existencia; contenido no auditado aquí).

## Apéndice H — Scripts npm y artefactos

| Script | Qué hace en la práctica hoy |
|--------|------------------------------|
| `predev` / `prebuild` | sync manifest + validate catalog (no-op útil) |
| `sync:cuentos` | Reescribe manifest vacío |
| `sync:html` | No copia nada (`PAIRS=[]`) |
| `validate:catalog` | Pasa con redirects `[]` |
| `validate:quality` | Pasa con estante vacío |
| `test` | vitest unit |
| `db:seed` | Borra stories |
| `setup:neon` / `setup:vercel-*` | Ops |

**next.config.ts:** CSP enforce; `outputFileTracingIncludes` aún apunta a `./cuentos/**/*` para `/leer/[slug]` aunque el corpus esté vacío — señal de arquitectura legada. Redirects desde `story-redirects.json` vacío. `connect-src 'self'` OK porque LLM es server-side.

## Apéndice I — Migraciones Prisma

1. `20260706000000_init` — users, family_profiles, stories…  
2. `20260709000000_generated_stories` — generated_stories  
3. `20260710220000_story_accent_default_neutro` — default accent  

## Apéndice J — Tests unitarios (lista de archivos)

Los 28 `*.test.ts` viven bajo `src/lib/` e incluyen, entre otros:  
`story-generation`, `story-markdown`, `story-quality`, `story-colombian-lexicon`, `story-book-dom-pagination`, `trial-story`, `trial-ai-limits`, `generation-limits`, `content-moderation`, `generate-story-guards`, `generation-telemetry`, `recipe-*`, `family-profile-builder`, `onboarding`, `active-profile`, `story-share`, `story-plantillas`, `story-paragraph-split`, `book-carousel`, `story-content-index`, `generated-story-labels`.

No hay Playwright/Cypress en `package.json`.

## Apéndice K — Lector: piezas técnicas

| Pieza | Path | Nota |
|-------|------|------|
| Hook paginación | `src/hooks/useBookPagination.tsx` | ResizeObserver; remide viewport |
| DOM paginator | `story-book-dom-pagination.ts` | Evitar dups al avanzar bloques (arreglo reciente) |
| End CTA | `StoryReader` + CSS `book-reader__end-conversion` | Siempre montado, visible solo última página (anti-flicker) |
| Progreso | footer reader | localStorage page index |
| Temas papel | `book-theme.ts` + data-paper | cuento/cuaderno |

## Apéndice L — Roadmap vs realidad (tabla corta)

| ID roadmap | Estado doc | Verificación código |
|------------|------------|---------------------|
| A1–A7 | ✅ | Coincide en lo esencial |
| A8 Gemini pago | Pendiente | Proceso/negocio; no código |
| B1–B7 | ✅ | Coincide; B4 prefill existe pero plantillas vacías |
| C1–C4 | No empezado | Correcto |
| Contenido `cuentos/*.md` | “tenemos” | **Falso** — solo README |

## Apéndice M — Demostraciones guest (detalle)

| Slug | HTML | Variant en onboarding |
|------|------|------------------------|
| `demo-noche-en-casa` | `public/cuentos/demo-noche-en-casa.html` | APARTMENT |
| `demo-el-trancon` | `…/demo-el-trancon.html` | NARRATIVE |
| `demo-bingo-detective` | `…/demo-bingo-detective.html` | PILOT |

Se abren como **páginas estáticas** (`/cuentos/...html`), no pasan por `StoryReader` ni personalización pesada del pipeline IA. **INCONSISTENCIA** con brief “fantasía-first”: al menos `noche-en-casa` es doméstico.

## Apéndice N — Perfiles fixture

| Archivo | Uso |
|---------|-----|
| `perfiles/familia-chacachon.json` | Marca / demos locales |
| `perfiles/balcutron.json` | Fixture espacial |
| `perfiles/garcia-bogota.json` | Familia ficticia |
| `scripts/resolver-perfil.mjs` | Resolución CLI mencionada en README perfiles |

## Apéndice O — Glosario de términos del repo

| Término | Significado en este código |
|---------|----------------------------|
| Receta | Selección de ingredientes para generar |
| Trial | Generación anónima `/probar` |
| Bookends | Había una vez + colorín colorado |
| Manifest | Índice `cuentos/*.md` → JSON (vacío) |
| Showcase | 3 demos HTML guest |
| GeneratedStory | Fila IA guardada |
| Story | Fila catálogo editorial |
| Neutro | Acento default Colombia clara |
| Variety seed | Bloque random anti-clon |

## Apéndice P — Cronología reciente (git, extracto)

| Fecha | Temas de commits |
|-------|------------------|
| 2026-07-12 | Prompt voice harden, CTA end-slot, lexicon path, tmp visible |
| 2026-07-11 | Sanitizers Había una vez; trial AI limits TEMP off; reader CSS titles; trial UX age/companions/summary; anonymous AI trial |
| 2026-07-10 | Accent default neutro; (docs/seed vaciado corpus) |

## Apéndice Q — Cómo debería usarse este snapshot

1. Adjuntar a un proyecto Claude junto con `brief-proyecto-chacachon.md`.  
2. Si la tarea es editorial: forzar lectura también de `story-prompt.ts` (estado real) y tratar `biblia-editorial.md` como **desalineada** hasta reconciliar.  
3. Si la tarea es producto: no asumir corpus ni plantillas; asumir trial + generar + mis-cuentos.  
4. No inventar archivos en `cuentos/` — al 2026-07-13 no existen historias md.

## Apéndice R — Checklist de reconciliación doc↔código (pendiente humana)

- [ ] Reescribir biblia §1 al norte fantasía **o** revertir prompt a casa.  
- [ ] Corregir footer “cinco pilares”.  
- [ ] Reordenar §§ 9–10 biblia.  
- [ ] Actualizar `access-and-services` seed count.  
- [ ] Quitar o cumplir URLs `operacion-a-dormir`.  
- [ ] Alinear roadmap “fuentes en cuentos/*.md”.  
- [ ] Decidir destino de `guia-neuroeducacion`.  
- [ ] Actualizar StackTecnico Gemini-first.  
- [ ] Documentar trial limits OFF en brief.  
- [ ] Aclarar en demo-mode: HTML estático ≠ StoryReader.

## Apéndice S — Estimación honesta de “completitud”

| Dimensión | % | Comentario |
|-----------|---|------------|
| App shell / auth / DB | 90 | Listo para uso controlado |
| Loop generar-leer-guardar (logueado) | 85 | Falta pulir UX plantillas |
| Trial → conversión | 70 | CTA existe; no importa el cuento |
| Seguridad costo trial | 40 | Limits OFF |
| Sistema editorial durable | 25 | Prompt sí; corpus no |
| Docs consistentes | 45 | Muchas contradicciones |
| Monetización | 0 | Roadmap C |
| **Producto MVP vendible con calidad de marca estable** | **~55** | App sí; voz de marca aún frágil |

---

## Apéndice T — Mapa completo de rutas App Router

### Site (`src/app/(site)/`)

| Ruta URL | File page | Notas |
|----------|-----------|-------|
| `/` | `(site)/page.tsx` | Home + bookshelf guest/user |
| `/probar` | `probar/page.tsx` | Trial form |
| `/login` | `login/page.tsx` | Google |
| `/crear` | `crear/page.tsx` | Hub |
| `/crear/adaptar` | `crear/adaptar/page.tsx` | Wizard receta |
| `/crear/plantillas` | `crear/plantillas/page.tsx` | Lista vacía |
| `/familia` | `familia/page.tsx` | Perfil (protegida middleware) |
| `/perfiles` | `perfiles/page.tsx` | Multi-perfil |
| `/mis-cuentos` | `mis-cuentos/page.tsx` | Biblioteca IA (protegida) |
| `/admin` | `admin/page.tsx` | Catálogo read-only si ADMIN |
| `/privacidad` | `privacidad/page.tsx` | Legal |

### Reader (`src/app/(reader)/`)

| Ruta URL | File | Notas |
|----------|------|-------|
| `/leer/prueba` | `leer/prueba/page.tsx` | Trial sessionStorage |
| `/leer/generado/[id]` | `leer/generado/[id]/page.tsx` | Owner check |
| `/leer/[slug]` | `leer/[slug]/page.tsx` | Catálogo; necesita Story/md |
| OG `[slug]` | `leer/[slug]/opengraph-image.tsx` | Share cards |

### Estático

| URL | Origen |
|-----|--------|
| `/cuentos/demo-*.html` | `public/cuentos/` |
| PWA | `src/app/manifest.ts` + SW register |

## Apéndice U — CI pipeline (hecho)

`.github/workflows/ci.yml` en push/PR a `main`:

1. `npm ci` (Node 22)  
2. `validate:catalog`  
3. `validate:quality`  
4. `typecheck`  
5. `lint`  
6. `test`  
7. `build` con `DATABASE_URL` y `NEXTAUTH_*` dummy  

**Implicación:** CI **no falla** por corpus vacío; da falsa sensación de “catálogo sano”.

## Apéndice V — `story-quality` heurísticas (sin regex raw)

| Señal | Qué busca a alto nivel | Severidad |
|-------|------------------------|-----------|
| Sermón | Frases tipo “la moraleja es / aprendimos que / desde ese día…” | error |
| Subtítulo moral | Subtítulo con “moraleja” | error |
| Extensión | Fuera 350–600 palabras | warn |
| Escenas | Fuera 3–5 `##` | warn |
| Frases largas | Promedio >22 palabras/oración | warn |
| Párrafos densos | >5 oraciones/párrafo | warn |
| Diálogo | Poca raya `—` | info |
| Sensorial | Pocas hits olfato/tacto/sonido… | warn |
| Regulación | Hits de cuerpo/respiración/calma | info (choca con prompt anti-clínico) |

## Apéndice W — Contratos de respuesta API (resumen)

**`POST /probar` éxito:** markdown + meta (nombre, age, source, model…). Cliente persiste v3.  
**`POST /probar` 429:** error visible; **sin** mock.  
**`POST /probar` otros errores:** mock client-side posible.  
**`POST /generar` éxito:** `{ id }` → redirect reader.  
**`POST /generar` 401/400/429/500:** formularios manejan mensajes.  
**Quota GET:** used/limit/remaining window 24h.

## Apéndice X — Seguridad superficial

| Control | Estado |
|---------|--------|
| CSP headers | Activo (next.config) |
| `frame-ancestors 'none'` | Sí |
| OAuth Google only | Sí |
| Moderación inputs libres | Sí substring |
| Rate limit edge | No |
| Trial abuse controls | Código sí / default OFF |
| Secrets en git | `.env*` gitignored; example documenta keys |
| Export/delete cuenta | Sí (Ley 1581-ish) |

## Apéndice Y — Lectura recomendada en orden para Claude

1. Este archivo `docs/estado-proyecto-2026-07-13.md`  
2. `docs/brief-proyecto-chacachon.md`  
3. `src/lib/story-prompt.ts` (verdad narrativa actual)  
4. `docs/demo-mode.md` + `docs/crear-flow.md`  
5. `prisma/schema.prisma`  
6. Tratar `biblia-editorial.md` como **borrador conflictivo**, no como spec final  

## Apéndice Z — Resumen de hallazgos críticos (una página)

1. App MVP **sí corre** el ciclo trial/generar/leer/guardar.  
2. Corpus editorial **cero**; validators y sync son casi ceremoniales.  
3. Prompt jul-2026 = fantasía + oral colombiano; biblia = casa; demos = mixtas.  
4. Gemini-first real; docs viejos Claude-first.  
5. Trial AI limits TEMP off → riesgo $ en tráfico abierto.  
6. Diferenciación de marca hoy = prompt, no biblioteca.  
7. Diez decisiones humanas abiertas en §8.  
8. Este snapshot fecha **2026-07-13**; invalidar tras cambios grandes de prompt/corpus/límites.

---

## Apéndice AA — Archivos root de contexto (fuera de `docs/`)

| Archivo | ~LOC | Rol / cuidado |
|---------|------|----------------|
| `README.md` | 71 | Entrada mínima del repo |
| `GuiaAcentos.md` | 394 | Guía acentos **más amplia** que el enum en código |
| `StackTecnico.md` | 250 | Stack + KPI; partes **Claude-first** desactualizadas |
| `contextonew.md` / `ContextoChacachon.md` | (root) | Contexto legado; no tratar como spec sin cruzar con este snapshot |
| `perfiles/README.md` | — | Fixtures locales |
| `cuentos/README.md` | — | Declara catálogo vacío |

## Apéndice AB — Lo que *sí* está maduro vs lo que *parece* maduro

| Parece maduro | Realidad |
|---------------|----------|
| “Tenemos cuentos en el estante” | 3 HTML demo; seed 0 |
| “validate:quality en CI” | Pasa en vacío |
| “Trial con cuota” | Código existe; default OFF |
| “Biblia = spec” | Conflicto con prompt |
| “Plantillas tradicionales” | Array `[]` |
| “Sprint 0 only” (architecture) | Producto ya MVP operable |

Con estos apéndices el documento cubre código, producto, editorial, docs, deuda, métricas y decisiones abiertas sin dumps de código.

---

*Fin del snapshot 2026-07-13. Generado por auditoría de código + docs del repo `chacachon_stories`.*
