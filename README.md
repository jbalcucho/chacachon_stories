# Chacachón

Plataforma web de cuentos infantiles hiperlocalizados con IA. Cuentos con humor regional (bogotano, costeño, etc.), lecciones de crianza y personajes originales inspirados en la nostalgia de los 80 y 90.

## App (Sprint 0)

Next.js 15 + Neon Postgres + Prisma + NextAuth — mismo patrón que rotatudisfraz.

```bash
git clone https://github.com/jbalcucho/chacachon_stories.git
cd chacachon_stories
npm install
cp .env.example .env.local   # completar variables
npm run dev                  # http://localhost:3000
```

| Ruta | Descripción |
|------|-------------|
| `/` | Biblioteca **Las historias de Chacachón** |
| `/login` | Entrar con Google |
| `/privacidad` | Política de privacidad (piloto) |
| `/cuentos/*.html` | Readers HTML (letra amplia) |

### Base de datos

```bash
npm run setup:neon           # Neon env + migrate + seed (requiere neonctl)
npm run db:studio
```

Ver [docs/database.md](./docs/database.md) y [docs/architecture.md](./docs/architecture.md).

## Documentación

| Documento | Descripción |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | Arquitectura Sprint 0, rutas, decisiones |
| [docs/database.md](./docs/database.md) | Schema Prisma, seed, migraciones |
| [StackTecnico.md](./StackTecnico.md) | Stack completo, roadmap, seguridad |
| [PerfilFamiliar.md](./PerfilFamiliar.md) | Perfil familiar JSONB, onboarding, interpolación |
| [GuiaAcentos.md](./GuiaAcentos.md) | Acentos, tiers, reglas anti-caricatura |
| [ContextoChacachon.md](./ContextoChacachon.md) | Plan de negocio, IP, GTM |
| [contextonew.md](./contextonew.md) | Schema relacional futuro (páginas, acentos) |
| [cuentos/](./cuentos/) | Fuentes editoriales (.md) y HTML legacy |
| [perfiles/](./perfiles/) | JSON de prueba + plantillas |

## Stack (MVP)

- **Frontend/Backend:** Next.js 15 + TypeScript + Tailwind 4
- **BD:** Neon Postgres + Prisma
- **Auth:** NextAuth v4 + Google OAuth
- **Hosting:** Vercel (`iad1`)
- **Assets (futuro):** Cloudflare R2 · **IA:** Claude, Flux, ElevenLabs

## Estado del proyecto

**Sprint 0** — App Next.js con biblioteca, auth Google, schema Prisma y readers HTML en `public/cuentos/`. Siguiente: perfil familiar + interpolación en TypeScript.
