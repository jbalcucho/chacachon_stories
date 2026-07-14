# Biblia editorial — Chacachón

> Reglas de voz, estructura y calidad para cuentos generados por IA y curados a mano.
> Complementa [GuiaAcentos.md](../GuiaAcentos.md) (dialecto) y alimenta `src/lib/story-prompt.ts`.

**Estado del documento:** versión viva, no definitiva (v2). Se ajusta con evidencia real de generación y revisión editorial — no es una especificación congelada. Versión anterior: [v1](legacy/biblia-editorial-v1.md) (jul 2026), retirada por contradicción interna entre mundo narrativo (casa) y el prompt en producción (fantasía). Esta v2 la resuelve con el principio de §1.1.

**Audiencia (este entregable):** cuentos **familiares** para niños de hasta **~12 años** (lectura en voz alta o propia según edad), con humor de **doble audiencia**: el niño sigue la trama; el adulto reconoce la cotidianidad familiar. El foco editorial y de producto es la infancia / preadolescencia temprana.

**Fuera de alcance por ahora:** versiones explícitamente para adultos. No mezclar tono adulto en el corpus ni en el prompt de este MVP.

---

## 1. Qué hace único a un cuento Chacachón

Un cuento Chacachón **no** es un resumen genérico de "un niño aprendió X". Es:

1. **Puente casa-fantasía (principio central, reemplaza la regla v1 de "mundo reconocible only"):** cada cuento parte de una situación real de casa — el "moment" de la receta (dormir, pantallas, verduras, compartir) — como ancla emocional, y esa situación se **recrea dentro de un mundo de fantasía que varía cuento a cuento** (nunca el mismo escenario fijo de marca). La fantasía es la piel; lo real es la sustancia. Reglas de ejecución:
   - El detonante, la emoción y la resolución deben mapear 1:1 a algo que un padre colombiano reconozca de su propia casa. Si al quitarle el disfraz fantástico al cuento no queda una escena doméstica reconocible debajo, el cuento falló este pilar.
   - Los adultos reales del niño (mamá, papá, abuela) **siguen apareciendo como personajes reales** dentro del mundo fantástico — nunca se disuelven en roles fantásticos que los vuelven irreconocibles (ej. "el Gran Sabio", "el Navegante del Viento Solar"). Pueden tener un rol dentro de la fantasía, pero su vínculo y su voz de padre/madre real deben sentirse.
   - **1–3 anclas sensoriales concretas** por escena, incluso dentro del mundo fantástico (el cerebro asimila mejor lo que *siente*; evita lo abstracto).
   - Variar el arquetipo del protagonista y el tipo de mundo — nunca por defecto "capitán", "piloto" o cualquier rol que se repita cuento a cuento sin relación con el moment específico. El mundo y el rol nacen del moment, no de una plantilla.
   - Lo colombiano entra cuando el perfil o el lugar lo piden como ancla real (antes de la transformación fantástica); no forzar Bogotá ni saturar objetos/jerga como checklist de marca.

2. **Personal (reconocimiento familiar):** el cuento hace sentir *esta* familia, no "unos niños genéricos". Usar **exactamente** nombres y apodos de la receta/perfil; dar **agencia** al protagonista; integrar **1–2 marcas de dinámica** (quién pone el límite, quién alivia, rol de la mascota) y máximo **1–2 frases típicas** en diálogo. No volcar el perfil entero ni inventar datos que el usuario no dio.

3. **Pedagógico sin sermón (aprendizaje en la piel — no negociable):** el **reto** es el conflicto que el niño reconoce; la **lección** de la receta es solo la semilla del cierre y se **muestra** en lo que hacen o sienten, **nunca se declara**. Base de esta regla, no solo estilo: es consenso editorial y de desarrollo infantil — un niño que infiere el valor por sí mismo lo retiene e integra mejor que uno al que se lo explican; explicarlo le quita agencia justo donde el cuento busca dársela. Permitir **una** frase de insight del niño si suena a él (nunca a maestro). Prohibido sin excepción: "la moraleja es…", "aprendimos que…", "entendió que…", monólogos correctivos largos, subtítulos o escenas morales.

4. **Cálido y cómico (humor de reconocimiento):** el humor nace de la **situación cotidiana**, no de chistes sueltos ni de ridiculizar al niño. Doble audiencia: el niño sigue la gracia; el adulto sonríe al verse. Calor: límites firmes sin humillación. Densidad: 1–2 momentos cómicos memorables por cuento. Prohibido: burla cruel, grosería, clasismo, reírse *del* niño como tonto (incluye personajes secundarios burlándose del niño — no solo adultos).

5. **Ritmo de lectura en voz alta (oído primero):** frases en su mayoría cortas o medias; párrafos de 2–4 oraciones; diálogos con raya (`—`), turnos breves. Aire entre beats. El cierre baja el volumen. Evitar oraciones kilométricas, párrafos muro, cascadas de nombres. Formato Markdown limpio.

6. **Toque de tradición oral:** la apertura casi siempre usa **«Había una vez…»** o **«Era una vez…»** y ancla de inmediato el moment real antes de dar paso a la transformación fantástica. Cohesión: cada oración avanza; sin redundancia.

7. **Sin marca dentro del texto:** el lector no conoce «Chacachón». Solo nombres de la receta/perfil.

**Sobre originalidad narrativa (aspiración, no criterio de aceptación rígido):** cada cuento del corpus debe sentirse distinto a los demás — mundo, arquetipo, estructura de conflicto — inspirándose en el nivel de oficio de la tradición oral (Grimm, Rafael Pombo) y la narrativa contemporánea de estudio (Pixar/DreamWorks) como estrella polar. No se espera ese nivel de pulido en cada generación automática, pero sí que el corpus semilla curado a mano se acerque genuinamente, evitando el colapso de plantilla (mismo arquetipo, mismo giro, mismo tipo de cierre repetido cuento tras cuento).

Referencias canónicas: usar los **pilares** de esta sección y los few-shots en `src/lib/story-prompt-examples.ts` hasta que el corpus semilla (Fase 2 del plan de trabajo) esté publicado.

---

## 2. Estructura narrativa

### Andamiaje recomendado

```
1. MUNDO     — El moment real de casa, anclado, antes de transformarse en fantasía
2. RETO      — El dilema aparece dentro del mundo fantástico; tensión acorde a la edad
3. COMPLICACIÓN — Intento fallido o momento difícil (opcional si el cuento es corto)
4. GIRO      — Decisión, ayuda u objeto que cambia el rumbo
5. CIERRE    — Calma, vínculo restaurado; la lección queda implícita, nunca declarada
```

Andamiaje, no camisa de fuerza: un cuento corto puede fusionar mundo+reto o saltarse la complicación.

### Mínimo obligatorio (calidad)

1. **Deseo o conflicto claro.**
2. **Causa–efecto** — no una lista de eventos sueltos.
3. **Cierre en calma** — la lección se *siente*, no se predica.

### Extensión

| Métrica | Objetivo |
|---|---|
| Palabras | **400 – 600** (unifica v1: reemplaza el rango 350–600 de biblia y 400–700 de prompt — **acción pendiente en Fase 1: sincronizar `story-prompt.ts` y `story-quality.ts` a este rango único**) |
| Escenas (`##`) | 3 – 5 recomendadas |
| Tiempo de lectura | 5 – 8 minutos en voz alta |
| Párrafos por escena | 2 – 4 |

### Título y subtítulo

- **Título:** evocador, con nombre del protagonista o del reto.
- **Subtítulo** (`> …`): una línea que promete emoción o lugar. No repite la moraleja.

---

## 3. Voz y registro (tier 1)

**Default:** `neutro` — español claro, cálido y comprensible en todo Colombia. Acentos regionales son opcionales, elegidos por el usuario. Ver [GuiaAcentos.md](../GuiaAcentos.md).

### Sí usar
- Narrador cercano.
- Diálogos cortos con raya (`—`), turnos breves.
- Anclas de pertenencia dentro del mundo fantástico.
- Humor de reconocimiento.
- Calor en el vínculo: límite firme sin humillar.

### No usar
- Sermones explícitos en ninguna forma, incluida una frase corta al final que nombre la lección directamente.
- Violencia, miedo intenso, castigos humillantes, muerte, armas.
- Marcas comerciales, política, religión doctrinal.
- Insultos, clasismo, burla a barrios o estratos.
- Burla *del* niño, venga de un adulto o de un personaje secundario (animal, objeto mágico, etc.).
- Protagonista o arquetipo repetido por defecto entre cuentos (ej. "capitán" como comodín).
- Adultos reales disueltos en roles fantásticos irreconocibles.
- Oraciones kilométricas, párrafos muro.
- Cierre que abre un clímax nuevo en vez de bajar el volumen.
- Saturación de modismos u objetos "locales" (caricatura / postcard).

### Moraleja (detalle del pilar §1.3 — regla más estricta que v1)

- En la mente del lector adulto puede resumirse en una frase; en el texto del cuento, **nunca**, ni siquiera en una línea breve y cálida al cierre.
- Insight del niño al cierre (una línea, en su voz, mostrando lo que siente o hace) **sí** puede — declaración de un narrador o adulto explicando la lección, **no**.
- Sermón disfrazado también cuenta: monólogo largo de mamá/papá, "y desde ese día…", título/subtítulo moral.
- **Nota de reconciliación:** este pilar se mantiene sin excepción pese a la ambición de "enseñanza que haga a los niños mejores personas" — la lección se vive a través de las acciones del protagonista, no se explica; esto es lo que la hace efectiva, no lo que la diluye.

---

## 4. Uso de los ingredientes de la receta

| Ingrediente | Rol en la historia |
|---|---|
| **Protagonistas** | Llevan la acción; usar exactamente esos nombres. |
| **Reto** | Conflicto real de casa que se recrea en la fantasía; se siente en el nudo. |
| **Qué aprenden** | Semilla **solo** del cierre; nunca frase moral pegada. |
| **Lugar** | Ancla real antes de la transformación fantástica. |
| **Mascota** | Al menos un momento cómico o de apoyo. |

El perfil alimenta el **reconocimiento familiar** (§1.2), no un dump de ficha. Prioridad de datos: nombres/apodos → ciudad/barrio → mascotas → frases típicas (máx. 1–2) → gustos/no-le-gusta solo si refuerzan el reto.

**No:** inventar hermanos, colegios, direcciones, emails ni datos sensibles.

---

## 5. Ejemplos: así sí vs así no

### Apertura

**❌ Así no** (sin transformación fantástica, informe seco)
> Nico era un niño que a veces no quería dormir. Un día aprendió que dormir es importante.

**❌ Tampoco** (fantasía desconectada, sin ancla real, adultos disueltos)
> En el Reino de las Cúpulas Violetas, el capitán Nico debía entregar la chispa sagrada al Gran Sabio antes del anochecer.

**✅ Así sí** (moment real de casa, transformado en fantasía, padres reconocibles)
> Había una vez un niño llamado Nico que vivía en un apartamento donde olía a café y pan tostado. Esa noche, su cuarto se convirtió en el Faro de las Mil Estrellas, y su tarea era apagar el último farol antes de que el sueño se escapara volando. —Nico, ya casi es hora del farol —dijo su mamá desde la puerta, con la misma voz de todas las noches.

### Cierre / lección

**❌ Así no**
> Y Nico aprendió que dormir temprano es lo mejor. Fin.

**✅ Así sí**
> Nico apagó el farol sin pelear. Bingo se acomodó al pie de la cama. Afuera, la ciudad seguía su ruido de siempre, pero adentro ya era hora del silencio — y por primera vez, no le dio miedo.

---

## 6. Checklist de calidad (revisión humana o QA)

- [ ] ¿El moment real de casa es reconocible debajo de la fantasía (si le quitas el disfraz, queda una escena doméstica clara)?
- [ ] ¿Los adultos reales del niño siguen presentes como personajes reconocibles, no disueltos en roles fantásticos?
- [ ] ¿El mundo fantástico y el arquetipo del protagonista son distintos a los de otros cuentos del corpus (sin plantilla repetida)?
- [ ] ¿Empieza con «Había una vez» / «Era una vez»?
- [ ] ¿Hay cohesión causa–efecto?
- [ ] ¿Evita nombrar «Chacachón» dentro del texto?
- [ ] ¿Un niño de hasta ~12 años entiende qué pasó sin explicación adulta?
- [ ] ¿El adulto sonríe y el niño entiende la gracia (humor de reconocimiento, no burla)?
- [ ] ¿El niño *vivió* la lección o alguien la explicó? (si alguien la explicó, el cuento no pasa)
- [ ] ¿Se siente *esta* familia (nombres exactos, agencia del niño)?
- [ ] ¿400–600 palabras y ~3–5 escenas?
- [ ] ¿Sin violencia, miedo fuerte ni sermón en ninguna forma?
- [ ] ¿Se lee en voz alta sin tropezar?

---

## 7. Relación con el código

| Artefacto | Función |
|---|---|
| `docs/biblia-editorial.md` | Fuente de verdad editorial (este archivo, v2) |
| [GuiaAcentos.md](../GuiaAcentos.md) | Matiz dialectal y tiers |
| `src/lib/story-accent.ts` | Códigos de acento, default `neutro` |
| `src/lib/story-prompt-examples.ts` | Fragmentos few-shot de cuentos curados |
| `src/lib/story-prompt.ts` | System prompt + mensaje usuario → API — **requiere actualización en Fase 1 para reflejar el puente casa-fantasía y el rango 400–600 palabras** |
| `src/lib/story-mock.ts` | Fallback sin IA (no sustituye calidad) |
| `src/lib/story-quality.ts` | Rúbrica automática — **requiere actualización del rango de palabras** |
| `docs/ia-generacion.md` | Infra, keys, Vercel, persistencia |
| `docs/guia-neuroeducacion-cuentos.md` | Referencia neuro únicamente; donde contradiga el pilar anti-sermón (§1.3), **este documento (biblia) tiene precedencia** |

---

## 8. Cuentos curados como corpus de referencia

Los cuentos en `cuentos/*.md` no son "entrenamiento" en el sentido de fine-tuning; son **few-shot editorial**:

1. **Refinar** cada cuento publicado (tono, ritmo, checklist §6).
2. **Etiquetar** variantes por `codigo_acento` cuando existan.
3. **Extraer** fragmentos cortos (apertura + diálogo) a `story-prompt-examples.ts`.
4. **No copiar** tramas literalmente en generación — solo imitar voz y nivel de detalle.
5. **Confirmar variedad:** antes de aceptar un cuento nuevo al corpus, comparar su mundo fantástico y arquetipo contra los ya existentes — si se repite, no entra tal cual.

---

## 9. Iteración del prompt (proceso recomendado)

1. Elegir recetas fijas de prueba (dormir, pantallas, verduras, compartir).
2. Generar y guardar los markdowns.
3. Comparar lado a lado con el checklist §6.
4. Ajustar **una regla a la vez** en `story-prompt.ts`.
5. Repetir hasta que un lector externo diga "esto sí es Chacachón".

No subir temperatura ni tokens como primer recurso; primero claridad de reglas y contexto de perfil. **Nota:** la temperatura actual en producción (1.05) está señalada como decisión abierta en el plan de trabajo — revisar si alimenta variedad deseada o deriva de tono no controlada.

---

*v2 — julio 2026. Resuelve la contradicción v1 (casa vs. fantasía) con el principio de puente en §1.1. Documento vivo, sujeto a revisión con cada ronda del corpus semilla.*
