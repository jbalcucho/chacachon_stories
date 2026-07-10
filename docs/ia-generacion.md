# Generación de cuentos con IA

Cómo el flujo **/crear** convierte una receta en un cuento leíble: Gemini (gratis
para la POC), Claude (pago) o plantilla local si no hay key o falla el proveedor.

**Producción:** https://chacachon-stories.vercel.app — configurado julio 2026.

---

## Idea general

1. El usuario arma una receta en `/crear/adaptar` (protagonistas, reto, lección,
   lugar y extras) con `StoryRecipeBuilder`.
2. Al tocar **✨ Crear mi cuento**, el cliente hace `POST /api/cuentos/generar`
   con la selección.
3. El backend valida la receta, genera el cuento (Gemini → Claude → plantilla),
   lo guarda y responde un `id` + `source`.
4. El cliente redirige a `/leer/generado/[id]`, que renderiza el cuento en el
   mismo lector de libro (`StoryReader`).

Todo el contacto con la IA ocurre **en el servidor**: la API key nunca llega al
navegador ni a git.

---

## Proveedor de IA (prioridad)

| Orden | Variable | Quién escribe | Costo típico |
|-------|----------|---------------|--------------|
| 1 | `GEMINI_API_KEY` | Google Gemini | **Capa gratis** (límites) + pago opcional |
| 2 | `ANTHROPIC_API_KEY` | Anthropic Claude | Pago por uso desde el inicio |
| 3 | *(ninguna)* | `story-mock.ts` | Gratis — plantilla con huecos rellenables |

Si el proveedor elegido falla (cuota, rate limit, red), el backend **cae a la
plantilla** para no romper el flujo. El usuario igual ve un cuento; la respuesta
trae `"source": "mock"`.

### Modelos Gemini (fallback automático)

Dentro de Gemini, `story-generation.server.ts` prueba modelos en este orden:

1. `GEMINI_MODEL` (variable de entorno)
2. `gemini-3.1-flash-lite-preview` ← **recomendado para la POC** (probado jul 2026)
3. `gemini-flash-lite-latest`
4. `gemini-flash-latest`

> En la cuenta Chacachón, `gemini-2.0-flash` devolvía **cuota gratis en 0**
> (error 429). No usarlo como default.

---

## POC gratis con Gemini

**Sí:** puedes terminar la POC sin pagar, usando la API gratuita de
[Google AI Studio](https://aistudio.google.com).

### Qué incluye el plan gratis

- Generación de texto **sin tarjeta** (mientras no actives facturación).
- **Límites** de peticiones por minuto y tokens por día/mes.
- Uso moderado (demos, familia, pruebas del flujo) suele bastar para cerrar la POC.

### Qué pasa si te pasas del límite

- Gemini responde **429** (quota exceeded).
- La app genera un cuento con **plantilla local** (`source: "mock"`).
- El flujo no se cae; solo deja de ser IA “de verdad” hasta que pase el límite.

### Privacidad (importante en POC)

En la **capa gratuita**, Google puede usar prompts y respuestas para mejorar
sus modelos. Aceptable para demo con datos ficticios o familia Chacachón; antes
de usuarios reales con datos sensibles, revisar [términos de AI Studio](https://ai.google.dev/gemini-api/terms) y valorar plan de pago.

### Cuentas que NO sirven como API key

| Cuenta | ¿Sirve? |
|--------|---------|
| **Cursor** (IA del editor) | ❌ No da API key para tu producto |
| **Gemini Advanced** (chat en gemini.google.com) | ❌ Es suscripción al chatbot, no la API |
| **Google AI Studio** → Get API key | ✅ Esto es lo que necesitas |

---

## Configuración local

1. Crear key en https://aistudio.google.com → **Get API key**.
2. Pegar en `.env.local` (nunca en git — está en `.gitignore`):

```bash
GEMINI_API_KEY="tu-clave-aqui"
GEMINI_MODEL="gemini-3.1-flash-lite-preview"
```

3. Reiniciar el dev server (`npm run dev`).

### Probar que la key funciona

```bash
node scripts/test-gemini-key.mjs
```

O generar un cuento en `/crear/adaptar` y revisar en Network que el POST a
`/api/cuentos/generar` responde `"source": "gemini"`.

### Claude (opcional, de pago)

```bash
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
```

Solo se usa si **no** hay `GEMINI_API_KEY` o si Gemini falló en todos los modelos.

### Cuotas y telemetría

```bash
GENERATION_DAILY_LIMIT="3"          # cuentos IA / usuario / 24 h
GENERATION_COST_ALERT_USD="0.05"    # warn en logs si el costo estimado supera el umbral
```

Cada generación exitosa escribe un log JSON (`[generation]` o `[generation-cost-alert]`)
con `source`, `model`, tokens (si el proveedor los reporta), `estimatedUsd` y `durationMs`.
Ver `src/lib/generation-telemetry.ts`.

> **A8 aplazado:** seguimos en capa gratis de Gemini mientras se pulen los cuentos
> demo. Activar facturación en AI Studio antes de tráfico masivo.

---

## Configuración en Vercel (producción)

Las keys **no van en el código**. Se configuran en el panel de Vercel o por CLI.

### Panel web

[Vercel → chacachon-stories → Environment Variables](https://vercel.com/jose-balcuchos-projects/chacachon-stories/settings/environment-variables)

| Variable | Valor | Entornos |
|----------|-------|----------|
| `GEMINI_API_KEY` | Key de AI Studio | Production, Preview |
| `GEMINI_MODEL` | `gemini-3.1-flash-lite-preview` | Production, Preview |
| `GENERATION_DAILY_LIMIT` | `3` (opcional) | Production, Preview |
| `GENERATION_COST_ALERT_USD` | `0.05` (opcional) | Production, Preview |

Marcar `GEMINI_API_KEY` como **Sensitive**. Después: **Deployments → Redeploy**.

### Por CLI (mismo patrón que `setup:vercel-env`)

```bash
npx vercel link --project chacachon-stories
# Luego subir desde .env.local (el agente puede automatizarlo con vercel env add)
```

Variables ya configuradas en producción (jul 2026): `GEMINI_API_KEY`, `GEMINI_MODEL`.

### Verificar en producción

```bash
curl -s -X POST https://chacachon-stories.vercel.app/api/cuentos/generar \
  -H 'content-type: application/json' \
  -d '{"selection":{"heroes":[{"id":"p-nico","kind":"persona","label":"Nico"}],"reto":[{"id":"dil-dormir","kind":"dilema","label":"Ir a dormir"}],"aprenden":[],"lugar":[],"mascota":[],"acompanantes":[],"rolReto":[],"objeto":[],"molde":[]}}'
```

Respuesta esperada sin sesión: `401` (`Entra con Google…`). Con cookie de sesión
válida y cuota disponible: `{"id":"...","source":"gemini"}`.

---

## Base de datos (`generated_stories`)

Los cuentos generados se persisten en Neon cuando hay `DATABASE_URL`.

### Qué hace `npm run db:deploy`

1. Lee migraciones SQL en `prisma/migrations/` pendientes de aplicar.
2. Las ejecuta en Postgres **sin borrar datos** (solo `CREATE TABLE`, índices, etc.).
3. Registra en `_prisma_migrations` qué ya corrió.

Migración relevante: `20260709000000_generated_stories` → tabla `generated_stories`.

```bash
npm run db:deploy   # producción / después de cada migración nueva
```

Sin esa tabla, el guardado cae a **memoria del proceso** (útil en local, no
persiste en serverless).

### Esquema resumido

| Campo | Uso |
|-------|-----|
| `title`, `body_markdown` | Cuento para el lector |
| `recipe` | JSON de la receta elegida |
| `source` | `gemini` \| `claude` \| `mock` |
| `model` | Modelo usado (si aplica) |
| `user_id` | Opcional — si había sesión |

Ver [docs/database.md](./database.md).

---

## Contrato de la API

`POST /api/cuentos/generar`

```json
{
  "selection": {
    "heroes": [{ "id": "...", "kind": "persona", "label": "Nico" }],
    "reto": [],
    "aprenden": [],
    "lugar": [],
    "mascota": [],
    "acompanantes": [],
    "rolReto": [],
    "objeto": [],
    "molde": []
  }
}
```

| Código | Respuesta |
|--------|-----------|
| **200** | `{ "id": "uuid", "source": "gemini" \| "claude" \| "mock" }` |
| **400** | Receta inválida, falta protagonista/reto, o texto libre rechazado |
| **401** | Sin sesión |
| **429** | Cuota diaria agotada |
| **500** | Error inesperado |

Mínimo obligatorio: al menos un **protagonista** y un **reto**. Requiere login.

---

## Formato del cuento (Markdown)

Gemini, Claude y el mock devuelven Markdown que el lector parsea:

```markdown
# Título del cuento
> Subtítulo corto

## Nombre de la escena
Párrafos de la escena...
```

Parser: `parseStoryHeader` + `parseBodyBlocks` (`src/lib/story-markdown.ts`).

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/recipe-selection.ts` | Zod de la receta cliente → API |
| `src/lib/story-prompt.ts` | System prompt + mensaje de usuario |
| `src/lib/story-mock.ts` | Plantilla local (no es IA) |
| `src/lib/story-generation.server.ts` | Gemini → Claude → mock + fallback de modelos |
| `src/lib/generate-story-guards.ts` | Auth + Zod + moderación (tests de API) |
| `src/lib/generation-telemetry.ts` | Log JSON + alerta de costo estimado |
| `src/lib/generated-stories.server.ts` | Guardar/leer (Neon o memoria) |
| `src/app/api/cuentos/generar/route.ts` | Endpoint POST |
| `src/app/(reader)/leer/generado/[id]/page.tsx` | Lector del cuento generado |
| `src/components/StoryRecipeBuilder.tsx` | Botón «Crear mi cuento» |
| `scripts/test-gemini-key.mjs` | Probar key sin levantar Next |
| `.env.example` | Plantilla de variables (sin secretos) |

---

## Seguridad de las API keys

| Dónde | ¿Sube a GitHub? |
|-------|-----------------|
| `.env.local` | ❌ No (`.gitignore`) |
| Vercel Environment Variables | ❌ No (cifrado en Vercel) |
| Código fuente | ❌ Nunca |
| Commit / push del código de IA | ✅ Solo lógica, sin keys |

Rotar key: nueva en AI Studio → actualizar `.env.local` y Vercel → redeploy.

---

## Relación con la biblia editorial

Las reglas de voz, estructura y ejemplos buenos/malos viven en
**[docs/biblia-editorial.md](./biblia-editorial.md)**. El system prompt en
`story-prompt.ts` debe alinearse con ese documento. El **default de acento es `neutro`**; el usuario puede elegir variantes bogotanas en `/crear`. Fragmentos few-shot en `story-prompt-examples.ts`. Para acentos y modismos, ver también [GuiaAcentos.md](../GuiaAcentos.md).

## Pendientes (siguientes fases)

- ~~**Moderación** de campos «+ Otro» antes del prompt.~~ ✅
- ~~**Freemium / cuota** de cuentos generados por usuario.~~ ✅ (`GENERATION_DAILY_LIMIT`)
- ~~**Logging + alerta de costo**~~ ✅ (`generation-telemetry`)
- ~~**Perfil en el prompt**~~ ✅ — ver `describeProfile()` en `story-prompt.ts`.
- ~~**Listado** de cuentos generados en biblioteca del usuario.~~ ✅ (`/mis-cuentos`)
- **A8:** plan de pago Gemini antes de tráfico masivo (aplazado mientras se pulen demos).
- **Imagen/voz:** portada (fal.ai) y narración (ElevenLabs).
- **Calidad:** few-shot más ricos y evaluación humana de demos.

---

*Última actualización: julio 2026 — Gemini en POC gratis, Vercel + Neon en producción.*
