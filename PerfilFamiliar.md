# Perfil Familiar — Modelo de datos y persistencia

> Documento de producto + arquitectura. Versión 1.0 — Junio 2026.

El cuento piloto de la Familia Balcutron funciona como **plantilla narrativa**. La magia real de Chacachón ocurre cuando esa plantilla se mezcla con **el perfil de cada familia**: nombres, apodos, mascotas, frases, gustos y dolores cotidianos.

Este documento define qué es el perfil familiar, cómo se estructura, y **cómo persistirlo sin tablas rígidas por cada campo**.

---

## 1. Problema que resuelve

| Sin perfil familiar | Con perfil familiar |
|---|---|
| "Dos hermanos no querían apagar la tablet" | "Mateo y Sofía no querían apagar la tablet" |
| Mascota genérica o inventada | Bingochon de Temu, Mora la callejera |
| Mamá dice "pilas, a dormir" | Mamá dice la frase que el niño reconoce en casa |
| Abuelos opcionales en el lore | Abuelos en la nave de al lado, con luz de cocina |

**Objetivo:** que padres e hijos digan *"eso somos nosotros"* sin reescribir cada cuento a mano.

---

## 2. Principios de diseño

1. **Documento vivo, no censo.** Se completa en capas; se edita en cualquier momento.
2. **Campos abiertos.** Cada familia es distinta; no forzar el mismo formulario para todos.
3. **Separar plantilla de familia.** El catálogo de cuentos (`cuentos`, `paginas`, `textos_localizados`) sigue relacional y estable. El perfil familiar es flexible.
4. **Validar en la app, no en 40 tablas SQL.** Zod + moderación de texto; la BD guarda un documento versionado.
5. **Privacidad primero.** Datos de menores; RLS estricta; exportar y borrar cuenta.

---

## 3. ¿Relacional, Mongo o híbrido?

### Lo que NO recomendamos para el MVP

**Modelo 100% relacional** con tablas `mascotas`, `frases_familiares`, `gustos_comida`, `amigos_nino`, etc.:

- Cada familia nueva obliga a migraciones o columnas nullable.
- El onboarding se vuelve inflexible.
- Consultas JOIN pesadas para armar un solo “contexto de cuento”.

**MongoDB (u otra BD documental aparte)** solo para el perfil:

- Segundo sistema que operar (backups, auth, costos, consistencia).
- Supabase ya está elegido en [StackTecnico.md](./StackTecnico.md).
- RLS y joins con cuentos/lecturas se complican.

### Recomendación: **PostgreSQL + JSONB** (estilo Mongo, sin Mongo)

Postgres en Supabase soporta `JSONB` con índices GIN, operadores `->`, `->>`, `@>`, y validación opcional con `CHECK (jsonb_typeof(...))`.

| Ventaja | Detalle |
|---|---|
| Flexibilidad tipo documento | Un solo `perfil` JSON evoluciona sin `ALTER TABLE` por cada campo nuevo |
| Un solo stack | Misma BD que catálogo, auth y RLS |
| Consultas híbridas | `perfil->'ninos'->0->>'nombre'` si hace falta buscar o indexar |
| Versionado | Tabla `perfiles_familia_versiones` con snapshots del JSON |
| Tipado en app | TypeScript + Zod validan la forma; la BD no encierra el esquema |

**Analogía:** la fila en `perfiles_familia` es el “documento Mongo”; las columnas `id`, `usuario_id`, `actualizado_en` son el “sobre relacional” para integridad y seguridad.

---

## 4. Arquitectura de persistencia

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA RELACIONAL (estable, pocos cambios)                   │
│  usuarios · perfiles_familia · perfiles_familia_versiones   │
│  cuentos · paginas · textos_localizados · lecturas          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA DOCUMENTO (JSONB en perfiles_familia.perfil)          │
│  integrantes · mascotas · frases · gustos · extra           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA RESOLUCIÓN (runtime, sin persistir)                   │
│  perfil → variables {{niño_1}} · contexto IA · resumen TTS  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo al leer un cuento

1. Usuario elige cuento + acento.
2. API carga `perfiles_familia.perfil` (JSONB) del hogar.
3. `lib/interpolation.ts` resuelve variables en `texto_plantilla`.
4. (Futuro) Si el cuento es generativo, se envía un **resumen estructurado** del perfil al prompt — no el JSON crudo sin filtrar.

---

## 5. Esquema SQL propuesto

```sql
-- Perfil familiar: un documento por hogar (cuenta principal)
CREATE TABLE perfiles_familia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_display VARCHAR(120) DEFAULT 'Mi familia',  -- ej. "Los García"
    schema_version INT NOT NULL DEFAULT 1,
    perfil JSONB NOT NULL DEFAULT '{}',
    completitud INT NOT NULL DEFAULT 0 CHECK (completitud BETWEEN 0 AND 100),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id)  -- MVP: un hogar por cuenta; luego multi-hogar si hace falta
);

-- Historial opcional (auditoría, deshacer, debug de IA)
CREATE TABLE perfiles_familia_versiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_familia_id UUID NOT NULL REFERENCES perfiles_familia(id) ON DELETE CASCADE,
    schema_version INT NOT NULL,
    perfil JSONB NOT NULL,
    motivo VARCHAR(50) DEFAULT 'edicion',  -- onboarding | edicion | import | rollback
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por claves frecuentes (opcional)
CREATE INDEX idx_perfil_ninos_nombres ON perfiles_familia
    USING GIN ((perfil -> 'ninos'));

-- RLS: cada usuario solo ve su perfil
ALTER TABLE perfiles_familia ENABLE ROW LEVEL SECURITY;
CREATE POLICY perfil_familia_own ON perfiles_familia
    FOR ALL USING (auth.uid() = usuario_id);
```

### Evolución de `perfiles_ninos`

La tabla `perfiles_ninos` del schema inicial puede:

- **Opción A (recomendada):** absorberse dentro de `perfil.ninos[]` en JSONB.
- **Opción B:** mantenerse como vista/cache denormalizada (`nombre`, `edad`) sincronizada desde el JSON para queries simples.

Para MVP, **solo JSONB**; si hace falta reportes, se agrega materialized view después.

---

## 6. Forma del documento `perfil` (v1)

No es un esquema rígido de BD; es la **convención** que valida Zod en el backend. Campos desconocidos van a `extra` sin romper nada.

```typescript
// types/perfil-familia.ts (referencia; no es código de app aún)

type PerfilFamiliaV1 = {
  meta: {
    ciudad?: string;
    barrio?: string;
    codigo_acento?: string;       // ej. bogota_ninos — ver GuiaAcentos.md
    como_le_dicen_al_hogar?: string; // "la casa", "la nave", "el apartamento"
  };

  adultos: Array<{
    id: string;                   // uuid estable dentro del doc
    rol: 'mama' | 'papa' | 'madrastra' | 'padrastro' | 'cuidador' | 'otro';
    nombre: string;
    apodo?: string;               // "Teniente Pauleta", "el Comandante"
    frases_tipicas?: string[];    // máx 5 en MVP
    extra?: Record<string, unknown>;
  }>;

  ninos: Array<{
    id: string;
    nombre: string;
    apodo?: string;
    fecha_nacimiento?: string;    // ISO date
    orden?: number;               // 1 = mayor, para {{niño_1}}
    frases_tipicas?: string[];
    gustos?: {
      comida?: string[];
      ropa?: string[];
      peliculas?: string[];
      juegos?: string[];
      amigos?: string[];          // nombres o apodos del grupo
    };
    no_le_gusta?: {
      dormir?: string;            // texto libre: "siempre pide agua"
      comida?: string[];
      ropa?: string[];
    };
    pantallas?: {
      le_cuesta_soltar?: boolean;
      que_usa?: string;           // "tablet", "celular", "Nintendo"
      juego_favorito?: string;
    };
    extra?: Record<string, unknown>;
  }>;

  cercanos?: Array<{
    id: string;
    relacion: 'abuelos' | 'abuela' | 'abuelo' | 'tio' | 'tia' | 'primo' | 'otro';
    nombre?: string;
    apodo?: string;
    vive_cerca?: boolean;
    aparece_en_cuentos?: boolean;
    extra?: Record<string, unknown>;
  }>;

  mascotas?: Array<{
    id: string;
    nombre: string;
    tipo: 'perro' | 'gato' | 'otro';
    origen?: string;              // "Temu", "callejera", "adoptada"
    personalidad?: string;        // "miedosa", "ladra al aire"
    extra?: Record<string, unknown>;
  }>;

  casa?: {
    detalles?: string[];          // "andamos descalzos", "mamá dobla ropa"
    olores?: string[];            // "olor a empanada" — opcional, nostálgico
    extra?: Record<string, unknown>;
  };

  /** Cualquier dato futuro sin migración SQL */
  extra?: Record<string, unknown> & {
    rutina_noche?: {
      descripcion?: string;
      batallas?: Array<{
        id: string;
        texto: string;
        nota?: string;
      }>;
      frases_papas?: string[];
    };
  };
};
```

### Reglas de validación (app)

| Regla | Límite MVP |
|---|---|
| `ninos` | 1–6 |
| `adultos` | 1–4 |
| `mascotas` | 0–5 |
| `frases_tipicas` por persona | máx 5, máx 120 caracteres c/u |
| Texto libre | OpenAI Moderation + regex básico |
| `schema_version` | migrador en servidor si sube de versión |

---

## 7. Onboarding por capas

No un formulario de 40 pantallas. Tres momentos:

### Capa 1 — Esencial (~2 min)

- Ciudad / barrio (opcional pero potente para localización)
- Acento (`bogota_ninos`, etc.)
- Niños: nombre, edad/apodo
- Adultos: cómo los llaman los niños

→ Ya permite `{{niño_1}}`, `{{mama}}`, `{{papa}}`.

### Capa 2 — Casa (~3 min)

- Mascotas (nombre, origen, personalidad en una línea)
- Familiares cercanos (abuelos, tíos)
- 1 frase típica de mamá y 1 de papá

### Capa 3 — Vida real (continua)

- Gustos, pantallas, dolores de dormir/comida
- **`rutina_noche`**: batallas repetidas (pijama, dientes, chichi, agua, chanclas, habitación, cama, apagar TV)
- Se puede preguntar **después** de leer un cuento: *"¿Les pasa esto?"* → merge al JSON

`completitud` (0–100) se calcula en servidor según campos presentes; gamificación suave, no bloqueante.

---

## 8. De perfil a cuento: interpolación

### Variables fijas en plantillas (catálogo)

Las plantillas en `textos_localizados` usan slots acotados:

```
{{niño_1}} {{niño_2}} {{mama}} {{papa}}
{{mascota_1}} {{mascota_2}}
{{frase_mama}} {{frase_papa}}
{{lugar_cercano}}   // ej. "la nave de los abuelos"
```

### Resolver (pseudocódigo)

```typescript
function resolverPerfil(perfil: PerfilFamiliaV1): Record<string, string> {
  const ninos = [...perfil.ninos].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));
  const mama = perfil.adultos.find(a => a.rol === 'mama');
  const papa = perfil.adultos.find(a => a.rol === 'papa');
  const abuelos = perfil.cercanos?.find(c => c.relacion === 'abuelos' && c.aparece_en_cuentos);

  return {
    niño_1: ninos[0]?.apodo ?? ninos[0]?.nombre ?? 'el mayor',
    niño_2: ninos[1]?.apodo ?? ninos[1]?.nombre ?? 'el menor',
    mama: mama?.apodo ?? mama?.nombre ?? 'mamá',
    papa: papa?.apodo ?? papa?.nombre ?? 'papá',
    mascota_1: perfil.mascotas?.[0]?.nombre ?? '',
    frase_mama: mama?.frases_tipicas?.[0] ?? '',
    lugar_cercano: abuelos?.vive_cerca ? 'la casa de los abuelos' : '',
    // ...
  };
}
```

Si falta un slot, **fallback neutro** — nunca error en lectura.

### Contexto para IA (futuro)

Cuando se genere texto nuevo (no solo plantilla), enviar un bloque resumido:

```json
{
  "ninos": ["Nicolai (7)", "Chimonchin (5)"],
  "mascotas": ["Bingochon perro Temu", "Mora perra miedosa"],
  "tema": "dormir",
  "pantallas": "les cuesta soltar la tablet",
  "frases_mama": ["pilas, descalzos en la casa"],
  "acento": "bogota_ninos"
}
```

Nunca mandar el JSON completo sin filtrar a un LLM en producción.

---

## 9. Lectura y escritura del documento

### Crear (onboarding)

```http
POST /api/familia/perfil
{ "perfil": { ... }, "schema_version": 1 }
```

- Merge superficial con `{}` inicial.
- Insert en `perfiles_familia`.
- Snapshot en `perfiles_familia_versiones`.

### Actualizar (parcial — estilo PATCH documento)

```http
PATCH /api/familia/perfil
{
  "path": ["mascotas"],
  "value": [{ "id": "...", "nombre": "Bingochon", "tipo": "perro", "origen": "Temu" }]
}
```

O merge profundo por sección:

```http
PATCH /api/familia/perfil
{ "merge": { "casa": { "detalles": ["andamos descalzos"] } } }
```

Implementación en Postgres:

```sql
UPDATE perfiles_familia
SET perfil = perfil || $1::jsonb,  -- merge top-level
    actualizado_en = NOW()
WHERE usuario_id = auth.uid();
```

Para paths anidados, usar `jsonb_set` en una función SQL o merge en Node antes del UPDATE.

### Exportar / borrar (Habeas Data)

- `GET /api/familia/perfil/export` → JSON descargable.
- `DELETE /api/familia/perfil` → cascada + versiones.

---

## 10. Ejemplo real: familia inspirada en el piloto

```json
{
  "schema_version": 1,
  "meta": {
    "ciudad": "Bogotá",
    "barrio": "cerca del Campín",
    "codigo_acento": "bogota_ninos",
    "como_le_dicen_al_hogar": "la casa-nave"
  },
  "adultos": [
    {
      "id": "a1",
      "rol": "papa",
      "nombre": "Raka",
      "apodo": "Comandante Raka",
      "frases_tipicas": ["Tu cerebro mañana te lo va a agradecer", "De una"]
    },
    {
      "id": "a2",
      "rol": "mama",
      "nombre": "Pauleta",
      "apodo": "Teniente Pauleta",
      "frases_tipicas": ["Pilas, descalzos en la nave", "Orden de misión"]
    }
  ],
  "ninos": [
    {
      "id": "n1",
      "nombre": "Nicolai",
      "orden": 1,
      "pantallas": {
        "le_cuesta_soltar": true,
        "que_usa": "tablet",
        "juego_favorito": "Capitán Nebulosa"
      },
      "no_le_gusta": { "dormir": "pide agua y revisa el clima del planeta 7" }
    },
    {
      "id": "n2",
      "nombre": "Chimonchin",
      "orden": 2,
      "pantallas": { "le_cuesta_soltar": true, "que_usa": "tablet" },
      "no_le_gusta": { "dormir": "dice que no tiene sueño, cero, revisado dos veces" }
    }
  ],
  "cercanos": [
    {
      "id": "c1",
      "relacion": "abuelos",
      "vive_cerca": true,
      "aparece_en_cuentos": true
    }
  ],
  "mascotas": [
    { "id": "m1", "nombre": "Bingochon", "tipo": "perro", "origen": "Temu", "personalidad": "ladra al aire" },
    { "id": "m2", "nombre": "Mora", "tipo": "perro", "origen": "callejera", "personalidad": "miedosa" }
  ],
  "casa": {
    "detalles": ["la nave es color mora", "mamá dobla ropa en la sala", "papá arregla todo con alambre"]
  }
}
```

Con este documento, la plantilla Balcutron deja de sentirse ajena: es **la misma historia con su piel**.

---

## 11. Cuándo sí considerar Mongo (o similar)

Solo si más adelante:

- Perfiles >10 MB por familia (muy improbable).
- Millones de documentos con sharding horizontal independiente del catálogo.
- Equipo separado que ya opera Atlas con SLAs distintos.

Hasta ~50k familias con JSONB de unos pocos KB cada una, Postgres en Supabase sobra.

---

## 12. Decisiones abiertas

| Tema | Opciones | Inclinación MVP |
|---|---|---|
| Un hogar vs varios por cuenta | `UNIQUE(usuario_id)` vs tabla `hogares` | Un hogar |
| Invitar co-padre | Misma cuenta vs `hogar_miembros` | Fase 2 |
| Perfil anónimo local | `localStorage` antes de signup | Sí, para probar sin fricción |
| Sincronizar con cuento demo | Botón "Importar desde demo Balcutron" | Útil para testing |

---

## 13. Próximos pasos

1. Añadir `perfiles_familia` al DDL en `contextonew.md` o migration `001_perfil_familia.sql`.
2. Definir `PerfilFamiliaV1` en Zod + tests de merge/interpolación.
3. Prototipo de onboarding Capa 1 en Figma o HTML estático.
4. Reescribir una página del cuento Balcutron usando variables resueltas desde el JSON de ejemplo.

---

*Documento vivo. `schema_version` en código y en BD deben subir en lockstep cuando cambie la forma del documento.*
