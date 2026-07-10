# Modo demo (sin login)

> B3 · Julio 2026

Permite probar el producto sin cuenta: leer el catálogo y armar recetas con la familia Chacachón de ejemplo.

---

## Cómo funciona

| Acción | Sin login | Con login + perfil |
|--------|-----------|-------------------|
| Leer catálogo (`/leer/[slug]`) | ✅ nombres demo | ✅ tu familia |
| Armar receta (`/crear/adaptar`) | ✅ ingredientes demo | ✅ tu perfil |
| Generar cuento con IA | ❌ requiere Google | ✅ |
| Guardar cuentos generados | ❌ | ✅ `/mis-cuentos` |
| Editar perfil (`/familia`) | ❌ middleware | ✅ |

**Perfil demo:** `perfiles/familia-chacachon.json` (Nico, Simónchin, Bingo, etc.).

**Resolución en código:** `getReaderProfile(userId)` en `src/lib/reader-profile.ts` devuelve `source: "demo"` cuando no hay sesión o perfil válido.

---

## UX

- **Home (`/`):** banner si no hay sesión → explica demo + CTA login.
- **Lector:** badge «Demo» + enlace «Usar mi familia» (`DemoModeBanner` compacto).
- **Crear hub:** visitantes anónimos pueden ir a `/crear/adaptar` con familia demo (kicker «Modo demo»).

No usamos `?demo=` en la URL: el demo es el fallback por defecto.

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/reader-profile.ts` | Demo vs usuario |
| `perfiles/familia-chacachon.json` | Datos de ejemplo |
| `src/components/DemoModeBanner.tsx` | Aviso reutilizable |
| `src/app/(site)/page.tsx` | Banner en biblioteca |
| `src/app/(site)/crear/page.tsx` | Hub abierto a demo |
