# Stack Técnico y Consideraciones de Arquitectura — Chacachón

> Documento de referencia técnico para la plataforma web de cuentos infantiles hiperlocalizados con IA.  
> **Versión 1.1 — Julio 2026** · Alineado con el patrón Balcu Apps (rotatudisfraz).

---

## 1. Decisiones estratégicas

### 1.1 Web primero, app después

| Criterio | Web (PWA) | App nativa |
|---|---|---|
| Distribución vía WhatsApp/YouTube | Link directo | Requiere descarga |
| Costo de desarrollo | Una base de código | 2–3 codebases |
| Time-to-market | Días | Semanas + review stores |
| SEO orgánico | Sí | No |
| Restricciones contenido infantil + IA | Mínimas | Apple/Google estrictos |
| Instalable en home screen | Sí (PWA) | Sí |

**Decisión:** PWA con Next.js, mobile-first. App nativa cuando se valide retención (>30% W4) y haya >1.000 usuarios pagos.

### 1.2 Vercel + Neon + Prisma vs Supabase vs AWS

| Criterio | Vercel + Neon + Prisma | Supabase | AWS |
|---|---|---|---|
| Setup inicial | 1–2 días (plantilla rotatudisfraz) | 1 día | 2–3 semanas |
| Costo 0–10k usuarios | $0–50/mes | $0–50/mes | $80–200/mes |
| Consistencia ecosistema Balcu | **Alta** | Media | Baja |
| Postgres portable | Sí | Sí | Sí |
| Auth integrado | NextAuth (Google) | Supabase Auth | Cognito |

**Decisión (v1.1):** **Vercel + Neon Postgres + Prisma + NextAuth**, mismo patrón que [rotatudisfraz](https://github.com/jbalcucho/rotatudisfraz). El perfil familiar sigue siendo **JSONB en Postgres**; la autorización vive en la app (sesión + queries), no en RLS de Supabase.

Migrar a AWS solo si compliance o costos a >100k MAU lo justifican.

---

## 2. Stack actual (Sprint 0 implementado)

### Frontend

| Pieza | Elección | Estado |
|---|---|---|
| Framework | Next.js 15 (App Router, `src/`) | ✅ |
| Lenguaje | TypeScript (`strict: true`) | ✅ |
| UI | Tailwind CSS 4 | ✅ |
| Forms | Zod | Parcial |
| shadcn/ui | — | Fase 2 |
| PWA | `@serwist/next` | Fase 3 |

### Backend (Next.js)

| Pieza | Elección | Estado |
|---|---|---|
| API | Route Handlers (`src/app/api/*`) | Auth ✅ |
| Auth | NextAuth v4 + Google OAuth | ✅ |
| Rate limiting | Tabla Postgres (patrón rotatudisfraz) | Fase 2 |
| Jobs async | Trigger.dev o Inngest | Fase 4 |

### Base de datos y storage

| Pieza | Elección | Estado |
|---|---|---|
| BD | **Neon Postgres** (serverless) | ✅ schema |
| ORM | **Prisma 5** | ✅ |
| Perfil familiar | `family_profiles.perfil` JSONB | ✅ modelo |
| Catálogo | `stories` (slug, htmlPath, status) | ✅ seed |
| Migrations | `prisma/migrations/` | ✅ |
| Assets estáticos (HTML readers) | `public/cuentos/` | ✅ |
| Ilustraciones + audio (futuro) | Cloudflare R2 | Fase 2 |

### Servicios de IA (futuro cercano)

| Servicio | Proveedor | Uso |
|---|---|---|
| Texto | Anthropic Claude Sonnet 4.5 | Pregeneración de cuentos |
| Imagen | fal.ai — Flux + LoRAs | Ilustraciones por personaje |
| TTS | ElevenLabs Multilingual v2 | Narración por acento |
| Moderación | OpenAI Moderation API | Validar inputs de nombres |

### Pagos (fase posterior)

| Mercado | Proveedor |
|---|---|
| Colombia | Wompi |
| LatAm | Mercado Pago |

### Tooling

| Pieza | Elección |
|---|---|
| Package manager | npm (igual que rotatudisfraz) |
| Linter | ESLint 9 + `eslint-config-next` |
| CI/CD | Vercel preview deploys (+ GitHub Actions `ci.yml` pendiente de push) |
| IDE | Cursor |

---

## 3. Arquitectura de alto nivel

```text
Usuario (Browser)
        │
        ▼
     VERCEL — Next.js 15 (iad1)
  ┌─────────────────────────────┐
  │ Server Components + API     │
  │ middleware.ts (auth rutas)  │
  └──────────┬──────────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
 NEON POSTGRES    SERVICIOS EXTERNOS
 + Prisma         Google OAuth,
                  Anthropic, fal.ai,
                  ElevenLabs, Wompi

 public/cuentos/ — readers HTML (Sprint 0)
 CLOUDFLARE R2 — ilustraciones + audio (futuro)
```

Detalle operativo: [docs/architecture.md](./docs/architecture.md)  
Modelo de datos: [docs/database.md](./docs/database.md)

---

## 4. Estructura del repositorio (actual)

```text
chacachon_stories/
├── docs/                    # Arquitectura, BD, accesos
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/cuentos/          # Readers HTML (letra amplia)
├── cuentos/                 # Fuentes editoriales .md / .html legacy
├── perfiles/                # JSON de prueba (no servir en prod)
├── scripts/
│   ├── fetch-neon-env.mjs
│   ├── push-vercel-env.mjs
│   ├── push-vercel-auth-env.mjs
│   └── resolver-perfil.mjs  # → portar a src/lib/interpolation.ts
├── src/
│   ├── app/                 # page.tsx = biblioteca
│   ├── components/
│   ├── lib/                 # prisma, auth, stories
│   └── middleware.ts
├── StackTecnico.md
├── PerfilFamiliar.md
└── vercel.json
```

---

## 5. Seguridad y compliance

### Autorización en aplicación (equivalente a RLS)

- `users`, `family_profiles`: solo el usuario autenticado accede a su fila (`userId` de sesión).
- `stories`: lectura pública solo si `status = PUBLISHED` en queries del servidor.
- Admin: `ADMIN_EMAILS` en env → `UserRole.ADMIN` (patrón rotatudisfraz).

### Habeas Data (Ley 1581 Colombia)

- Solo recolectar datos del perfil familiar necesarios (ver [PerfilFamiliar.md](./PerfilFamiliar.md)).
- Consentimiento parental al registrarse.
- Botón exportar / eliminar cuenta (Sprint 1).
- No trackear datos de niños en analytics.
- `/privacidad` publicada.

### Tier de moderación (1/2/3)

Ver [GuiaAcentos.md](./GuiaAcentos.md). Default tier 1.

### Secretos

- `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET` solo en Vercel / `.env.local`.
- Nunca commitear `perfiles/familia-chacachon.json` con datos reales en rutas públicas.

---

## 6. Performance

**Targets (móvil 4G):** LCP < 2.5s · CLS < 0.1 · INP < 200ms

| Táctica | Detalle |
|---|---|
| Static HTML readers | `public/cuentos/*.html` — cero JS en lectura |
| `force-dynamic` en home | Catálogo desde BD cuando hay `DATABASE_URL` |
| Fallback estático | `STORY_CATALOG_FALLBACK` si no hay BD (build/preview) |
| ISR | Catálogo cuando estabilice el schema |
| R2 + CDN | Ilustraciones inmutables (futuro) |

---

## 7. Observabilidad (pendiente)

| Capa | Herramienta |
|---|---|
| Errores | Sentry |
| Web Vitals | Vercel Analytics |
| Producto | PostHog |

---

## 8. Roadmap técnico

| Sprint | Duración | Entregable | Estado |
|---|---|---|---|
| **0 — Setup** | 3–5 días | Next.js, Neon, Prisma, Vercel, biblioteca | ✅ |
| **1 — Familia** | 1–2 semanas | Perfil JSONB, API, interpolación TS, export/delete | ✅ base |
| **2 — Reader** | 2 semanas | Reader React, acentos, audio | Pendiente |
| **3 — Pagos** | 1–2 semanas | Wompi, gating premium | Pendiente |
| **4 — Sharing** | 1 semana | OG tags WhatsApp | Pendiente |
| **5 — Admin** | 1 semana | Publicar cuentos, dashboards | Pendiente |

---

## 9. Comandos de desarrollo

```bash
npm install
cp .env.example .env.local   # completar vars
npm run dev

# Base de datos (con Neon configurado)
npm run setup:neon           # fetch env + migrate + seed
npm run db:studio

# Vercel
npm run setup:vercel-env
npm run setup:vercel-auth-env
```

---

## 10. Decisiones pendientes

1. Crear proyecto Neon `chacachon` y conectar Vercel.
2. Google OAuth client para dominio de producción.
3. Portar `resolver-perfil.mjs` → `src/lib/interpolation.ts`.
4. HTML de Operación A Dormir (Chacachón).
5. shadcn/ui cuando haya formularios de onboarding.
6. Dominio definitivo (`chacachon.com`).

---

*Documento vivo. Revisar cada sprint.*
