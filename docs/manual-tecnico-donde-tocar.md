# Manual técnico — dónde tocar qué (sin IA)

Guía práctica para modificar Chacachón Stories **tú solo**, sin llamar a un agente.  
Actualizado: **2026-07-15**. Repo: `chacachon_stories`.

Cómo usarla: busca en la tabla “Quiero…” → abre el archivo → cambia el texto/valor → guarda → `npm run dev` y recarga.

**Regla de oro:** casi todos los textos de UI están en componentes `.tsx` (string literal). Colores en `src/app/globals.css`. APIs en `src/app/api/`. BD en `prisma/` + `.env.local`. **No hay S3 hoy** (archivos estáticos van en `public/`).

---

## 1. Arrancar en local (checklist)

```bash
cd ~/MyProjects/balcu-apps/chacachon_stories
cp .env.example .env.local   # solo la primera vez
# Completa DATABASE_URL, NEXTAUTH_*, GOOGLE_*, GEMINI_API_KEY (opcional)
npm install
npm run dev                  # http://localhost:3000
```

| Acción | Comando |
|--------|---------|
| Ver BD | `npm run db:studio` |
| Migrar | `npm run db:deploy` o `npm run db:migrate` |
| Tests | `npm test` |
| Build | `npm run build` |

Variables documentadas: `.env.example`. Detalle BD: `docs/database.md`.

---

## 2. Mapa mental de la app

```
Browser
  → Páginas en src/app/(site)/… y src/app/(reader)/…
  → Componentes en src/components/…
  → APIs en src/app/api/…
  → Lógica en src/lib/…
  → BD Neon vía Prisma (prisma/schema.prisma)
  → Estáticos en public/ (HTML demos, iconos, imágenes)
```

| Zona | Carpeta |
|------|---------|
| Home, login, crear, familia, probar | `src/app/(site)/` |
| Lectores `/leer/...` | `src/app/(reader)/` |
| Botones, forms, header, estante | `src/components/` |
| Prompts IA, auth, cuotas, trial | `src/lib/` |
| Endpoints HTTP | `src/app/api/` |
| Colores / CSS grande | `src/app/globals.css` |
| Schema BD | `prisma/schema.prisma` |

---

## 3. Quiero cambiar… (recetas rápidas)

### Textos, títulos y botones

| Quiero cambiar… | Archivo | Qué buscar |
|-----------------|---------|------------|
| Título grande del home (“Las historIAs…”) | `src/app/(site)/page.tsx` | `<h1 className="title-display` |
| Tagline home (“Cuentos de fantasía…”) | mismo | `home-tagline` |
| Label estante (“Mi biblioteca”, “¿Qué vamos a leer…”) | mismo → props de `StoryBookshelf` | `label=`, `subtitle=` |
| Textos del header (marca, “Crear gratis”) | `src/components/SiteHeader.tsx` | strings / Link |
| Botón login / “Entrar con Google” | `src/components/LoginButton.tsx` | textos del botón |
| Footer | `src/components/SiteFooter.tsx` | strings |
| Título / copy de `/probar` | `src/components/TrialStoryForm.tsx` | `<h1`, `intro-copy` |
| CTA final del trial (“Guardar gratis →”) | `src/app/(reader)/leer/prueba/page.tsx` | `endConversion` (`title`, `body`, `ctaLabel`, `href`) |
| Nav “Anterior / Siguiente” del lector | `src/components/StoryReader.tsx` | `Anterior`, `Siguiente` |
| Hub `/crear` cards | `src/components/CrearHub.tsx` | títulos de opciones |
| Wizard generar (“Crear mi cuento”) | `src/components/StoryRecipeBuilder.tsx` | botones / labels (archivo largo) |
| Página login | `src/app/(site)/login/page.tsx` | copy |
| Privacidad | `src/app/(site)/privacidad/page.tsx` | texto legal |
| Meta título / SEO base | `src/app/layout.tsx` | `metadata` |
| Cards demo guest (títulos de muestra) | `src/lib/onboarding.ts` | `DEMO_SHOWCASE_STORIES` |

**Tip:** en Cursor/VS Code usa búsqueda global (`Cmd+Shift+F`) con una frase exacta del botón. Suele saltar al único archivo.

### Colores y look del home

| Quiero… | Dónde |
|---------|--------|
| Paleta (cielo, cream, honey, coral…) | `src/app/globals.css` — bloque `:root` con `--color-*` |
| Fondo cielo / atmósfera | mismo CSS + componente `src/components/SkyScenery.tsx` |
| Clases Tailwind tipo `text-honey-glow` | suelen mapear a esas CSS vars; cambia la var, no solo una clase |
| Tipografías | `src/app/layout.tsx` (fonts) + CSS `.title-display`, etc. |
| Tema del **papel** del lector (cuento/cuaderno) | `src/lib/book-theme.ts` + CSS `[data-paper=…]` en `globals.css` |
| Logo / ilustración hero | `src/components/BrandIllustration.tsx` + assets en `public/images/brand/` |
| Iconos PWA | `public/icons/` + script `npm run generate:icons` |

### Rutas (URLs) de pantallas

Cada carpeta bajo `src/app/.../page.tsx` = una URL:

| URL | Archivo page |
|-----|----------------|
| `/` | `src/app/(site)/page.tsx` |
| `/probar` | `src/app/(site)/probar/page.tsx` |
| `/login` | `src/app/(site)/login/page.tsx` |
| `/crear` | `src/app/(site)/crear/page.tsx` |
| `/crear/adaptar` | `src/app/(site)/crear/adaptar/page.tsx` |
| `/crear/plantillas` | `src/app/(site)/crear/plantillas/page.tsx` |
| `/familia` | `src/app/(site)/familia/page.tsx` |
| `/perfiles` | `src/app/(site)/perfiles/page.tsx` |
| `/mis-cuentos` | `src/app/(site)/mis-cuentos/page.tsx` |
| `/privacidad` | `src/app/(site)/privacidad/page.tsx` |
| `/admin` | `src/app/(site)/admin/page.tsx` |
| `/leer/prueba` | `src/app/(reader)/leer/prueba/page.tsx` |
| `/leer/generado/[id]` | `src/app/(reader)/leer/generado/[id]/page.tsx` |
| `/leer/[slug]` | `src/app/(reader)/leer/[slug]/page.tsx` |
| `/cuentos/demo-….html` | `public/cuentos/*.html` (estático, no React) |

Layout site (header/footer en casi todas): `src/app/(site)/layout.tsx`.  
Layout lector: `src/app/(reader)/layout.tsx`.

### APIs (métodos HTTP)

| Quiero… | Archivo |
|---------|---------|
| Cambiar lógica del **trial** IA | `src/app/api/cuentos/probar/route.ts` |
| Cambiar lógica de **generar** (logueado) | `src/app/api/cuentos/generar/route.ts` |
| Cuota diaria UI | `src/app/api/cuentos/cuota/route.ts` + `src/lib/generation-limits.ts` |
| Auth Google | `src/app/api/auth/[...nextauth]/route.ts` + `src/lib/auth.ts` |
| Perfil familiar GET/PUT | `src/app/api/familia/perfil/route.ts` |
| Exportar cuenta | `src/app/api/familia/export/route.ts` |
| Borrar cuenta | `src/app/api/familia/cuenta/route.ts` |
| Dump debug trial a disco | `src/app/api/dev/trial-story/route.ts` |
| Protección de rutas (login obligatorio) | `src/middleware.ts` (matcher) |

Cada `route.ts` exporta funciones `GET`, `POST`, `PUT`, `DELETE` = el método HTTP.

### Generación IA / tono de los cuentos

| Quiero… | Archivo |
|---------|---------|
| Reglas del system prompt | `src/lib/story-prompt.ts` |
| Ejemplos few-shot | `src/lib/story-prompt-examples.ts` |
| Léxico colombiano preferir/evitar | `src/lib/story-colombian-lexicon.ts` |
| Acentos (neutro, rolo…) | `src/lib/story-accent.ts` |
| Orden Gemini → Claude → mock | `src/lib/story-generation.server.ts` |
| Momentos del trial (dormir, pantallas…) | `src/lib/trial-story.ts` |
| Límites trial (ON/OFF) | `src/lib/trial-ai-limits.ts` + env `TRIAL_AI_LIMITS_DISABLED` |
| Había una vez / colorín automático | `src/lib/story-markdown.ts` |
| Temperatura / tokens | `src/lib/story-generation.server.ts` (constantes Gemini) |

Después de cambiar prompts: reinicia `npm run dev` y genera un trial nuevo (no sirve recargar un cuento viejo en sessionStorage).

### Base de datos

| Quiero… | Dónde |
|---------|--------|
| Connection string | `.env.local` → `DATABASE_URL` y `DIRECT_URL` (Neon) |
| Modelos (User, Story, GeneratedStory…) | `prisma/schema.prisma` |
| Cambiar schema | Edita schema → `npx prisma migrate dev --name descripcion` → `npx prisma generate` |
| Ver/editar datos | `npm run db:studio` |
| Seed (hoy vacía el catálogo Story) | `prisma/seed.ts` |
| Cliente Prisma en código | `src/lib/prisma.ts` |
| Listar biblioteca / stories | `src/lib/stories.ts` |
| Guardar cuentos IA | `src/lib/generated-stories.server.ts` |

**No hay S3 / R2 / buckets en el código actual.**  
Imágenes e HTML viven en `public/`. Si más adelante usas Cloudflare R2 (mencionado como futuro en README), habría que añadir cliente y variables nuevas; hoy **no** hay “ruta S3” que editar.

### Auth / Google / admins

| Quiero… | Dónde |
|---------|--------|
| Client ID/Secret Google | `.env.local` `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| URL auth | `NEXTAUTH_URL` (local `http://localhost:3000`; prod la de Vercel) |
| Secret sesión | `NEXTAUTH_SECRET` |
| Emails admin | `ADMIN_EMAILS` (CSV) → `src/lib/admin.ts` |
| Quién puede entrar a `/familia`, `/mis-cuentos` | `src/middleware.ts` |

### Contenido / demos / corpus

| Quiero… | Dónde |
|---------|--------|
| HTML de muestra guest | `public/cuentos/demo-*.html` |
| Lista de muestras en home guest | `src/lib/onboarding.ts` → `DEMO_SHOWCASE_STORIES` |
| Cuentos curados markdown (cuando existan) | `cuentos/*.md` |
| Sync manifest | `npm run sync:cuentos` → `src/data/story-content-manifest.json` |
| Trials guardados en disco (dev) | `tmp/trial-stories/` (visible; no va a git) |
| Fixtures de familia | `perfiles/*.json` |

### Deploy / Vercel

| Quiero… | Dónde |
|---------|--------|
| Variables de producción | Vercel Dashboard → Project → Settings → Environment Variables (mismas keys que `.env.example`) |
| Activar límites trial en prod | `TRIAL_AI_LIMITS_DISABLED=0` |
| Key Gemini/Claude prod | `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` |
| Cuota diaria logueado | `GENERATION_DAILY_LIMIT` (default 3) |

Scripts helpers: `npm run setup:vercel-env`, `setup:vercel-auth-env` (ver `scripts/`).

---

## 4. Flujo “cambio típico” paso a paso

### Ejemplo A — Cambiar el título del home

1. Abre `src/app/(site)/page.tsx`.  
2. Edita el `<h1>…</h1>`.  
3. Guarda. Con `npm run dev` recarga `/`.  
4. Commit cuando quieras: `git add` + `git commit` (solo si lo vas a versionar).

### Ejemplo B — Cambiar texto del botón “Guardar gratis”

1. Abre `src/app/(reader)/leer/prueba/page.tsx`.  
2. En `endConversion`, cambia `ctaLabel`.  
3. Recarga un trial en `/leer/prueba` (última página).

### Ejemplo C — Cambiar color honey

1. Abre `src/app/globals.css`.  
2. En `:root`, cambia `--color-honey` y `--color-honey-glow`.  
3. Recarga; muchos botones/títulos usan esas vars.

### Ejemplo D — Cambiar endpoint de generación

1. Abre `src/app/api/cuentos/generar/route.ts`.  
2. La orquestación LLM está en `src/lib/story-generation.server.ts` (no dupliques lógica en la route).  
3. Prueba con usuario logueado desde `/crear/adaptar`.

### Ejemplo E — Apuntar a otra Neon

1. Copia la connection string nueva en `.env.local` (`DATABASE_URL` + `DIRECT_URL`).  
2. `npm run db:deploy`.  
3. Reinicia `npm run dev`.  
4. En Vercel, actualiza las mismas vars y redespliega.

---

## 5. Qué **no** tocar salvo que sepas por qué

| Archivo / zona | Riesgo |
|----------------|--------|
| `prisma/migrations/` | No editar a mano migraciones ya aplicadas |
| `src/middleware.ts` sin cuidado | Puedes bloquear login o dejar rutas abiertas |
| `next.config.ts` CSP | Puede romper fonts/OAuth/imágenes |
| Borrar `sessionStorage` keys al azar | Trial deja de abrir (`chacachon.trialStory.v3`) |
| Prompt sin probar 2–3 generaciones | Cambios “buenos” en papel rompen el tono |
| `package-lock.json` a mano | Usa `npm install` |

---

## 6. Diagnóstico rápido si “no funciona”

| Síntoma | Mira primero |
|---------|--------------|
| Home sin libros (logueado) | Seed vacío / `getLibraryStories` / Neon |
| Guest sin muestras | `onboarding.ts` + `public/cuentos/` |
| Login Google falla | `NEXTAUTH_URL`, Google console redirect URI |
| Trial no genera IA | `GEMINI_API_KEY`; cascada Claude; mira Network `POST /api/cuentos/probar` |
| Trial 429 | Límites ON; cookie / IP (`trial-ai-limits.ts`) |
| Generar 401 | Debes estar logueado |
| Generar 429 | `GENERATION_DAILY_LIMIT` |
| `/leer/generado/...` 404 | No eres dueño o id inválido |
| Estilos rotos | `globals.css` + hard refresh |
| Prisma errors | `DATABASE_URL`, `npx prisma generate` |

---

## 7. Documentos hermanos (si quieres más detalle)

| Doc | Para qué |
|-----|----------|
| Este manual | **Operación diaria: dónde tocar qué** |
| `docs/estado-proyecto-2026-07-13.md` | Snapshot audit completo |
| `docs/plan-trabajo-chacachon.md` | Plan de fases editorial/producto |
| `docs/architecture.md` | Decisiones de arquitectura |
| `docs/ia-generacion.md` | Detalle IA |
| `docs/crear-flow.md` | Flujo `/crear` |
| `docs/demo-mode.md` | Guest / trial |
| `docs/biblia-editorial.md` | Voz de cuentos (revisar vs prompt) |
| `.env.example` | Lista canónica de variables |

---

## 8. Chuleta de un minuto

1. **Texto UI** → busca la frase → casi siempre un `.tsx` en `app/` o `components/`.  
2. **Color** → `globals.css` `:root`.  
3. **API** → `src/app/api/.../route.ts`.  
4. **BD** → `.env.local` + `prisma/schema.prisma`.  
5. **IA / tono** → `src/lib/story-prompt*.ts`.  
6. **S3** → **no aplica hoy**; usa `public/`.  
7. **Prod** → variables en Vercel + redeploy.

---

*Mantén este archivo al día cuando muevas textos a otro sitio o agregues storage externo (R2/S3).*
