# Modo guest / demo (sin login)

> B3 · Actualizado julio 2026

Permite probar el producto **sin cuenta**: leer muestras en el estante, crear un cuento de prueba local y armar recetas con la familia Chacachón de ejemplo. La generación IA persistente y la biblioteca personal requieren Google.

---

## Principio de producto

- **Leer primero, cuenta después.** El home guest no empuja registro en medio de la página.
- Header: **Crear gratis** (primario → `/probar`) + **Ingresar** (secundario, ghost).
- Conversión suave tras leer o probar: guardar / ingresar cuando ya hubo valor.

---

## Cómo funciona

| Acción | Sin login | Con login + perfil |
|--------|-----------|-------------------|
| Home «Mi biblioteca» con muestras (`demo-*`) | ✅ | Biblioteca personal |
| Leer muestra (`/cuentos/demo-*.html` o lector) | ✅ | ✅ |
| Probar cuento (`/probar` → `/leer/prueba`) | ✅ mock local (sessionStorage) | Mejor: flujo `/crear` |
| Armar receta (`/crear/adaptar`) | ✅ ingredientes demo | ✅ tu perfil |
| Generar cuento con IA (API) | ❌ requiere Google | ✅ |
| Guardar cuentos generados | ❌ | ✅ `/mis-cuentos` |
| Casa familiar / perfiles | ❌ onboarding post-login | ✅ `/familia`, `/perfiles` |

**Perfil demo (lectura/receta):** `perfiles/familia-chacachon.json`.

**Resolución en código:** `getReaderProfile(userId)` en `src/lib/reader-profile.ts` → `source: "demo"` sin sesión o perfil válido.

**Muestras del estante guest:** `DEMO_SHOWCASE_STORIES` en `src/lib/onboarding.ts` (slugs `demo-*`, HTML en `public/cuentos/`). En UI el sello dice **Muestra**, no «demo».

---

## UX home guest

- Intro: *Para leer juntos en casa, de paseo o en cualquier momento.*
- Estante: label **Mi biblioteca**, subtítulo *¿Qué vamos a leer hoy?*
- Badge verde **Muestra** en portada; sin sello en el lomo seleccionado.
- Hint bajo el estante: *Toca el libro y empieza a leer*.
- Slot **Crear HistorIA** (IA resaltada) → `/probar` en guest.
- Sin banner de registro entre hero y estante.

---

## Flujo «Crear gratis» (trial)

1. `/probar` — nombre + reto (`TrialStoryForm`).
2. Mock en `sessionStorage` (`chacachon.trialStory.v1`) vía `src/lib/trial-story.ts`.
3. `/leer/prueba` — lectura del trial; CTA para ingresar y guardar de verdad.

No gasta cuota LLM. No persiste en Neon.

---

## Post-login (casa → perfil)

Tras Google: `OnboardingGate` / `ProfileGate` llevan a casa familiar (`/familia`) y elección de perfil activo (`/perfiles`) antes de la app completa. Claves: `src/lib/onboarding.ts`, `src/lib/active-profile.ts`.

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/onboarding.ts` | Demos showcase + readiness familiar |
| `src/lib/trial-story.ts` | Mock trial sin login |
| `src/app/(site)/probar/page.tsx` | Formulario trial |
| `src/app/(reader)/leer/prueba/page.tsx` | Lector trial |
| `public/cuentos/demo-*.html` | HTML de muestras |
| `src/components/SiteHeader.tsx` | Crear gratis / Ingresar |
| `src/components/StoryBookshelf.tsx` | Estante guest + hints |
| `src/lib/reader-profile.ts` | Demo vs usuario |
| `perfiles/familia-chacachon.json` | Familia de ejemplo |

---

## Nota de diseño

Un solo estante + desplazamiento lateral. Con muchas historias: búsqueda / recientes / filtro por perfil — no varios estantes apilados en el home.
