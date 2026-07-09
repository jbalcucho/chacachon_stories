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

### `generated_stories`

Cuentos creados por el flujo `/crear` (IA o plantilla mock). Migración
`20260709000000_generated_stories`.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK — URL `/leer/generado/[id]` |
| user_id | UUID? | FK opcional → users |
| title | string | Título del cuento |
| body_markdown | text | Cuento en Markdown |
| recipe | JSONB | Selección de la receta |
| source | string | `gemini` \| `claude` \| `mock` |
| model | string? | ej. `gemini-3.1-flash-lite-preview` |
| created_at | timestamp | |

---

## Migraciones

```bash
npm run db:migrate    # desarrollo
npm run db:deploy     # producción / Vercel build hook
npm run db:seed       # cuentos iniciales
```

Archivos:

- `prisma/migrations/20260706000000_init/` — users, family_profiles, stories
- `prisma/migrations/20260709000000_generated_stories/` — cuentos generados por IA

---

## Seed

`prisma/seed.ts` inserta **9** historias:

| # | Título | Status | Notas |
|---|--------|--------|-------|
| 1 | El lobo de las palabras feas | PUBLISHED | HTML en `public/cuentos/` |
| 2 | Los Tres Cerditos del Edificio | PUBLISHED | HTML |
| 3 | Operación A Dormir | PUBLISHED | Familia Chacachón |
| 4 | El ascensor de las sorpresas | DRAFT | Sin HTML |
| 5 | Pauleta y el tren del bosque | DRAFT | Sin HTML |
| 6 | Misión en Paloquemao | DRAFT | Sin HTML |
| 7 | El día sin pantallas de Nico | PUBLISHED | HTML |
| 8 | Chacachón en la luna | DRAFT | Sin HTML |
| 9 | Operación A Dormir (Balcutron) | PUBLISHED | `familyTag: balcutron` — HTML público, no aparece en el estante home (filtro `chacachon`) |

**Regla editorial:** solo cuentos `PUBLISHED` deben tener HTML en `public/cuentos/`. Ver [cuentos/README.md](../cuentos/README.md).

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

*Última actualización: julio 2026 — tabla `generated_stories` para IA.*
