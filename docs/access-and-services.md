# Chacachón — Accesos y setup

> Qué puede automatizar el agente vs qué requiere tu cuenta.

---

## Estado actual (Sprint 0)

| Pieza | Estado | Cómo se configuró |
|-------|--------|-------------------|
| **Neon DB `chacachon`** | ✅ Creada | Mismo proyecto que rotatudisfraz (`withered-cake-28248560`) |
| **Migraciones Prisma** | ✅ Aplicadas | `npm run db:deploy` |
| **Seed cuentos** | ✅ 4 historias | `npm run db:seed` |
| **`.env.local` local** | ✅ DB + auth | `fetch-neon-env.mjs` + vars copiadas de rotatudisfraz |
| **Google OAuth local** | ⚠️ Revisar | Mismo client que rotatudisfraz; debe incluir redirect `http://localhost:3000/api/auth/callback/google` |
| **Vercel proyecto** | ❌ Pendiente | Crear/importar en vercel.com |
| **Vercel env vars** | ❌ Pendiente | `npm run setup:vercel-env` + `setup:vercel-auth-env` después de `vercel link` |

---

## Lo que el agente puede hacer por ti

- Crear BD en Neon (`neonctl databases create`)
- Escribir `DATABASE_URL` / `DIRECT_URL` en `.env.local`
- Correr migraciones y seed
- Copiar `NEXTAUTH_SECRET` y `GOOGLE_*` desde rotatudisfraz (mismo OAuth client)
- Generar `NEXTAUTH_SECRET` si hiciera falta
- `vercel link` y push de env vars **si apruebas el comando en terminal**

## Lo que debes hacer tú (una vez)

### 1. Google Cloud Console (si login falla)

En el OAuth client de Google, agregar **Authorized redirect URIs**:

- `http://localhost:3000/api/auth/callback/google`
- `https://TU-DOMINIO-VERCEL.vercel.app/api/auth/callback/google`

(Si rotatudisfraz ya usa `localhost:3000`, local puede funcionar sin cambios.)

### 2. Vercel — primer deploy

1. [vercel.com/new](https://vercel.com/new) → importar `chacachon_stories`
2. Framework: **Next.js** (auto)
3. Deploy

Luego en terminal del repo:

```bash
npx vercel link
npm run setup:vercel-env
npm run setup:vercel-auth-env
```

Actualizar en Vercel `NEXTAUTH_URL` a la URL de producción.

### 3. Probar local

```bash
npm run dev
```

Abre http://localhost:3000 — biblioteca con datos de Neon. Prueba **Entrar** con Google.

---

## Comandos útiles

```bash
npm run setup:neon          # DB URLs + migrate + seed (desde cero)
npm run db:studio           # Ver tablas
npm run dev
```

---

*Última actualización: Sprint 0 — Julio 2026*
