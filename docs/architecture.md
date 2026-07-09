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
| `/crear` | Page | Hub crear cuento (3 caminos + medidor de perfil) |
| `/crear/plantillas` | Page | Cuento tradicional → adaptar |
| `/crear/adaptar` | Page | Receta interactiva (tap/drag) |
| `/familia` | Page | Perfil familiar (login) |
| `/login` | Page | Entrar con Google |
| `/privacidad` | Page | Política de privacidad (piloto) |
| `/cuentos/*.html` | Static | Readers HTML legacy |
| `/api/auth/*` | API | NextAuth handlers |

Rutas protegidas (middleware): `/familia/*`, `/admin/*` (Sprint 1+).

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

*Última actualización: Sprint 0 — Julio 2026*
