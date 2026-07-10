# Biblia editorial — Chacachón

> Reglas de voz, estructura y calidad para cuentos generados por IA y curados a mano.  
> Complementa [GuiaAcentos.md](../GuiaAcentos.md) (dialecto) y alimenta `src/lib/story-prompt.ts`.

**Audiencia del cuento:** niños de **3 a 7 años** leídos en voz alta por un adulto, de noche o en familia.  
**Audiencia del humor:** doble — el niño sigue la trama; el adulto reconoce la cotidianidad familiar (hogar, colegio, ciudad colombiana).

---

## 1. Qué hace único a un cuento Chacachón

Un cuento Chacachón **no** es un resumen genérico de “un niño aprendió X”. Es:

1. **Hiperlocal:** edificio, ascensor, vereda, colegio, transporte, tablet, chanclas — el mundo real del niño colombiano (Bogotá cuando el perfil o el lugar lo indiquen).
2. **Personal:** nombres, mascotas y dinámica familiar del perfil (cuando esté disponible).
3. **Pedagógico sin sermón:** el reto del cuento coincide con un dolor real de crianza; la lección se **muestra** en el desenlace.
4. **Cálido y cómico:** risa suave para el adulto, nunca burla cruel ni vulgaridad.
5. **Ritmo de lectura en voz alta:** frases claras, párrafos respirables, diálogos con raya (`—`).

Referencias canónicas (leer antes de afinar prompts):

| Cuento | Qué demuestra |
|--------|----------------|
| `cuentos/familia-chacachon-operacion-a-dormir.md` | Rutina nocturna, lista de mamá, humor parental |
| `cuentos/familia-chacachon-nico-dia-sin-pantallas.md` | Reto moderno, escena de apartamento, moraleja sin discurso |
| `cuentos/familia-chacachon-el-lobo-y-las-palabras.md` | Molde clásico + familia, metáfora del lobo, tier 1 |

---

## 2. Estructura narrativa obligatoria

Todo cuento generado debe seguir este arco (3 a 5 escenas con `## `):

```
1. MUNDO     — Dónde estamos, quién es quién, tono del día (1 escena)
2. RETO      — El dilema aparece; tensión suave, sin miedo fuerte (1 escena)
3. COMPLICACIÓN — Intento fallido o momento difícil (1 escena, opcional si es corto)
4. GIRO      — Decisión, ayuda, objeto o personaje que cambia el rumbo (1 escena)
5. CIERRE    — Calma, abrazo, rutina restaurada; la lección queda implícita (1 escena)
```

### Extensión

| Métrica | Objetivo |
|---------|----------|
| Palabras | **350 – 600** |
| Escenas (`##`) | **3 – 5** |
| Tiempo de lectura | **5 – 8 minutos** en voz alta |
| Párrafos por escena | 2 – 4 |

### Título y subtítulo

- **Título:** evocador, con nombre del protagonista o del reto cuando encaje.  
  Ej.: *La misión secreta de Nico: el guardián de la noche* · *El día sin pantallas de Nico*.
- **Subtítulo** (`> …`): una línea que promete emoción o lugar. No repite la moraleja.

---

## 3. Voz y registro (tier 1)

**Default en generación IA y en `/crear`:** `neutro` — español claro, cálido y comprensible en todo Colombia.  
Los acentos regionales (`bogota_rolo`, `bogota_ninos`, `bogota_cachaco`, etc.) son **opcionales**; el usuario los elige al confirmar la receta. Ver [GuiaAcentos.md](../GuiaAcentos.md).

El `codigo_acento` del perfil familiar **no** impone el acento del cuento generado salvo que el usuario lo elija en el wizard.

### Neutro (default)

- Español latinoamericano natural; máximo 0–1 modismo local por párrafo.
- Cotidianidad colombiana sin saturar jerga: casa, colegio, familia, ciudad.
- Detalles sensoriales concretos (olores, sonidos del hogar, clima).

### Acentos opcionales

Si el usuario elige un acento bogotano, aplicar las reglas de densidad de [GuiaAcentos.md](../GuiaAcentos.md) (2–4 marcas por párrafo en tier 1).

### Sí usar

- Segunda persona implícita o narrador cercano (*“En el apartamento olía a…”*).
- Diálogos cortos con emoción reconocible.
- Detalles sensoriales: olores, sonidos del edificio, clima.
- Humor de situación: tablet, chanclas, ascensor, lista de mamá, perro que ladra.

### No usar

- Sermones explícitos (*“la moraleja es que…”*, *“lo que aprendimos hoy…”*).
- Violencia, miedo intenso, castigos humillantes, muerte, armas.
- Marcas comerciales, política, religión doctrinal.
- Insultos, clasismo, burla a barrios o estratos.
- Saturación de modismos (caricatura).
- Fantasía desconectada del mundo del niño **salvo** que el usuario eligió un lugar fantástico o un molde clásico.

### Moraleja

- Debe poder resumirse en **una frase** al final del cuento en la mente del lector, no en el texto.
- Debe alinearse con el ingrediente **«Qué aprenden»** de la receta.
- El **reto** es el conflicto; la **lección** es el premio emocional del cierre.

---

## 4. Uso de los ingredientes de la receta

Cada zona del wizard en `/crear/adaptar` tiene un trabajo narrativo:

| Ingrediente | Rol en la historia |
|-------------|-------------------|
| **Protagonistas** | Llevan la acción; usar **exactamente** esos nombres. |
| **Reto** | Conflicto central; debe sentirse en la escena 2. |
| **Qué aprenden** | Semilla del cierre; nunca como frase moral pegada. |
| **Lugar** | Escenario dominante; detalles concretos (no “un lugar bonito”). |
| **Mascota** | Al menos un momento cómico o de apoyo. |
| **Acompañantes** | Diálogo o reacción que tensiona o ayuda. |
| **Rol de reto** | “Lobo” simbólico: quien encarna el lado difícil (sin villano terrorífico). |
| **Objeto especial** | Detalle con payoff en el giro o cierre. |
| **Molde clásico** | Estructura inspirada (tres intentos, viaje, regreso) sin copiar copyrighted plot verbatim. |

Si falta un ingrediente opcional, **no inventar** personajes nuevos con nombre propio.

---

## 5. Perfil familiar (cuando se inyecte al prompt)

Prioridad de datos del JSONB (`PerfilFamiliar.md`):

1. Nombres y **apodos** de niños y adultos.
2. Ciudad / barrio (`meta.ciudad`).
3. Mascotas con personalidad breve.
4. **Frases típicas** de mamá/papa/niños (1–2 por cuento, integradas en diálogo).
5. Gustos o “no le gusta” solo si refuerzan el reto (ej. `dormir`, `pantallas`).

No exponer datos sensibles inventados. No mencionar email, escuela real con dirección, ni datos que el usuario no haya puesto.

---

## 6. Ejemplos: así sí vs así no

### Apertura

**❌ Así no**

> Nico era un niño que a veces no quería dormir. Un día aprendió que dormir es importante.

**✅ Así sí**

> Ese domingo el apartamento olía a café y a pan tostado. Afuera Chapinero todavía bostezaba: un bus lejos, llovizna fina en la ventana. Nico ya tenía la mano en la tablet antes de abrir bien los ojos.

### Diálogo y reto

**❌ Así no**

> —Debes dormir —le dijo mamá. —Está bien —dijo Nico, y durmió.

**✅ Así sí**

> —Hoy toca dormir temprano, mi vida —dijo Pauleta, con esa calma que pesa más que un grito.  
> —¿En serio? ¿Ni un ratito de YouTube? —preguntó Nico, y la voz le salió más chiquita de lo que quería.

### Cierre / lección

**❌ Así no**

> Y Nico aprendió que la calma es buena. Fin.

**✅ Así sí**

> Nico apagó la luz sin pelear. Bingo se acomodó al pie de la cama. Afuera Bogotá seguía, pero adentro ya era hora del nono — y por primera vez en la noche, el silencio no le dio miedo.

---

## 7. Checklist de calidad (revisión humana o QA)

Antes de dar por bueno un cuento generado:

- [ ] ¿Suena a Bogotá/cotidianidad, no a plantilla neutra?
- [ ] ¿El niño de 5 años entiende qué pasó sin explicación adulta?
- [ ] ¿El adulto sonríe al menos una vez?
- [ ] ¿El reto de la receta es el corazón del conflicto?
- [ ] ¿La lección se siente al final sin que la digan?
- [ ] ¿Los nombres coinciden con la receta/perfil?
- [ ] ¿350–600 palabras y 3–5 escenas?
- [ ] ¿Máximo 3–4 modismos por párrafo?
- [ ] ¿Sin violencia, miedo fuerte ni sermón?
- [ ] ¿Formato Markdown válido para el lector (`#`, `>`, `##`)?

---

## 8. Relación con el código

| Artefacto | Función |
|-----------|---------|
| `docs/biblia-editorial.md` | **Fuente de verdad editorial** (este archivo) |
| [GuiaAcentos.md](../GuiaAcentos.md) | Matiz dialectal y tiers |
| `src/lib/story-accent.ts` | Códigos de acento, default `neutro`, opciones del wizard |
| `src/lib/story-prompt-examples.ts` | Fragmentos few-shot de cuentos curados |
| `src/lib/story-prompt.ts` | System prompt + mensaje usuario → API |
| `src/lib/story-mock.ts` | Fallback sin IA (no sustituye calidad) |
| `docs/ia-generacion.md` | Infra, keys, Vercel, persistencia |

**Próximo paso técnico:** mantener `buildStorySystemPrompt()` y `buildFewShotBlock()` alineados con este doc;
`buildStoryPrompt()` inyecta receta + perfil + acento elegido (jul 2026).

---

## 10. Cuentos curados como corpus de referencia

Los cuentos en `cuentos/*.md` no son “entrenamiento” del modelo en el sentido de fine-tuning; son **few-shot editorial**:

1. **Refinar** cada cuento publicado (tono, ritmo, checklist §7).
2. **Etiquetar** variantes por `codigo_acento` cuando existan (neutro vs regional).
3. **Extraer** fragmentos cortos (apertura + diálogo) a `src/lib/story-prompt-examples.ts`.
4. **No copiar** tramas literalmente en generación — solo imitar voz y nivel de detalle.

Al añadir un cuento nuevo, agregar al menos un par de fragmentos neutros; si hay versión dialectal curada, añadirla al mapa `BY_ACCENT`.

---

## 9. Iteración del prompt (proceso recomendado)

1. Elegir **3 recetas fijas** de prueba (dormir, pantallas, respeto).
2. Generar con Gemini y guardar los 3 markdowns.
3. Comparar lado a lado con `operacion-a-dormir.md` usando el checklist §7.
4. Ajustar **una regla a la vez** en `story-prompt.ts`.
5. Repetir hasta que un lector externo (otro adulto) diga “esto sí es Chacachón”.

No subir temperatura ni tokens como primer recurso; primero claridad de reglas y contexto de perfil.

---

*Última actualización: julio 2026 — v1 para POC de generación con Gemini.*
