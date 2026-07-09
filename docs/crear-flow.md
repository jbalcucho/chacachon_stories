# Flujo «Crear cuento» — estado actual

> Julio 2026 · Sprint 1 (UI lista, IA pendiente)

Documenta lo construido hasta aquí en el hub `/crear`, el asistente de receta y la marca visual asociada.

---

## Resumen

| Pieza | Estado | Ruta / archivo |
|-------|--------|----------------|
| Hub crear | ✅ UI completa | `/crear` · `src/app/(site)/crear/page.tsx` |
| Plantillas clásicas | ✅ Listado | `/crear/plantillas` |
| Receta interactiva | ✅ Tap + drag (desktop) | `/crear/adaptar` · `StoryRecipeBuilder.tsx` |
| Perfil familiar | ✅ JSONB + completitud % | `/familia` · `family-profile-completion.ts` |
| Generación IA | ⏳ Botón placeholder | «Crear mi cuento» avisa que viene en siguiente fase |
| Marca luna + libro | ✅ Ilustración en header, home, footer, crear, OG, favicon | `BrandIllustration.tsx` · `public/images/brand/hero-luna-chacachon.{png,webp}` |

---

## Hub `/crear`

### Copy (español latino)

- Hero: *Tu cuento, tu familia* — cuento **inspirado en ti y tu familia**, o basado en un clásico; perfil opcional.
- Tres caminos:
  1. **Inspirado en tu vida** → `/crear/adaptar` (requiere perfil válido).
  2. **Basado en un cuento tradicional** → `/crear/plantillas` (cerditos, Caperucita, hombre de jengibre…; no incluye cuentos propios como Operación a dormir).
  3. **Edita tu perfil de cuentos** → `/familia`.

### UX interactiva (`CrearHub.tsx`)

- **Paso 1 de 3** — indicador de flujo (camino → receta → cuento).
- **Medidor de perfil** — % de completitud + hint; enlace a `/familia`.
- **Vista previa dinámica** — ejemplo que cambia al enfocar cada tarjeta (usa nombres del perfil si existen).
- **Orden dinámico** — sin perfil: primero «Edita tu perfil»; «Inspirado en tu vida» bloqueado (borde punteado).
- **Animaciones** — entrada escalonada de tarjetas, pulse en iconos; respetan `prefers-reduced-motion`.

### Fondo

Mismo cielo que el home: `SkyScenery` en `(site)/layout.tsx` + `body.page-bg`.

---

## Receta (`/crear/adaptar`)

### Zonas

| Zona | Máx. | Obligatoria |
|------|------|-------------|
| Protagonistas | 3 | Sí (+ «Otro» texto libre) |
| El reto (dilema) | 1 | Sí (+ «Otro» texto libre) |
| Qué aprenden (emoción/lección) | 2 | Sí (+ «Otro» texto libre) |
| ¿Dónde pasa? | 1 | Sí (+ «Otro» texto libre) |
| Mascota, acompañantes, rol de reto, objeto, molde | 1–4 | No («Agregar más») |

### Ingredientes

Salen del perfil familiar vía `buildRecipeIngredients()` en `src/lib/story-recipe.ts`. Demo Chacachón si no hay sesión o perfil.

### Interacción (wizard paso a paso)

Flujo **siempre guiado** — una etapa visible a la vez:

1. Protagonistas → 2. Reto → 3. Lección → 4. Lugar → (5. Clásico si viene de plantilla) → Extras opcionales → Revisar y crear.

- Barra de progreso + chips de pasos: **verde solo tras pulsar Siguiente**; los confirmados son enlaces para volver a editar.
- Panel con título y subtítulo claros por etapa.
- En protagonistas: enlace **«¿Falta alguien fijo? Editar perfil»** → `/familia`.
- **«+ Otro»** en los 4 pasos obligatorios (texto libre, máx. 40 caracteres) además de chips del perfil o listas curadas.
- Navegación bajo el panel (no flotante): **← Volver/Atrás** · icono biblioteca → `/` · **Siguiente →** (u **Omitir** en opcionales).
- Último paso: encabezado **«Chacachón va a crear este cuento:»**, título generado, sinopsis enriquecida (`buildRecipeSynopsis`), recap por pasos y **✨ Crear mi cuento**.

### Confirmación de pasos

- Estado `furthestConfirmedIndex` en `StoryRecipeBuilder`: un paso solo pasa a verde al pulsar **Siguiente**, aunque venga pre-rellenado del perfil.
- Los pasos confirmados son navegables (chip con ✓ y nombre subrayado en desktop).
- Helpers: `isWizardStepConfirmed`, `canNavigateToWizardStep` en `recipe-summary.ts`.

### Vista previa del cuento (revisión)

`buildRecipeSynopsis()` arma un texto de varias frases: protagonistas y escenario, reto y lección, extras opcionales (mascota, acompañantes, objeto, clásico) y cierre con tono Chacachón (humor rolo, sin sermón).

### Defaults de demo

- Protagonista: primer niño del perfil (o «+ Otro»).
- Reto: dormir.
- Aprenden: responsabilidad.
- Lugar: apartamento.

---

## Completitud del perfil

`computeFamilyProfileCompletion()` pondera:

| Campo | Peso |
|-------|------|
| Niño(s) con nombre | 20% |
| Adulto(s) con nombre | 20% |
| Ciudad o barrio | 15% |
| Nombre del hogar | 15% |
| Frase típica | 15% |
| Mascota | 15% (opcional) |

Schema: `familyProfileEssentialSchema` en `src/lib/family-profile-schema.ts`.

---

## Marca visual (julio 2026)

- Ilustración: **luna creciente + libro abierto** (PNG/WebP con alpha, generada con Gemini y recortada en repo).
- Componente único: `BrandIllustration` con variantes `hero | compact | crear | recipe`.
- Superficies: home (hero más compacto, acorde al estante), header y footer (mismo bloque `compact` + wordmark), hub `/crear`, receta, tarjetas Open Graph (`opengraph-image.tsx` + por cuento) y favicons (`icon.png`, `apple-icon.png`).
- Footer: enlace a `/` con la misma marca que el header (no ilustración suelta grande).
- OG embebe el PNG vía `brand-illustration-server.ts` (solo servidor; no importar en cliente).
- Wordmark: texto plano **Chacachón** (C normal).
- SVG legacy (`BrandMark.tsx`, `brand-mark-svg.ts`) queda deprecado; no usar en UI nueva.

### Biblioteca (home)

- Carrusel del estante con pilas simétricas izquierda/derecha (`book-carousel.ts`).
- Libro destacado: lomo decorativo sin título + portada como héroe.
- Slot «Crear cuento» espejo discreto a la izquierda para balance visual.
- Luna del hero reducida (~6–8rem) para no competir con el carrusel del estante.

---

## Próximos pasos (producto)

1. Conectar **API de generación IA** al botón «Crear mi cuento» (payload = selección de receta + perfil).
2. Pasar `?plantilla=slug` desde plantillas a la receta (pre-rellenar molde clásico).
3. CI en GitHub Actions — archivo `.github/workflows/ci.yml` listo localmente; requiere push con scope `workflow` en GitHub.

---

## Archivos clave

```text
src/app/(site)/crear/
  page.tsx              # Hub servidor
  plantillas/page.tsx   # Listado clásicos
  adaptar/page.tsx      # Receta
src/components/
  CrearHub.tsx          # Hub cliente (progreso, medidor, tarjetas)
  CrearPageActions.tsx  # Hub y plantillas (adaptar usa barra del wizard)
  StoryRecipeBuilder.tsx
  BrandIllustration.tsx
  StoryBookshelf.tsx    # Estante + carrusel
public/images/brand/
  hero-luna-chacachon.png
  hero-luna-chacachon.webp
src/lib/
  family-profile-completion.ts
  story-recipe.ts
  recipe-summary.ts
  story-recipe-custom.test.ts
  recipe-synopsis.test.ts
  recipe-wizard-nav.test.ts
  brand-illustration.ts
  brand-illustration-server.ts
  book-carousel.ts
```

---

*Última actualización: julio 2026 — hero más compacto y footer alineado al header.*
