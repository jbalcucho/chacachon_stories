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
| Marca luna + libro | ✅ Header, home, OG | `BrandMark.tsx` · `brand-mark-svg.ts` |

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
| Héroes | 3 | Sí |
| El reto (dilema) | 1 | Sí |
| Qué aprenden (emoción/lección) | 2 | Sí |
| ¿Dónde pasa? | 1 | Sí |
| Mascota, acompañantes, rol de reto, objeto, molde | 1–4 | No («Agregar más») |

### Ingredientes

Salen del perfil familiar vía `buildRecipeIngredients()` en `src/lib/story-recipe.ts`. Demo Chacachón si no hay sesión o perfil.

### Interacción

- **Tap** en chip → añade/quita en la zona.
- **Drag** en desktop (`pointer: fine`) → arrastrar chip a la zona.
- Zonas de **máximo 1**: al elegir otro ítem, **reemplaza** el anterior.
- Chips seleccionados comparten el mismo estilo (borde + sombra miel) en móvil y desktop.
- **Modo guiado** (primera visita en móvil): una zona core a la vez; `localStorage` `chacachon-recipe-guided-v1`.
- **Checklist** 4 ítems (héroes, reto, lección, lugar) + contador.
- **Sugerencias** por combinación reto/lección (reglas estáticas).
- **`?plantilla=slug`**: pre-rellena dilema y molde; molde en bloque core si aplica.
- **Avatares con inicial** para personas en chips/tokens.
- **Resumen** con título + sinopsis narrativa + mini portada (BrandMark).
- **Paso 2 de 3** en header + `CrearProgress` compartido con `/crear`.

### Defaults de demo

- Héroe: primer niño del perfil.
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

- Símbolo: **luna creciente + libro abierto** (sin niño en la luna).
- Wordmark: texto plano **Chacachón** (C normal).
- OG cards: gradiente nocturno + marca grande (`opengraph-image.tsx`).

---

## Próximos pasos (producto)

1. Conectar **API de generación IA** al botón «Crear mi cuento» (payload = selección de receta + perfil).
2. Pasar `?plantilla=slug` desde plantillas a la receta (pre-rellenar molde clásico).
3. CI en GitHub Actions (`.github/workflows/ci.yml` pendiente de push con scope `workflow`).
4. Iconos SVG en tarjetas del hub (sustituir emojis si se unifica ilustración).

---

## Archivos clave

```text
src/app/(site)/crear/
  page.tsx              # Hub servidor
  plantillas/page.tsx   # Listado clásicos
  adaptar/page.tsx      # Receta
src/components/
  CrearHub.tsx          # Hub cliente (progreso, medidor, tarjetas)
  StoryRecipeBuilder.tsx
  BrandMark.tsx
src/lib/
  family-profile-completion.ts
  story-recipe.ts
  brand-mark-svg.ts
```

---

*Última actualización: julio 2026 — post commit `826c271` (hub /crear interactivo).*
