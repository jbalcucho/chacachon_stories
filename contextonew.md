
Aquí tienes el contexto del problema y la solución estructurada en los tres pilares fundamentales para salir al mercado con un producto a prueba de balas:

1. El Contexto de la Idea (El Problema y la Oportunidad)
El Problema: La lectura nocturna suele convertirse en una tarea monótona para los padres y predecible para los niños. Las aplicaciones actuales de cuentos con IA ofrecen historias genéricas, robóticas y sin identidad local.

La Oportunidad: Existe un vacío en el mercado para el "Stand-up Comedy Narrativo": cuentos infantiles hiperlocalizados que utilicen el humor y la jerga regional (ej. bogotano, costeño) para hacer reír genuinamente al adulto, mientras envuelven una lección pedagógica (como ir a dormir o superar la frustración) para los niños. Es un modelo de doble audiencia que capitaliza la nostalgia a través de personajes originales inspirados en clásicos de los años 80 y 90.

2. La Solución en Términos de Negocio (Estrategia y Monetización)
El modelo abandona la dependencia exclusiva de las suscripciones digitales de bajo margen y se enfoca en la retención y el producto físico.

El Gancho (Adquisición): Un canal de YouTube orgánico donde se publican animatics narrados con voces humanas auténticas, actuando como un embudo de ventas gratuito (CAC cero) que dirige el tráfico a la plataforma web.

Distribución Viral: Integración nativa con WhatsApp, permitiendo que las familias compartan previsualizaciones de los cuentos interactivos en sus grupos con un solo clic.

Monetización Escalonada:

Freemium: Acceso a demos predefinidos y 1 o 2 cuentos personalizados gratis.

Suscripción Digital: Acceso a la biblioteca completa, generación ilimitada y reproducción de audiolibros.

El Negocio Real (Upsell Físico): Impresión bajo demanda (Print-on-Demand) de libros en tapa dura con el nombre de los niños como regalo premium. A mediano plazo, esto se complementa con la venta de merchandising físico, empleando tecnologías de impresión 3D para enviar figuras de acción exclusivas de los personajes (como el Capitán Sancocho) directamente a los hogares.

3. La Solución en Términos Técnicos (Arquitectura de Datos y Stack)
La plataforma se estructurará con el rigor, la seguridad y la escalabilidad que exigen los entornos de datos transaccionales y corporativos, asegurando tiempos de respuesta de milisegundos.

Modelo de Datos Relacional: Se abandona el almacenamiento de "texto plano". La base de datos (PostgreSQL en Supabase) modelará entidades separadas: Personajes, Páginas, Acentos, Telemetría e Interpolación de variables (para insertar los nombres exactos en la historia de forma dinámica).

Motores de IA Optimizados:

Texto: Se utilizará Claude 3.5 Sonnet por su insuperable capacidad para mantener la coherencia en jergas locales a un costo operativo bajísimo. La curación dialectal se rige por [GuiaAcentos.md](./GuiaAcentos.md) (glosario por `codigo_acento`, tiers 1–3 y reglas anti-caricatura).

Imágenes: Para garantizar que los personajes luzcan exactamente iguales desde la página 1 hasta el final, se descarta Midjourney en favor de modelos Flux + LoRAs (entrenamiento de redes neuronales específicas para cada personaje).

Infraestructura: Despliegues continuos automatizados hacia entornos Serverless (Vercel) para mantener los costos de infraestructura cercanos a cero durante la validación del mercado.

4. La Solución en Términos de Producto (La Experiencia del Usuario Final)
El producto está diseñado para eliminar la fricción desde el segundo uno, centrándose en el modelo de "Co-Lectura".

El Flujo: El padre ingresa desde su móvil o tablet, introduce los nombres de sus dos hijos, selecciona el problema a resolver (ej. no querer comer verduras) y elige el acento (ej. costeño).

La Entrega: En segundos, la pantalla muestra un libro digital paginado. No es solo una pared de texto; cada página tiene su propia ilustración consistente y de alta fidelidad estética.

Inmersión Auditiva: La interfaz incluye un botón de reproducción donde un sistema de Text-to-Speech (o voces humanas pregrabadas) narra la historia con el acento exacto, permitiendo que la familia se concentre en las imágenes y en reírse juntos de la situación.

Estructuración técnica:

Estructurar esta base de datos te resultará un proceso muy natural. Al estar familiarizado con la arquitectura de datos en entornos de banca corporativa, sabes que el secreto para que un sistema escale sin consumir recursos excesivos es mantener las tablas correctamente normalizadas, usar índices adecuados y evitar la redundancia.

Para soportar la paginación, la consistencia de los personajes y la inserción dinámica de los nombres, diseñaremos un modelo relacional en Supabase (PostgreSQL) dividido en tres grandes bloques: El Catálogo (Core), La Localización (Textos/Audios) y La Sesión del Usuario.

Aquí tienes el Modelo Entidad-Relación exacto para arrancar tu backend:

1. Bloque de Usuarios y Personalización
Este bloque maneja quién lee el cuento y para quién va dirigido, permitiendo tener múltiples perfiles bajo una sola cuenta.

Tabla: usuarios

id (UUID, Primary Key): ID único generado por Supabase Auth.

email (VARCHAR): Correo del padre o madre.

suscripcion_activa (BOOLEAN): Control de acceso premium.

creado_en (TIMESTAMP): Fecha de registro.

Tabla: perfiles_ninos

id (UUID, Primary Key)

usuario_id (UUID, Foreign Key) -> usuarios.id

nombre (VARCHAR): Nombre del niño.

fecha_nacimiento (DATE): Para filtrar cuentos por rango de edad.

avatar_url (VARCHAR): Opcional, icono de perfil.

Nota arquitectónica: Al separar los perfiles, si tú y Julie se sientan a leer en la noche con los dos niños, la plataforma puede consultar un array con los IDs de ambos perfiles y enviarlos al frontend para reemplazar dinámicamente las variables {{niño_1}} y {{niño_2}} en el texto.

2. Bloque del Catálogo (Estructura del Cuento)
Aquí vive el "esqueleto" visual y estructural de la historia. No contiene dialectos, solo la secuencia lógica y las imágenes generadas (idealmente con Flux + LoRAs para mantener la cara del personaje idéntica).

Tabla: cuentos

id (UUID, Primary Key)

slug (VARCHAR): Identificador amigable para URLs (ej. capitan-sancocho-verduras).

titulo_interno (VARCHAR): Nombre de referencia (ej. Capitán Sancocho 1).

portada_url (VARCHAR): Ruta del archivo en el CDN o bucket.

moraleja_tag (VARCHAR): Etiqueta para el buscador (ej. alimentacion, dormir).

estado (VARCHAR): borrador o publicado.

Tabla: paginas

id (UUID, Primary Key)

cuento_id (UUID, Foreign Key) -> cuentos.id

numero_pagina (INT): Orden de la secuencia (1, 2, 3...).

imagen_url (VARCHAR): La ilustración estática correspondiente a esta escena.

prompt_visual_usado (TEXT): Almacenamiento del prompt usado (útil para auditoría y consistencia).

3. Bloque de Localización (El "Músculo" del Stand-up)
Aquí es donde ocurre la magia. Esta tabla permite que una sola página visual tenga múltiples "doblajes" y textos sin duplicar la imagen.

Tabla: textos_localizados

id (UUID, Primary Key)

pagina_id (UUID, Foreign Key) -> paginas.id

codigo_acento (VARCHAR): Clave de región (ej. bogota_urbano, costa_caribe, neutro).

tier_moderacion (INT): Nivel de filtro (1 = Infantil, 2 = Adolescente, 3 = Stand-up Adulto).

texto_plantilla (TEXT): El párrafo con las variables listas para inyectar. (Ejemplo: "En el año 3026, {{niño_1}} y {{niño_2}} no querían hacer nono...").

audio_narracion_url (VARCHAR): Ruta del archivo .mp3 o .wav con la voz (generada por TTS o tu propia voz).

¿Cómo funciona la consulta SQL (El flujo real)?
Cuando abren la aplicación en la tablet y le dan "Leer Cuento", el frontend (en Next.js) hace una sola petición a tu API enviando tres datos: cuento_id, codigo_acento y un array de perfiles_ninos.

Por debajo, Supabase ejecuta un JOIN muy eficiente que trae la estructura de la página y el texto exacto que hace match con el acento.
El frontend recibe un JSON limpio y ejecuta una función de reemplazo (Regex) simple: busca la cadena {{niño_1}} y la reemplaza por el nombre real de tu hijo mayor, y {{niño_2}} por el del menor.

Esta arquitectura relacional cumple con todo: separa los datos confidenciales, hace que la carga de imágenes sea veloz (porque se cargan una sola vez independientemente del acento) y deja la base de datos lista para escalar cuando decidas lanzar la opción de impresión de libros físicos bajo demanda.

Desarrollo:

Aquí tienes el script de SQL definitivo. Al mantener arquitecturas de datos en entornos transaccionales corporativos, notarás que este esquema ya cuenta con las restricciones de integridad referencial necesarias para producción: incluye llaves foráneas con borrado en cascada (para no dejar datos huérfanos), generación nativa de UUIDs, restricciones UNIQUE para evitar colisiones lógicas y validaciones CHECK en los campos de estado.

Puedes copiar este bloque exacto y ejecutarlo en el SQL Editor de tu panel de Supabase.

SQL
-- Habilitar la extensión para UUIDs (normalmente activa por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios (Vinculada directamente a la tabla de autenticación de Supabase)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    suscripcion_activa BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Perfiles de Niños (Soporta múltiples perfiles por usuario)
CREATE TABLE perfiles_ninos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    avatar_url VARCHAR(500),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Cuentos (El catálogo y metadata visual)
CREATE TABLE cuentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    titulo_interno VARCHAR(255) NOT NULL,
    portada_url VARCHAR(500) NOT NULL,
    moraleja_tag VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Páginas (La secuencia visual del cuento)
CREATE TABLE paginas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cuento_id UUID NOT NULL REFERENCES cuentos(id) ON DELETE CASCADE,
    numero_pagina INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    prompt_visual_usado TEXT,
    UNIQUE(cuento_id, numero_pagina) -- Evita que existan dos "páginas 1" en el mismo cuento
);

-- 5. Tabla de Textos Localizados (El motor de los dialectos y Tiers)
CREATE TABLE textos_localizados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pagina_id UUID NOT NULL REFERENCES paginas(id) ON DELETE CASCADE,
    codigo_acento VARCHAR(50) NOT NULL,
    tier_moderacion INT NOT NULL CHECK (tier_moderacion IN (1, 2, 3)),
    texto_plantilla TEXT NOT NULL,
    audio_narracion_url VARCHAR(500),
    UNIQUE(pagina_id, codigo_acento) -- Una página solo puede tener un registro por acento
);
El puente hacia Cursor (Frontend)
Una vez que ejecutes este SQL en Supabase, el siguiente paso técnico en Cursor es inicializar el proyecto en Next.js e instalar el cliente de Supabase para conectar ambas partes.

En la terminal de Cursor, la secuencia de inicialización sería esta:

Crear el cascarón del proyecto:

Bash
npx create-next-app@latest cuentos-ia-app
    *(Acepta las opciones por defecto: TypeScript, Tailwind CSS, App Router).*

2.  **Entrar a la carpeta e instalar el SDK de Supabase:**
    ```bash
    cd cuentos-ia-app
    npm install @supabase/supabase-js
Configurar las variables de entorno:
Crearás un archivo .env.local en la raíz del proyecto para pegar tus llaves de conexión de Supabase:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima

Con esa base de datos orquestada y el frontend inicializado, el terreno está completamente preparado para empezar a inyectar las variables de texto (como `{{niño_1}}`) y renderizar la aplicación web de manera dinámica.