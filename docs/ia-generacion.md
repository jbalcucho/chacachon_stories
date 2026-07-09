# Generación de cuentos con IA

Cómo el flujo **/crear** convierte una receta en un cuento leíble, con Claude
cuando hay API key y con una plantilla local (modo demo) cuando no la hay.

## Idea general

1. El usuario arma una receta en `/crear/adaptar` (protagonistas, reto, lección,
   lugar y extras) usando `StoryRecipeBuilder`.
2. Al tocar **✨ Crear mi cuento**, el cliente hace `POST /api/cuentos/generar`
   con la selección.
3. El backend valida la receta, genera el cuento (Claude o plantilla), lo guarda
   y responde un `id`.
4. El cliente redirige a `/leer/generado/[id]`, que renderiza el cuento en el
   mismo lector de libro (`StoryReader`).

Todo el contacto con la IA ocurre **en el servidor**: la API key nunca llega al
navegador.

## Proveedor de IA (prioridad)

El backend elige proveedor en este orden, según qué variable esté configurada:

1. **Gemini** (`GEMINI_API_KEY`) — tiene **capa gratuita**, ideal para el demo.
2. **Claude** (`ANTHROPIC_API_KEY`) — pago por uso desde el inicio.
3. **Plantilla local** (`story-mock.ts`) — sin ninguna key.

**El mismo código** cambia de uno a otro solo con la variable de entorno. Si el
proveedor elegido falla (rate limit, sin saldo, red), el backend cae a la
plantilla para no romperle el flujo al usuario.

| | Plantilla (demo) | Gemini | Claude |
|---|---|---|---|
| Escribe | El código rellenando huecos | IA real | IA real |
| Costo | Gratis | Capa gratis + pago por uso | Pago por uso |
| Registro | Ninguno | Google AI Studio | Anthropic Console |

## Cuenta y API key

> Tu cuenta de **Cursor no sirve** para esto (es IA para programar, no te da una
> key para tu producto). Lo mismo aplica a la app de **Gemini/Gemini Advanced**:
> el chatbot no entrega API key; necesitas la **API** vía Google AI Studio.

### Gemini (recomendado para el demo — gratis)

1. Entra a `https://aistudio.google.com` con tu cuenta de Google.
2. **Get API key** → copia la clave (`AIza...`).
3. En `.env.local`:

```bash
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-2.0-flash"   # opcional; confirma un modelo vigente en AI Studio
```

Nota de privacidad: en la capa gratis Google puede usar los prompts/respuestas
para mejorar sus modelos. Aceptable para un demo; revísalo antes de producción.

### Claude (alternativa de pago)

1. Crea cuenta en `https://console.anthropic.com`, genera key y carga saldo.
2. En `.env.local`:

```bash
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-latest"   # opcional
```

Sin ninguna de las dos keys, el flujo funciona con la plantilla local.

## Archivos clave

| Archivo | Rol |
|---|---|
| `src/lib/recipe-selection.ts` | Zod de la receta que viaja cliente → API |
| `src/lib/story-prompt.ts` | System prompt + mensaje de usuario (puro, testeable) |
| `src/lib/story-mock.ts` | Cuento de plantilla para el modo demo |
| `src/lib/story-generation.server.ts` | Elige proveedor (Gemini → Claude → mock) |
| `src/lib/generated-stories.server.ts` | Guarda/lee (Postgres o memoria) |
| `src/app/api/cuentos/generar/route.ts` | Endpoint `POST` |
| `src/app/(reader)/leer/generado/[id]/page.tsx` | Lector del cuento generado |
| `src/components/StoryRecipeBuilder.tsx` | Botón «Crear mi cuento» → fetch |

## Persistencia

- **Con `DATABASE_URL`:** se guarda en la tabla `generated_stories`
  (migración `20260709000000_generated_stories`). Aplica en producción con
  `npm run db:deploy`.
- **Sin `DATABASE_URL`:** fallback en memoria del proceso. Sirve para el demo
  local, pero **no** persiste entre reinicios ni entre instancias serverless.

## Contrato de la API

`POST /api/cuentos/generar`

```json
{ "selection": { "heroes": [...], "reto": [...], "aprenden": [...], "lugar": [...], "...": [] } }
```

- **200** → `{ "id": "uuid", "source": "gemini" | "claude" | "mock" }`
- **400** → receta inválida o falta protagonista/reto
- **500** → error inesperado

Cada ingrediente es `{ id, kind, label, emoji?, hint? }`.

## Formato del cuento

Claude y el mock devuelven **Markdown** que el lector ya sabe parsear:

```markdown
# Título
> Subtítulo

## Escena
Párrafos...
```

Lo parsea `parseStoryHeader` + `parseBodyBlocks` (`src/lib/story-markdown.ts`).

## Pendientes (siguientes fases)

- **Moderación** de los campos «+ Otro» antes de mandarlos al prompt.
- **Freemium:** contar cuentos generados por usuario y poner un límite.
- **Personalización profunda:** inyectar el perfil de familia en el prompt para
  usar apodos y frases típicas.
- **Imagen/voz:** portada con fal.ai y narración con ElevenLabs.
