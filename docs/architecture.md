# Chacachón — Arquitectura

> Cuentos infantiles hiperlocalizados para leer en familia.  
> **Sprint 0** · Julio 2026 · Patrón alineado con rotatudisfraz.

---

## Vista general

```text
┌─────────────────────────────────────────────────────────────┐
│                        USUARIOS                              │
│   Padres (móvil / desktop) — lectura nocturna en familia     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL — chacachon-stories (Next.js 15)         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ App Router   │  │ API Routes   │  │ NextAuth v4      │   │
│  │ biblioteca   │  │ /api/auth    │  │ Google OAuth     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
│         │                 │                                  │
│         │    ┌────────────┴────────────┐                     │
│         │    │ src/lib/               │                     │
│         │    │  prisma · auth · stories│                     │
│         └───►│  middleware.ts         │                     │
└─────────────┼────────────┬────────────┼─────────────────────┘
              │            │
              ▼            ▼
     ┌────────────┐  ┌──────────────┐
     │ Neon       │  │ Google OAuth │
     │ Postgres   │  │              │
     │ + Prisma   │  └──────────────┘
     └────────────┘

     public/cuentos/*.html — readers estáticos (letra amplia)
```

---

## Stack tecnológico

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | Next.js 15 · React 19 · Tailwind 4 | Biblioteca, login, privacidad |
| Backend | Next.js API Routes | Auth, futuro perfil familiar |
| ORM | Prisma 5 | Acceso tipado a Postgres |
| Base de datos | **Neon Postgres** | users, stories, family_profiles |
| Auth | NextAuth v4 | Google OAuth |
| Deploy | Vercel (`iad1`) | Hosting + env vars |
| CI | GitHub Actions (pendiente push) | `.github/workflows/ci.yml` local — scope `workflow` |
| Marca | PNG/WebP ilustrado | `BrandIllustration` (`hero` home, `compact` header/footer) |

### Decisiones clave

| Decisión | Elección | Por qué |
|----------|----------|---------|
| DB | Neon + Prisma | Mismo patrón que rotatudisfraz; JSONB para perfil familiar |
| Readers Sprint 0 | HTML en `public/cuentos/` | Reutilizar lectores ya pulidos (A+/A−) |
| Auth | Google primero | Menos fricción para padres; credentials en fase posterior si hace falta |
| Código | Inglés (`schema`, `lib/`) | Convención Balcu |
| UI / copy | Español (`es`) | Producto Colombia |

Documentación relacionada: [StackTecnico.md](../StackTecnico.md) · [database.md](./database.md) · [PerfilFamiliar.md](../PerfilFamiliar.md)

---

## Rutas actuales

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Page | Biblioteca «Las historias de Chacachón» |
| `/leer/[slug]` | Page | Lector personalizado (paginado, perfil interpolado) |
| `/leer/generado/[id]` | Page | Lector de cuentos generados por IA (`/crear`) |
| `/crear` | Page | Hub crear cuento (3 caminos + medidor de perfil) |
| `/crear/plantillas` | Page | Cuento tradicional → adaptar |
| `/crear/adaptar` | Page | Receta interactiva → generar cuento |
| `/familia` | Page | Perfil familiar (login) |
| `/login` | Page | Entrar con Google |
| `/privacidad` | Page | Política de privacidad (piloto) |
| `/cuentos/*.html` | Static | Readers HTML legacy |
| `/opengraph-image` | OG | Tarjeta de preview del sitio (ilustración + título) |
| `/leer/[slug]/opengraph-image` | OG | Preview por cuento |
| `/api/auth/*` | API | NextAuth handlers |
| `/api/cuentos/generar` | API | POST — receta → cuento (Gemini/Claude/mock) → `generated_stories` |

Generación IA: ver [docs/ia-generacion.md](./ia-generacion.md).

Rutas protegidas (middleware): `/familia/*`, `/admin/*` (Sprint 1+).

### Activos de marca

| Activo | Ruta | Uso |
|--------|------|-----|
| Ilustración PNG/WebP | `public/images/brand/hero-luna-chacachon.*` | UI (`BrandIllustration`) |
| Favicon | `src/app/icon.png` | Pestaña del navegador |
| Apple touch | `src/app/apple-icon.png` | iOS «Añadir a inicio» |
| OG embebido | `src/lib/brand-illustration-server.ts` | `ImageResponse` (solo servidor) |

---

## Contenido editorial vs app

| Carpeta | Uso |
|---------|-----|
| `cuentos/*.md` | Fuente editorial, versionado en Git |
| `public/cuentos/*.html` | Lo que lee el usuario en pantalla |
| `perfiles/*.json` | Pruebas locales; **no** exponer en `public/` |
| `prisma/seed.ts` | Catálogo en BD (`stories`) |

---

## Scripts operativos

| Script | Comando npm | Descripción |
|--------|-------------|-------------|
| `fetch-neon-env.mjs` | `setup:neon` (parcial) | Escribe `DATABASE_URL` desde neonctl |
| `push-vercel-env.mjs` | `setup:vercel-env` | Sube URLs de BD a Vercel |
| `push-vercel-auth-env.mjs` | `setup:vercel-auth-env` | Sube NextAuth + Google |

---

*Última actualización: julio 2026 — ilustración de marca y estante simétrico.*
