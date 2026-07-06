# Chacachón — Base de datos

> Neon Postgres + Prisma. Schema Sprint 0.

---

## Modelos

### `users`

Usuarios autenticados vía Google OAuth (NextAuth). Un usuario puede tener un perfil familiar.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| email | string | unique |
| name, image | string? | De Google |
| role | USER \| ADMIN | Admin vía `ADMIN_EMAILS` |

### `family_profiles`

Perfil familiar flexible. El documento JSON sigue el contrato de [PerfilFamiliar.md](../PerfilFamiliar.md).

| Campo | Tipo | Notas |
|-------|------|-------|
| user_id | UUID | unique, FK → users |
| schema_version | int | default 1 |
| perfil | JSONB | nombres, mascotas, rutinas, etc. |

### `stories`

Catálogo de cuentos. En Sprint 0 el contenido largo vive en HTML estático; la fila guarda metadata y `html_path`.

| Campo | Tipo | Notas |
|-------|------|-------|
| slug | string | unique, URL-friendly |
| title, description, moraleja | string | UI biblioteca |
| family_tag | string? | ej. `chacachon` |
| accent_code | string | default `bogota_ninos` |
| html_path | string? | ej. `/cuentos/familia-chacachon-....html` |
| variant | NARRATIVE \| APARTMENT \| PILOT | |
| status | DRAFT \| PUBLISHED | |
| sort_order | int | Orden en biblioteca |

---

## Migraciones

```bash
npm run db:migrate    # desarrollo
npm run db:deploy     # producción / Vercel build hook
npm run db:seed       # cuentos iniciales
```

Archivo inicial: `prisma/migrations/20260706000000_init/`

---

## Seed

`prisma/seed.ts` inserta:

1. El lobo de las palabras feas (publicado)
2. Los Tres Cerditos del Edificio (publicado)
3. Operación A Dormir (borrador, sin HTML aún)
4. Balcutron piloto (publicado, tag distinto)

---

## Futuro (no en Sprint 0)

Tablas planificadas en `contextonew.md` para cuando el reader sea paginado en app:

- `pages` — secuencia visual por cuento
- `localized_texts` — texto por acento y tier
- `family_profile_versions` — historial de cambios del JSONB
- `readings` — telemetría de lectura (sin PII de niños)

El JSONB del perfil **no** requiere tablas `mascotas`, `ninos`, etc.

---

## Conexión local

1. Crear base `chacachon` en Neon (o reutilizar org de rotatudisfraz).
2. Editar `scripts/fetch-neon-env.mjs` con `PROJECT_ID` y `ORG_ID`.
3. `npm run setup:neon`
4. Completar `.env.local` con NextAuth y Google.

Ver `.env.example`.

---

*Última actualización: Sprint 0 — Julio 2026*
