# Brief de proyecto — Chacachón Stories

Documento para crear o alimentar un proyecto en Claude (u otra IA).  
Úsalo así: adjunta este archivo **o** pega las secciones 2–3.

---

## 1. Subir el documento o archivo del proyecto

**Archivo sugerido a subir:** este mismo markdown  
`docs/brief-proyecto-chacachon.md`

**Complementos opcionales** (si el proyecto Claude permite varios archivos):

| Archivo | Para qué |
|---------|----------|
| `docs/biblia-editorial.md` | Voz, tono, reglas narrativas |
| `docs/roadmap.md` | Fase actual y prioridades |
| `docs/ia-generacion.md` | Cómo se genera con IA |
| `docs/architecture.md` | Stack y límites federados Balcu |

**Repo / producto:** `chacachon_stories` · Producción: https://chacachon-stories.vercel.app

---

## 2. Pegar aquí la descripción o el brief

**Nombre:** Chacachón Stories (HistorIAs Chacachón)

**En una frase:**  
App de cuentos infantiles personalizados donde el niño es el héroe — voz de cuento tradicional, humor colombiano, para leer en voz alta en casa.

**Descripción corta:**  
Producto consumer (LatAm / Colombia primero) que genera cuentos cortos con IA a partir de una receta simple: nombre del niño, rango de edad (3–5, 6–8, 9–12) y un momento de casa (dormir, pantallas, verduras…) o un clásico. Los padres leen en un lector tipo libro. Hay prueba sin cuenta; guardar cuentos y perfil familiar tras registrarse.

**Categoría:** Entretenimiento familiar / lectura digital (no tutorías, no coach de crianza).

**Propuesta de valor:** Cuentos mágicos, locales y personales en minutos. El ritual de noche lo hace el adulto; el asombro lo hace el cuento — no un manual de rutina.

**Diferenciación:** Frente a clones de “AI bedtime + moraleja/checklist”, Chacachón apuesta por tradición oral (Había una vez / colorín colorado), fantasía clara (bosque, aldea, reino; naves raras), humor colombiano suave y frases cortas entendibles al oído.

---

## 3. Contarme de qué se trata (objetivo, alcance, entregables, etc.)

### Objetivo

1. Que padres e hijos quieran “una página más” — calidad narrativa por encima del truco.  
2. Consolidar una voz de marca clara: cuento tradicional + cotidianidad colombiana.  
3. Convertir prueba gratuita → familia registrada (guardar cuentos con nombres reales).  
4. Diferenciarse de generadores genéricos de bedtime.  
5. Mantener un MVP liviano y operable: generar → leer → CTA suave para guardar.

### Alcance (sí)

- Generación de cuentos personalizados (Gemini → Claude → mock de respaldo).  
- Flujo de prueba `/probar` sin login y lector `/leer/prueba`.  
- Hub `/crear` + receta + acentos (neutro colombiano por defecto).  
- Login (Google), perfil familiar, cuentos guardados.  
- Lector tipo libro (paginación, tipografía, tema de papel).  
- Guardrails editoriales: sin violencia intensa, sin sermón explícito, sin cierre tipo “dulces sueños” por defecto, Léxico oral colombiano.

### Fuera de alcance (no)

- Backend compartido / SSO / microservicios del hub Balcu.  
- App como coach de hábitos o manual paso a paso de rutina.  
- Fine-tune propio del modelo (aún no; el estilo va por prompt + ejemplos).  
- Contenido de terror, humillación o temas adultos.

### Audiencia

- **Primaria:** padres hispanohablantes en Colombia con hijos de 3 a 12 años.  
- **Secundaria:** compartir en familia (WhatsApp, etc.).

### Stack (referencia)

Next.js 15 · Neon + Prisma · NextAuth (Google) · Zod · Vercel · generación LLM vía API.

### Entregables típicos para un asistente IA (Claude)

Cuando se pida trabajo sobre este proyecto, los entregables esperados suelen ser:

| Tipo | Ejemplo |
|------|---------|
| Código | Prompt, lector, APIs, tests |
| Editorial | Cuentos de referencia, léxico, few-shots |
| Producto | Flujos trial → conversión, copy de CTA |
| Docs | ADR / notas cortas alineadas a `docs/` |
| Calidad | Criterios: oral, claro, humor local, colorín colorado |

### Señales de éxito

- Cuentos que suenan orales y naturales al leerlos en voz alta.  
- Pruebas repetidas y poca “plantilla clon”.  
- Registro / guardado tras el CTA de fin de cuento.  
- Padres que reconocen sabor colombiano sin caricatura.

### Insumo futuro de calidad (dirección)

El principal motor de calidad no será un prompt interminable, sino un **corpus de cuentos buenos** + few-shot selectivo por request, con léxico/dichos y anti-ejemplos como satélites.

---

*Última actualización: julio 2026*
