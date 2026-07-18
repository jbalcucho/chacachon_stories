# Plan de trabajo — Chacachón Stories
Basado en: `docs/estado-proyecto-2026-07-13.md` (auditoría Cursor) + análisis Claude, 2026-07-13

---

## Principio editorial resuelto (bloquea todo lo demás)

**Decisión de Jose:** los cuentos parten de una situación real de casa (el "moment": dormir, pantallas, verduras, compartir) como ancla emocional y de reconocimiento, y esa situación se **recrea dentro de un mundo de fantasía** — no se abandona lo real, se transforma.

**Regla operativa para prompt/biblia unificados:**
1. El detonante, la emoción y la resolución del niño deben mapear 1:1 a algo que un padre colombiano reconozca de su propia casa (ej. "no quiere comer verdura", "se hipnotiza con pantalla", "no quiere compartir").
2. El mundo fantástico es la piel, no la sustancia — se nombra explícitamente qué representa cada elemento fantástico en términos reales (ej. "espejos que hipnotizan" = tablet; "capitanes que cargan canastas" = tarea doméstica).
3. Los adultos de la vida real del niño (mamá, papá, abuela) siguen apareciendo como personajes reales dentro del mundo fantástico — no se disuelven en el mundo mágico. Esto es lo que falló en los 6 ejemplos de Gemini: los padres se volvían "navegantes" o "capitanes" y perdían su rol reconocible.
4. Variar el arquetipo del protagonista — nunca "capitán" por defecto. El mundo cambia según el moment, no según una plantilla fija.
5. Cierre mostrado, nunca explicado — ningún personaje ni narrador declara la moraleja.

Esto reemplaza la contradicción actual (biblia=casa vs. prompt=fantasía) por una sola regla de diseño coherente.

---

## Fase 0 — Contención inmediata (esta semana, bajo riesgo, alto impacto)

| Tarea | Dónde | Criterio de hecho |
|---|---|---|
| Activar `TRIAL_AI_LIMITS_DISABLED=0` en producción | Code / Vercel env | Límite real confirmado con una prueba manual que dispare el 429 |
| Fix falso-positivo de CI: `validate:quality` y `validate:catalog` deben **fallar** (no pasar en verde) si el catálogo/corpus está vacío y se espera que no lo esté | Code | CI en rojo hasta que exista al menos 1 cuento curado real |
| Agregar `@relation` FK real a `GeneratedStory.userId` + política de cascade | Code | Migración aplicada, test de integridad pasa |

---

## Fase 1 — Unificar identidad narrativa y reconciliar documentación (1–2 semanas)

| Tarea | Dónde | Criterio de hecho |
|---|---|---|
| Reescribir `biblia-editorial.md` con el principio "puente casa-fantasía" de arriba, corrigiendo numeración duplicada, el conflicto "7 vs. 5 pilares", y la inconsistencia de extensión (350–600 vs. 400–700) | Home (borrador) → Code (commit) | Biblia sin contradicciones internas, aprobada por Jose |
| Ajustar `story-prompt.ts` para que la instrucción de sistema refleje la regla del puente (no fantasía desconectada, adultos reales presentes, variar protagonista) | Code | 3 generaciones de prueba con distinto "moment" no repiten arquetipo ni pierden a los padres |
| Archivar documentación redundante/legacy: `StackTecnico.md`, `contextonew.md`, `ContextoChacachon.md` → mover a `docs/legacy/` con nota de fecha de retiro | Code | Root del repo limpio; solo `docs/` activo como fuente de verdad |
| Resolver las 15 inconsistencias doc↔código listadas en el audit §5.2, una por una (marcar cada una como código-gana o doc-gana) | Code + Home para decisiones ambiguas | Checklist de 15 con estado cerrado |
| Decidir y documentar: `guia-neuroeducacion-cuentos.md` ¿es normativa o archivo? (choca con anti-sermón) | Home (decisión) → Code (mover si aplica) | Documento reclasificado o archivado |

---

## Fase 2 — Corpus curado semilla (2–3 semanas, la fase de mayor valor)

| Tarea | Dónde | Criterio de hecho |
|---|---|---|
| Generar 8–10 cuentos candidatos aplicando el puente casa-fantasía, cubriendo los "moments" principales (dormir, pantallas, verduras, compartir, + 1–2 nuevos) | Home (generación + revisión editorial fina, aquí es donde vale la pena usar Opus puntualmente) | Cada cuento pasa el checklist §7 de la biblia unificada sin excepciones |
| Confirmar que ningún cuento repite el arquetipo "capitán" ni pierde a los padres como personajes reales | Home | Revisión cruzada manual, tabla de variación de arquetipos |
| Extraer fragmentos few-shot (apertura + diálogo) de los mejores 4–5 cuentos hacia `story-prompt-examples.ts` | Code | Few-shots actualizados, `validate:quality` corre sobre ellos y pasa |
| Publicar los cuentos aprobados en `cuentos/*.md` + seed real en Prisma (dejar de tener `Story` en 0 tras seed) | Code | `cuentos/` con contenido real; seed puebla al menos 8 historias |
| Poblar `/crear/plantillas` con 2–3 clásicos usando el mismo principio | Code | Array `CLASSIC_PLANTILLAS` deja de estar vacío |

---

## Fase 3 — Decisiones de producto pendientes (§8 del audit, en paralelo a Fase 2)

Estas son tuyas, de negocio — el plan solo las deja explícitas para que no se queden indefinidamente abiertas:

- [x] ¿Trial "guarda este cuento" en la cuenta al hacer login, o siempre empieza uno nuevo en `/crear`? → **Sí, se importa.** Implementado: `POST /api/cuentos/importar-trial` + `TrialImportBridge` (2026-07-14). Al aterrizar en `/crear` ya logueado, si queda un cuento de prueba en `sessionStorage`, se guarda como `GeneratedStory` del usuario y redirige a `/leer/generado/[id]`.
- [x] Temperature 1.05 en Gemini ¿se mantiene (variedad) o se baja (consistencia de marca)? → **Se mantiene.** La revisión editorial de Fase 2 confirmó variedad real de arquetipos con este valor; sin evidencia de deriva de tono en producción, bajarlo es prematuro.
- [x] Alcance de acentos: ¿solo Bogotá + neutro, o se implementa la guía regional completa? → **Se queda solo Bogotá + neutro por ahora.** Ampliar implica más few-shots y curaduría por acento mientras el corpus semilla es chico; revisar cuando haya tráfico real que lo pida.
- [x] CTA post-trial: ¿a `/crear` directo, o a `/familia` primero como onboarding corto? → **Directo a `/crear`** (menos fricción). Se mantiene el comportamiento actual.

---

## Fase 4 — Limpieza técnica menor (cuando haya espacio, no bloqueante)

- [ ] Middleware: agregar `/crear` al matcher de protección (hoy solo la API exige sesión) → **Pendiente de decisión (2026-07-14):** revisando el código, `/crear` y `/crear/adaptar` manejan al visitante anónimo a propósito (familia demo, cuota `null`, banner "Entra con Google para guardar") — es un modo de prueba deliberado, no un descuido. Agregarlo al matcher forzaría un redirect a login y rompería esa experiencia. No lo apliqué sin confirmar contigo si el modo demo sigue siendo el comportamiento deseado.
- [x] Renombrar `requireSessionUser` (retorna null, no lanza — el nombre engaña) → **Eliminado** (2026-07-14): no tenía ningún uso real en el código, era un alias muerto de `getSessionUser`.
- [x] Revisar si `sync-story-html` PAIRS=[] sigue teniendo sentido o se elimina como script muerto → **Eliminado** (2026-07-14): `scripts/sync-story-html.mjs` y el npm script `sync:html` removidos. No estaba enganchado a `predev`/`prebuild`, `PAIRS` llevaba vacío desde antes de la Fase 2, y el nuevo catálogo dinámico (`/leer/[slug]` + `cuentos/*.md` + seed) ya cubre esa necesidad para el corpus real.

---

## Fase 5 — futuro: gate semántico por capas según volumen (no implementar todavía)

Contexto (2026-07-16): se construyó un gate semántico LLM-as-judge (Haiku, `story-quality-judge.ts`) que complementa el gate de regex (Fix 4, `story-quality.ts`) — detecta sermón disfrazado, puente casa-fantasía roto y adultos disueltos en fantasía, cosas que el regex no puede anticipar por sí solo. Datos reales medidos: ~$0.0025 USD por llamada al juez, pero **~7-9 segundos de latencia** (muy por encima de la hipótesis inicial de 1-2s).

**Decisión actual (tráfico bajo por trial limits de Fase 0):** `SEMANTIC_GATE_ENABLED=100` — bloqueante con reintento en el 100% del tráfico, con un margen de gracia de 5s (`JUDGE_GRACE_TIMEOUT_MS` en `story-generation.server.ts`) que sirve el cuento sin esperar si el juez tarda más, logueando el veredicto tardío solo para medición. Se prioriza calidad narrativa (la ventaja competitiva del producto) sobre latencia mientras el volumen es bajo.

**Cuando el tráfico crezca de verdad** (más usuarios simultáneos, la latencia de 7-9s por generación deja de ser aceptable a escala), migrar a una estrategia por capas:
- **Síncrono + bloqueante** solo para la primera generación de un usuario nuevo en `/probar` (mayor impacto en primera impresión/conversión — vale la pena la espera ahí).
- **Async, log-only** (sin bloquear, sin reintento) para generaciones posteriores de usuarios ya registrados en `/crear` — se sigue midiendo la tasa de violaciones sin pagar la latencia en cada cuento.

No implementar esto todavía — solo queda documentado para no perder la decisión cuando el volumen lo justifique.

---

## Cómo dividir el trabajo entre Home y Code

- **Home (aquí):** decisiones editoriales, redacción/revisión fina de cuentos, resolver ambigüedades de negocio, aprobar antes de que algo se materialice en el repo
- **Code:** todo lo que toca archivos reales — prompts, migraciones, seeds, commits, correr validadores
- **Opus puntual:** solo en la revisión fina de los 8–10 cuentos semilla de la Fase 2, donde detectar sutileza (sermón disfrazado, arquetipo repetido, padres perdidos) importa más que el costo

---

*Plan generado a partir de la auditoría 2026-07-13 y la decisión editorial de Jose (puente casa-fantasía). Revisar y marcar avance conforme se completen tareas.*
