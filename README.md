# Chacachón

Plataforma web de cuentos infantiles hiperlocalizados con IA. Cuentos con humor regional (bogotano, costeño, etc.), lecciones de crianza y personajes originales inspirados en la nostalgia de los 80 y 90.

## Documentación

| Documento | Descripción |
|---|---|
| [ContextoChacachon.md](./ContextoChacachon.md) | Plan de negocio original: concepto, IP, stack inicial, BD básica, GTM, presupuesto y prompts |
| [contextonew.md](./contextonew.md) | Contexto enriquecido: negocio, monetización, schema SQL, flujo de producto y DDL |
| [StackTecnico.md](./StackTecnico.md) | Stack recomendado, arquitectura, seguridad, costos, roadmap y checklist pre-launch |

## Resumen del producto

- **Qué es:** app web (PWA) de co-lectura nocturna para familias latinoamericanas.
- **Diferenciador:** "Stand-up Comedy Narrativo" — el padre se ríe con la jerga local, el niño aprende la moraleja.
- **Personajes:** Capitán Sancocho, Familia Órbita, Escuadrón Recreo (IP propia).
- **MVP:** cuentos pregenerados en BD con cambio de acento instantáneo e interpolación de nombres (`{{niño_1}}`, `{{niño_2}}`).

## Stack (MVP)

- **Frontend/Backend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **BD/Auth:** Supabase (PostgreSQL + RLS)
- **Hosting:** Vercel
- **Assets:** Cloudflare R2
- **IA texto:** Claude Sonnet 4.5 (pregenerado)
- **IA imagen:** Flux + LoRAs (fal.ai)
- **TTS:** ElevenLabs
- **Pagos:** Wompi (CO) + Mercado Pago (LatAm)

## Clonar en otro equipo

```bash
git clone https://github.com/jbalcucho/chacachon_stories.git
cd chacachon_stories
```

## Estado del proyecto

Fase de documentación y planificación. El código de la aplicación aún no está en este repositorio.
