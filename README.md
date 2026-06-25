# Chacachón

Plataforma web de cuentos infantiles hiperlocalizados con IA. Cuentos con humor regional (bogotano, costeño, etc.), lecciones de crianza y personajes originales inspirados en la nostalgia de los 80 y 90.

## Documentación

| Documento | Descripción |
|---|---|
| [ContextoChacachon.md](./ContextoChacachon.md) | Plan de negocio original: concepto, IP, stack inicial, BD básica, GTM, presupuesto y prompts |
| [contextonew.md](./contextonew.md) | Contexto enriquecido: negocio, monetización, schema SQL, flujo de producto y DDL |
| [GuiaAcentos.md](./GuiaAcentos.md) | Glosario de acentos y registros (rolo, gomelo, ñero), frases bogotanas, tiers y reglas anti-caricatura |
| [cuentos/familia-balcutron-operacion-a-dormir.html](./cuentos/familia-balcutron-operacion-a-dormir.html) | Cuento en HTML para leer en pantalla (letra amplia, estilo nocturno) |
| [cuentos/familia-chacachon-operacion-a-dormir.md](./cuentos/familia-chacachon-operacion-a-dormir.md) | Cuento de prueba personalizado (familia real, El Rosario, apartamento Bogotá) |
| [cuentos/familia-chacachon-cerditos-caperucita.md](./cuentos/familia-chacachon-cerditos-caperucita.md) | Cerditos + Caperucita · versión apartamento (estilo guion) |
| [cuentos/familia-chacachon-el-lobo-y-las-palabras.md](./cuentos/familia-chacachon-el-lobo-y-las-palabras.md) | **Versión narrativa** · monte, vereda, casitas clásicas · misma moraleja |
| [cuentos/familia-chacachon-el-lobo-y-las-palabras.html](./cuentos/familia-chacachon-el-lobo-y-las-palabras.html) | Misma historia narrativa en HTML (tema vereda/bosque, letra amplia) |
| [cuentos/familia-chacachon-cerditos-caperucita.html](./cuentos/familia-chacachon-cerditos-caperucita.html) | Versión apartamento en HTML para leer en pantalla |
| [cuentos/familia-balcutron-operacion-a-dormir.md](./cuentos/familia-balcutron-operacion-a-dormir.md) | Cuento piloto Balcutron en prosa fluida (versión niños) |
| [cuentos/familia-balcutron-hora-del-nono.md](./cuentos/familia-balcutron-hora-del-nono.md) | Cuento piloto técnico: 10 páginas, todas las variantes de acento |
| [StackTecnico.md](./StackTecnico.md) | Stack recomendado, arquitectura, seguridad, costos, roadmap y checklist pre-launch |
| [PerfilFamiliar.md](./PerfilFamiliar.md) | Perfil familiar flexible (JSONB), onboarding por capas, interpolación y persistencia |
| [perfiles/](./perfiles/) | Perfiles JSON de prueba + plantilla con variables para validar el esquema |

## Resumen del producto

- **Qué es:** app web (PWA) de co-lectura nocturna para familias latinoamericanas.
- **Diferenciador:** "Stand-up Comedy Narrativo" — el padre se ríe con la jerga local, el niño aprende la moraleja.
- **Personajes:** Capitán Sancocho, Familia Balcutron, Escuadrón Recreo (IP propia).
- **MVP:** cuentos pregenerados en BD con cambio de acento instantáneo, interpolación de nombres (`{{niño_1}}`, `{{niño_2}}`) y **perfil familiar** editable (documento JSONB por hogar — ver [PerfilFamiliar.md](./PerfilFamiliar.md)).

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

## Sitio estático (Vercel)

Índice en la raíz del repo para probar deploy:

| Archivo | Descripción |
|---|---|
| [index.html](./index.html) | **Las historias de Chacachón** — biblioteca con enlaces a los cuentos |
| [vercel.json](./vercel.json) | Configuración mínima para Vercel (sitio estático) |

### Publicar en Vercel

1. Push del repo a GitHub.
2. [vercel.com/new](https://vercel.com/new) → Importar `chacachon_stories`.
3. Framework Preset: **Other** (sin build; Vercel sirve `index.html` y `cuentos/`).
4. Deploy.

La URL quedará tipo `https://chacachon-stories.vercel.app`.

## Estado del proyecto

Fase de documentación + **sitio estático de prueba**. La app Next.js + Supabase aún no está en el repo.
