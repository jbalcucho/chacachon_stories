# Compartir cuentos (WhatsApp / OG)

> B5 · Julio 2026

Cada cuento del catálogo tiene preview propio al pegar el enlace en WhatsApp, iMessage o redes.

---

## Preview (Open Graph)

| Ruta | Qué genera |
|------|------------|
| `/leer/[slug]/opengraph-image` | PNG 1200×630 con título + moraleja |
| `generateMetadata` en `/leer/[slug]` | Título, descripción e **imagen explícita** |

`metadataBase` en `src/app/layout.tsx` (vía `NEXTAUTH_URL`) convierte rutas relativas en URLs absolutas — necesario para scrapers de WhatsApp.

**Helper:** `buildCatalogStoryMetadata()` en `src/lib/story-share.ts`.

**No compartible:** `/leer/generado/[id]` (privado, `noindex`).

---

## Botón en el lector

`StoryShareButton` en cuentos del catálogo:

1. Intenta **Web Share API** (móvil).
2. Si no está disponible → abre **WhatsApp** con título + URL.
3. Botón secundario **copia el enlace**.

Solo se muestra cuando `shareable` en `StoryReader` (slug de catálogo, sin `/`).

---

## Verificar en producción

1. Desplegar con `NEXTAUTH_URL` correcto.
2. Pegar `https://chacachon-stories.vercel.app/leer/operacion-a-dormir` en WhatsApp.
3. Debe verse título del cuento + tarjeta con ilustración Chacachón.

Herramientas útiles: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), caché de WhatsApp puede tardar unos minutos.

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/story-share.ts` | URLs, metadata OG, mensaje WhatsApp |
| `src/app/(reader)/leer/[slug]/opengraph-image.tsx` | Imagen dinámica |
| `src/app/(reader)/leer/[slug]/page.tsx` | Metadata por cuento |
| `src/components/StoryShareButton.tsx` | UI compartir |
