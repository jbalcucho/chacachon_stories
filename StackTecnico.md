# Stack Técnico y Consideraciones de Arquitectura — Chacachón

> Documento de referencia técnico para construir la plataforma web de cuentos infantiles hiperlocalizados con IA. Versión 1.0 — Junio 2026.

---

## 1. Decisiones estratégicas

### 1.1 Web primero, app después

| Criterio | Web (PWA) | App nativa |
|---|---|---|
| Distribución vía WhatsApp/YouTube | Link directo | Requiere descarga |
| Costo de desarrollo | Una base de código | 2–3 codebases |
| Time-to-market | Días | Semanas + review stores |
| SEO orgánico | Sí | No |
| Restricciones contenido infantil + IA | Mínimas | Apple/Google estrictos |
| Instalable en home screen | Sí (PWA) | Sí |

**Decisión:** PWA con Next.js, mobile-first. App nativa cuando se valide retención (>30% W4) y haya >1.000 usuarios pagos.

### 1.2 Vercel + Supabase vs AWS

| Criterio | Vercel + Supabase | AWS |
|---|---|---|
| Setup inicial | 1 día | 2–3 semanas |
| Costo 0–10k usuarios | $0–50/mes | $80–200/mes |
| Curva de aprendizaje | Baja | Alta |
| Postgres portable | Sí | Sí |

**Decisión:** Vercel + Supabase para MVP y primeros 1–2 años. Migrar a AWS solo si compliance o costos a >100k MAU lo justifican.

---

## 2. Stack recomendado

### Frontend

| Pieza | Elección |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (`strict: true`) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Animaciones | Framer Motion |
| Forms | react-hook-form + Zod |
| Estado servidor | TanStack Query |
| Audio | Howler.js o `<audio>` nativo |
| PWA | `@serwist/next` |

### Backend (Next.js)

| Pieza | Elección |
|---|---|
| API | Route Handlers (`app/api/*`) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Jobs async | Trigger.dev v3 o Inngest |

### Base de datos y storage

| Pieza | Elección |
|---|---|
| BD | Supabase Postgres |
| Auth | Supabase Auth (magic link + Google OAuth) |
| Storage usuario | Supabase Storage |
| Assets estáticos (ilustraciones, audio) | Cloudflare R2 (sin egress fees) |
| Migrations | Supabase CLI + `supabase/migrations/` |

### Servicios de IA

| Servicio | Proveedor | Uso |
|---|---|---|
| Texto | Anthropic Claude Sonnet 4.5 | Pregeneración de cuentos (no on-demand en MVP) |
| Imagen | fal.ai — Flux 1.1 Pro + LoRAs | Ilustraciones consistentes por personaje |
| TTS | ElevenLabs Multilingual v2 | Narración pregenerada por acento |
| Moderación | OpenAI Moderation API | Validar inputs de nombres |

### Pagos

| Mercado | Proveedor |
|---|---|
| Colombia | Wompi (Bancolombia) |
| LatAm | Mercado Pago |
| Global (futuro) | Stripe |
| Libro físico | Lulu API o aliado local |

### Servicios transversales

| Pieza | Servicio |
|---|---|
| Email | Resend |
| Analytics | PostHog |
| Errores | Sentry |
| Logs | Axiom o BetterStack |
| DNS/CDN extra | Cloudflare |

### Tooling de desarrollo

| Pieza | Elección |
|---|---|
| Package manager | pnpm |
| Linter | Biome o ESLint + Prettier |
| Tests | Vitest + Playwright |
| CI/CD | GitHub Actions + Vercel preview deploys |
| IDE | Cursor |

---

## 3. Arquitectura de alto nivel

```
Usuario (Browser / PWA)
        │
        ▼
     VERCEL
  ┌─────────────────────────────┐
  │ Server Components + API     │
  │ Edge Middleware (auth/rate) │
  └──────────┬──────────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
 SUPABASE         SERVICIOS EXTERNOS
 Postgres+Auth    Anthropic, fal.ai,
 + RLS            ElevenLabs, Wompi,
                  Resend, PostHog

 CLOUDFLARE R2 — ilustraciones + audios (immutable, CDN)

 TRIGGER.DEV — jobs async (generar imagen/audio, libros físicos)
```

---

## 4. Estructura de carpetas (Next.js 15)

```
chacachon/
├── app/
│   ├── (marketing)/          # Landing, precios, personajes
│   ├── (app)/                # Biblioteca, reader, perfiles
│   ├── (auth)/               # Login, callback
│   └── api/                  # Cuentos, lecturas, webhooks
├── components/
│   ├── ui/                   # shadcn
│   ├── cuento/               # Reader, AudioPlayer
│   └── marketing/
├── lib/
│   ├── supabase/             # client, server, middleware
│   ├── ai/                   # anthropic, fal, elevenlabs
│   ├── payments/             # wompi, mercadopago
│   └── interpolation.ts      # {{niño_1}} → "Mateo"
├── types/database.ts         # Generado por supabase gen types
├── supabase/migrations/
├── trigger/                  # Jobs async
└── middleware.ts
```

---

## 5. Seguridad y compliance

### Row Level Security (RLS) — obligatorio

Sin RLS, la `NEXT_PUBLIC_SUPABASE_ANON_KEY` expone toda la BD.

- `usuarios`, `perfiles_ninos`, `suscripciones`, `lecturas`: cada user solo ve sus datos.
- `cuentos`, `paginas`, `textos_localizados`: lectura pública solo si `estado = 'publicado'`.

### Habeas Data (Ley 1581 Colombia)

- Solo recolectar nombre y fecha de nacimiento del niño.
- Consentimiento parental explícito al registrarse.
- Botón "eliminar cuenta y datos" (derecho al olvido).
- No trackear datos de niños en analytics.

### Tier de moderación (1/2/3)

- Default = tier 1 (infantil).
- Tier 2/3 requiere PIN parental + disclaimer legal + log de auditoría.
- Tier 3 nunca en metadatos públicos ni SEO.

### Validación de inputs

- Nombres: regex letras + espacios, máx 50 chars, OpenAI Moderation API.
- Rate limit en endpoints de IA (Upstash).
- CAPTCHA (Cloudflare Turnstile) en signup si hay abuso.

### Secretos

- Service role key de Supabase solo server-side, nunca en cliente.
- Variables de entorno separadas en Vercel (preview vs production).

---

## 6. Performance

**Targets (móvil 4G):** LCP < 2.5s · CLS < 0.1 · INP < 200ms

| Táctica | Detalle |
|---|---|
| ISR | Catálogo y portadas de cuentos |
| Streaming SSR | Reader con Suspense |
| next/image | Todas las ilustraciones |
| Preload | Página N+1 (imagen + audio) mientras lee N |
| Cache R2 | `Cache-Control: public, max-age=31536000, immutable` |

---

## 7. Observabilidad

| Capa | Herramienta |
|---|---|
| Errores | Sentry |
| Web Vitals | Vercel Analytics |
| Producto | PostHog |

**Eventos clave PostHog:** `signup_completed`, `cuento_iniciado`, `cuento_completado`, `audio_activado`, `checkout_iniciado`, `suscripcion_activada`, `libro_fisico_solicitado`.

---

## 8. Costos estimados

| Escenario | Usuarios | Costo/mes USD |
|---|---|---|
| MVP | 0–500 | ~$21 |
| Tracción | 500–5.000 | ~$215 |
| Escalando | 5.000–25.000 | ~$820 |

A 5.000 usuarios × $3 USD/mes = $15.000 ingresos → margen bruto ~95%.

---

## 9. Roadmap técnico

| Sprint | Duración | Entregable |
|---|---|---|
| 0 — Setup | 3–5 días | Repo, Supabase, SQL+RLS, Vercel, PostHog, Sentry |
| 1 — Auth | 1 semana | Login, perfiles de niños |
| 2 — Reader | 2 semanas | Biblioteca, reader paginado, acento, audio, nombres |
| 3 — Pagos | 1–2 semanas | Wompi, gating premium, precios |
| 4 — Sharing | 1 semana | WhatsApp OG tags, preview personalizado |
| 5 — Admin | 1 semana | Panel subir cuentos, dashboards |
| 6 — Libro físico | 2 semanas | Lulu API, PDF personalizado, checkout |

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Inconsistencia visual personajes | LoRA por personaje + QA manual |
| Costos IA se disparan | Todo pregenerado, alertas de spend, rate limits |
| RLS mal configurada | Tests automáticos de RLS pre-launch |
| Tier 3 expuesto a niños | PIN parental, default tier 1, auditoría |
| Pago Wompi falla | Fallback Mercado Pago |

---

## 11. Checklist pre-launch

- [ ] RLS habilitada y testeada
- [ ] Política de privacidad y ToS publicados
- [ ] Consentimiento parental en signup
- [ ] Rate limiting en endpoints de IA
- [ ] Sentry + PostHog en producción
- [ ] Open Graph para share en WhatsApp
- [ ] 3 cuentos completos publicados
- [ ] Webhook Wompi probado end-to-end
- [ ] Test en iPhone Safari + Android Chrome real

---

## 12. Decisiones pendientes

1. Pricing concreto (mensual vs anual vs libro físico).
2. Dominio definitivo (`chacachon.com` / `.com.co`).
3. Razón social y registro SAS Colombia.
4. Onboarding Wompi (1–2 semanas, iniciar en paralelo).
5. Producir 3 cuentos completos antes de codear.
6. Identidad visual mínima (logo, paleta, tipografía).

---

*Documento vivo. Revisar cada sprint.*
