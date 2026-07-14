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
| `/` | Biblioteca **Las historias de Chacachón** (estante interactivo) |
| `/leer/[slug]` | Lector tipo libro (paginado por DOM, papel Cuento/Cuaderno, retoma página) |
| `/leer/generado/[id]` | Lector de cuentos generados por IA desde `/crear` |
| `/familia` | Perfil familiar para personalizar los cuentos (requiere login) |
| `/crear` | Hub crear cuento: vida, clásico o perfil |
| `/crear/adaptar` | Armar receta y **generar cuento** (Gemini / mock) |
| `/crear/plantillas` | Elegir cuento tradicional para adaptar |
| `/admin` | Catálogo interno de solo lectura (requiere rol `ADMIN`) |
| `/login` | Entrar con Google |
| `/privacidad` | Política de privacidad (piloto) |
| `/cuentos/*.html` | Readers HTML legacy (letra amplia) |

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
| [docs/crear-flow.md](./docs/crear-flow.md) | Hub `/crear`, receta, perfil, marca — estado julio 2026 |
| [docs/ia-generacion.md](./docs/ia-generacion.md) | IA: Gemini POC gratis, Vercel, API, persistencia |
| [docs/biblia-editorial.md](./docs/biblia-editorial.md) | Voz, estructura y calidad de cuentos (prompt editorial) |
| [docs/database.md](./docs/database.md) | Schema Prisma, seed, migraciones |
| [PerfilFamiliar.md](./PerfilFamiliar.md) | Perfil familiar JSONB, onboarding, interpolación |
| [GuiaAcentos.md](./GuiaAcentos.md) | Acentos, tiers, reglas anti-caricatura |
| [docs/legacy/StackTecnico.md](./docs/legacy/StackTecnico.md) | Archivado — stack/roadmap histórico (Claude-first, desactualizado) |
| [docs/legacy/ContextoChacachon.md](./docs/legacy/ContextoChacachon.md) | Archivado — plan de negocio original |
| [docs/legacy/contextonew.md](./docs/legacy/contextonew.md) | Archivado — schema relacional propuesto, no implementado tal cual |
| [cuentos/](./cuentos/) | Fuentes editoriales (.md) y HTML legacy |
| [perfiles/](./perfiles/) | JSON de prueba + plantillas |

## Stack (MVP)

- **Frontend/Backend:** Next.js 15 + TypeScript + Tailwind 4
- **BD:** Neon Postgres + Prisma
- **Auth:** NextAuth v4 + Google OAuth
- **Hosting:** Vercel (`iad1`)
- **Assets (futuro):** Cloudflare R2 · **IA texto:** Gemini (POC) / Claude · **IA futura:** Flux, ElevenLabs

## Estado del proyecto

**Lector personalizado activo** — biblioteca interactiva, auth Google, perfil familiar (JSONB) con interpolación en TypeScript y lector tipo libro (`/leer/[slug]`) con paginación real por DOM, temas de papel (Cuento/Cuaderno), tipografía Fredoka, soporte de listas/cursiva en Markdown, `prefers-reduced-motion`, retomar la última página leída y Open Graph por cuento. CSP en modo enforce.

**Flujo crear + IA (POC)** — hub `/crear`, receta en `/crear/adaptar` (protagonistas, reto, lección, lugar, «+ Otro»; pasos confirmados con Siguiente). Botón **✨ Crear mi cuento** llama a `POST /api/cuentos/generar` (Gemini gratis con `GEMINI_API_KEY`, fallback plantilla si falla) y abre `/leer/generado/[id]`. Ver [docs/crear-flow.md](./docs/crear-flow.md) y [docs/ia-generacion.md](./docs/ia-generacion.md).

**Siguiente:** moderación y freemium en generación, perfil en el prompt, cuentos en preparación, `/admin` editable y audios (ElevenLabs).
