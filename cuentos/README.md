# Cuentos — flujo editorial

Fuente de verdad narrativa en Git. El estante lee metadata desde Neon (`stories`); el texto largo se sirve desde el lector `/leer/[slug]` (markdown/template en manifest).

## Estado actual

**Catálogo vacío.** No hay demos publicados. El próximo cuento se añade aquí solo cuando el contexto y el texto estén listos.

## Flujo md → manifest → seed

1. Escribe el cuento en `cuentos/*.md` (frontmatter: `slug`, `familyTag`).
2. Corre `npm run sync:cuentos` (o `predev` / `prebuild`).
3. Añade la fila en `prisma/seed.ts` con `status: PUBLISHED` y `htmlPath` si aplica.
4. Actualiza el fallback en `src/lib/stories.ts` si hace falta offline.
5. Corre `npm run db:seed` y `npm run validate:quality`.

## Checklist antes de publicar

- [ ] Lectura en voz alta (niño + adulto)
- [ ] Checklist editorial (`docs/biblia-editorial.md` §7)
- [ ] `npm run validate:quality` en verde
- [ ] Seed + fallback sincronizados
