# Cuentos — flujo editorial

Fuente de verdad narrativa en Git. El estante lee metadata desde Neon (`stories`); el texto largo se sirve como HTML estático.

## Flujo md → HTML → seed

1. Escribe o edita el cuento en `cuentos/*.md` (acento, moraleja, familia).
2. Genera el lector en `public/cuentos/*.html` (toolbar con ← Biblioteca y A+/A−).
3. Actualiza `prisma/seed.ts`: `status: PUBLISHED`, `htmlPath: "/cuentos/...."`.
4. Actualiza el fallback en `src/lib/stories.ts` si aplica.
5. Corre `npm run db:seed`.

## Regla de higiene (P0)

**Solo cuentos `PUBLISHED` deben vivir en `public/cuentos/`.**

- Un borrador (`DRAFT`) se queda en `cuentos/*.md` hasta estar listo.
- Si un HTML deja de publicarse, quítalo de `public/` o el archivo seguirá accesible por URL directa.
- El piloto Balcutron (`familia-balcutron-operacion-a-dormir.html`) está publicado con `familyTag: balcutron` y **no** aparece en el estante home (filtro `chacachon`). La URL directa sigue funcionando a propósito.

## Checklist antes de publicar

- [ ] Lectura en voz alta (niño + adulto)
- [ ] Moraleja clara sin sermón
- [ ] Máx. 2–4 marcas dialectales por párrafo ([GuiaAcentos.md](../GuiaAcentos.md))
- [ ] `← Biblioteca` y controles de letra en el HTML
- [ ] Seed + fallback sincronizados
