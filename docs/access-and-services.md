# Chacachón — Accesos y setup

> Qué puede automatizar el agente vs qué requiere tu cuenta.

---

## Estado actual (julio 2026)

| Pieza | Estado | Cómo se configuró |
|-------|--------|-------------------|
| **Neon DB `chacachon`** | ✅ Creada | Mismo proyecto que rotatudisfraz (`withered-cake-28248560`) |
| **Migraciones Prisma** | ✅ Aplicadas | `npm run db:deploy` (incl. `generated_stories`) |
| **Seed cuentos** | ❌ 0 (seed limpia el catálogo, no inserta) | `npm run db:seed` — corpus real es Fase 2 del plan |
| **`.env.local` local** | ✅ DB + auth + Gemini | `fetch-neon-env.mjs` + vars manuales |
| **Google OAuth local** | ⚠️ Revisar | Mismo client que rotatudisfraz; redirect `localhost:3000` |
| **Vercel proyecto** | ✅ | https://chacachon-stories.vercel.app |
| **Vercel env (DB + auth)** | ✅ | `setup:vercel-env` + `setup:vercel-auth-env` |
| **Vercel env (Gemini IA)** | ✅ | `GEMINI_API_KEY` + `GEMINI_MODEL` (Sensitive) — jul 2026 |
| **Generación IA en prod** | ✅ | `source: gemini` verificado en `/api/cuentos/generar` |

---

## Variables de entorno — referencia

### Local (`.env.local` — no se commitea)

Ver `.env.example`. Mínimo para la POC con IA:

```bash
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3.1-flash-lite-preview"
```

### Vercel Production

[Environment Variables](https://vercel.com/jose-balcuchos-projects/chacachon-stories/settings/environment-variables)

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | Neon pooler | `setup:vercel-env` |
| `DIRECT_URL` | Neon direct | `setup:vercel-env` |
| `NEXTAUTH_URL` | `https://chacachon-stories.vercel.app` | |
| `NEXTAUTH_SECRET` | string largo | |
| `GOOGLE_CLIENT_ID` | mismo que rotatudisfraz | |
| `GOOGLE_CLIENT_SECRET` | mismo que rotatudisfraz | |
| `ADMIN_EMAILS` | emails admin | |
| `GEMINI_API_KEY` | AI Studio | **Sensitive** — ver [ia-generacion.md](./ia-generacion.md) |
| `GEMINI_MODEL` | `gemini-3.1-flash-lite-preview` | |

Tras cambiar variables: **Deployments → Redeploy**.

---

## Lo que el agente puede hacer por ti

- Crear BD en Neon (`neonctl databases create`)
- Escribir `DATABASE_URL` / `DIRECT_URL` en `.env.local`
- Correr migraciones y seed (`db:deploy`, `db:seed`)
- Copiar `NEXTAUTH_SECRET` y `GOOGLE_*` desde rotatudisfraz
- `vercel link` y push de env vars **si apruebas el comando en terminal**
- Subir `GEMINI_*` a Vercel y redeploy (sin exponer la key en git)

## Lo que debes hacer tú (una vez)

### 1. Google OAuth — error «Access blocked»

Casi siempre falta el **redirect URI** de Chacachón en el cliente OAuth de Google.

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Edita el OAuth 2.0 Client ID de rotatudisfraz
3. **Authorized redirect URIs:**

   ```
   https://chacachon-stories.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

4. Guarda y espera ~1 minuto.

### 2. Gemini API (POC gratis)

1. https://aistudio.google.com → **Get API key**
2. Pegar en `.env.local` como `GEMINI_API_KEY`
3. En Vercel (o pedir al agente `vercel env add`)

Detalle completo: [docs/ia-generacion.md](./ia-generacion.md).

> **Cursor** y **Gemini Advanced** (chat) **no** dan API key para la app.

### 3. Vercel — primer deploy (ya hecho)

Si creas un proyecto nuevo:

```bash
npx vercel link --project chacachon-stories
npm run setup:vercel-env
npm run setup:vercel-auth-env
# + GEMINI_API_KEY y GEMINI_MODEL manual o por CLI
npx vercel --prod
```

### 4. Probar local

```bash
npm run dev
```

- Biblioteca: http://localhost:3000
- Crear cuento: http://localhost:3000/crear/adaptar
- Probar key: `node scripts/test-gemini-key.mjs`

---

## Comandos útiles

```bash
npm run setup:neon          # DB URLs + migrate + seed (desde cero)
npm run db:deploy           # Aplicar migraciones en Neon (prod)
npm run db:studio           # Ver tablas (users, stories, generated_stories)
npm run dev
node scripts/test-gemini-key.mjs
```

---

*Última actualización: julio 2026 — Vercel + Gemini POC en producción.*
