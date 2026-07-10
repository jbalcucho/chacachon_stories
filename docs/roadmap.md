# Roadmap — HistorIAs Chacachon

Última actualización: julio 2026  
Producción: https://chacachon-stories.vercel.app  
Fase actual: **MVP** (Sprint 0–1)

---

## 1. Qué tenemos hoy

### Producto en producción

| Área | Estado |
|------|--------|
| Estantería interactiva + lector tipo libro (paginación DOM) | ✅ |
| Login Google + perfil familiar (JSONB en Neon) | ✅ |
| Personalización en lectura (`/leer/[slug]`, 5 cuentos en manifest) | ✅ |
| Hub `/crear` + asistente de receta + acentos | ✅ |
| Generación IA (Gemini → Claude → mock) | ✅ |
| PWA instalable, iconos, OG, CSP enforce | ✅ |
| Tests unitarios (48) sobre parsing, prompt, receta | ✅ |

### Stack

Next.js 15 · Neon Postgres + Prisma · NextAuth (Google, JWT) · Zod · Vercel  
Modelo federado Balcu: DB, auth y deploy propios; hub solo vitrina.

### Contenido

- **4 cuentos Chacachón publicados** en estante (lobo, cerditos, operación a dormir, nico sin pantallas).
- **1 piloto Balcutron** (fuera del estante por `familyTag`).
- **4 borradores** en catálogo sin HTML.
- Fuentes en `cuentos/*.md` y plantillas `*.template.md`; manifest en `src/data/story-content-manifest.json`.

---

## 2. Fase A — Endurecer (urgente) ← en curso

Objetivo: abrir a usuarios reales sin riesgo de abuso, fuga de PII ni costo descontrolado.

| # | Tarea | Prioridad | Estado |
|---|--------|-----------|--------|
| A1 | Auth obligatoria en `POST /api/cuentos/generar` | 🔴 | ✅ |
| A2 | Cuota diaria por usuario (`GENERATION_DAILY_LIMIT`) | 🔴 | ✅ |
| A3 | Propiedad en `/leer/generado/[id]` (solo el dueño lee) | 🔴 | ✅ |
| A4 | Moderación de texto libre («+ Otro») antes del LLM | 🔴 | ✅ |
| A5 | Sin fallback en memoria en producción al guardar cuentos | 🟠 | ✅ |
| A6 | Tests de API / moderación / cuotas | 🟠 | ✅ |
| A7 | Logging estructurado + alerta de costo LLM | 🟡 | ✅ |
| A8 | Migrar Gemini a plan de pago antes de tráfico masivo | 🟡 | Pendiente (tras pulir demos) |

---

## 3. Fase B — Retención

Objetivo: medir retención semanal (W4) antes de monetizar.

| # | Tarea | Impacto | Estado |
|---|--------|---------|--------|
| B1 | Biblioteca personal de cuentos generados | Alto | ✅ |
| B2 | Vista previa de receta antes de gastar generación | Alto | ✅ |
| B3 | Modo demo sin login (leer catálogo con familia de ejemplo) | Medio | ✅ |
| B4 | Pre-llenado `?plantilla=slug` en wizard | Medio | ✅ |
| B5 | OG dinámico por cuento para compartir en WhatsApp | Alto (viral) | ✅ |
| B6 | Barra de progreso visual en lector | Bajo | ✅ |
| B7 | Recordar tamaño de fuente entre sesiones | Bajo | ✅ |

---

## 4. Fase C — Monetización

Solo si W4 valida demanda (>30 % retención semana 4, según `StackTecnico.md`).

| # | Tarea |
|---|--------|
| C1 | Freemium: demos ilimitados + N cuentos IA gratis |
| C2 | Integración Wompi / Mercado Pago (Colombia / LatAm) |
| C3 | Suscripción digital (biblioteca + generación ilimitada) |
| C4 | Medir COP por cuento generado (unit economics) |

---

## 5. Fase D — Expansión

| # | Tarea |
|---|--------|
| D1 | Audio: Web Speech API → ElevenLabs |
| D2 | Ilustraciones por escena (fal.ai) + CDN |
| D3 | Libro físico print-on-demand con nombre del niño |
| D4 | Admin editable (publicar, editar catálogo) |
| D5 | App nativa (solo tras >1.000 pagantes) |
| D6 | IP original: Balcutron, Capitán Sancocho, Escuadrón Recreo |

---

## 6. Modelo de negocio (referencia)

Documentado en `ContextoChacachon.md` y `contextonew.md`:

1. **Adquisición:** animáticos YouTube → CTA a web para personalizar.
2. **Freemium:** catálogo + 1–2 cuentos IA gratis → suscripción.
3. **Upsell físico:** libro impreso / figura 3D (mayor margen emocional).
4. **Viral:** preview WhatsApp con OG dinámico.

---

## 7. Riesgos conocidos

| Riesgo | Mitigación |
|--------|------------|
| Abuso de API LLM sin auth/rate limit | Fase A (auth + cuota) |
| PII de menores en cuentos generados expuestos por UUID | Fase A (ownership) |
| Costo IA sin tracking | A7 + C4 |
| Texto libre malicioso en prompt | Fase A (moderación) |
| Paginación móvil frágil | Medición in-viewport (jul 2026) |

---

## 8. Próximos pasos inmediatos

1. Completar Fase A (esta semana). ✅ (A8 aplazado: pulir demos antes de plan de pago)
2. Desplegar y verificar en móvil + web.
3. Fase B completa (B1–B7). Siguiente foco: **pulir cuentos demo** (en curso: `nico-dia-sin-pantallas` ✅; faltan lobo, operación, cerditos).

---

## Referencias

- `docs/architecture.md` — arquitectura técnica
- `docs/ia-generacion.md` — pipeline IA
- `docs/crear-flow.md` — flujo crear cuento
- `docs/demo-mode.md` — lectura y receta sin login
- `docs/compartir-cuentos.md` — OG y WhatsApp
- `docs/database.md` — esquema Prisma
- `ContextoChacachon.md` — plan de negocio
- `StackTecnico.md` — roadmap técnico histórico
