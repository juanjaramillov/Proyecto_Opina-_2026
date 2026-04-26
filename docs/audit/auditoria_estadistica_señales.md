# Documentación Técnica y Estadística de Señales (Opina+)

Este documento detalla la arquitectura de información de las "Señales" (interacciones de opinión) dentro de la plataforma Opina+, estructurada específicamente para facilitar la comprensión, modelado y validación por parte de un **auditor estadístico**.

La plataforma no solo recopila respuestas aisladas, sino que construye un perfil progresivo del usuario, ponderando matemáticamente cada señal basada en la fiabilidad, completitud demográfica y comportamiento histórico.

---

## 1. El Ecosistema de Señales: El Hub de Interacción

En Opina+, el usuario interactúa entregando valoraciones o elecciones a las que llamamos **Señales**. El sistema clasifica estas interacciones a través de **9 módulos especializados**, cada uno diseñado metodológicamente para capturar un tipo específico de data conductual, actitudinal o preferencia.

### 1.1. Módulos de Preferencia y Competencia
*   **Versus (`versus`):** El motor principal de gamificación. Interacción 1vs1 (A vs B) donde el usuario toma decisiones binarias rápidas. Captura preferencia relativa directa.
*   **Torneo (`torneo`):** Sistema de eliminación directa. Una opción avanza en llaves hasta definir la preferencia invicta (ideal para encontrar la preferencia absoluta en una categoría amplia).

### 1.2. Módulos Analíticos y de Profundidad
*   **Profundidad (`profundidad`):** Batería de 10 preguntas rápidas enfocadas en una sola entidad/marca para refinar la inteligencia colectiva. Permite derivar *sesgos cognitivos*, *arquetipos* y puntuaciones de consistencia.
*   **NPS (`nps`):** Módulo basado en la escala estándar de *Net Promoter Score* (1 a 10). Diseñado para descubrir lealtad ("Lovemarks") y detectar promotores/detractores de forma rápida.

### 1.3. Módulos Sensoriales y Contextuales (Fast Signals)
*   **Tu Tendencia / Pulso (`pulso`):** Módulo privado y confidencial. Sincroniza el estado anímico, felicidad y finanzas diarias del usuario. Genera series de tiempo (*Time-Series*) para aislar si una tendencia de consumo está afectada por el ánimo macroeconómico.
*   **Actualidad (`actualidad`):** Reacción a debates del momento. Sistema **Dual** donde el usuario no solo emite su postura (a favor/en contra), sino el *impacto* real que tiene en su vida, midiendo polarización y burbujas ideológicas.

### 1.4. Módulos en Terreno y Físicos (Geo & Escaneo)
*   **Lugares (`lugares`):** Calificación in-situ de ubicaciones físicas (parques, restaurantes, locales). Permite crear mapas de calor geoespaciales de la opinión colectiva.
*   **Servicios (`servicios`):** Evaluación de la calidad de atención de proveedores locales (Isapres, Aseguradoras, Telecomunicaciones), evaluando calidad percibida versus expectativas.
*   **Productos (`productos`):** Inteligencia colectiva de bolsillo. El usuario escanea el código de barras de un producto (ej. en el supermercado) para emitir o ver valoraciones comunitarias (relación precio/calidad, ecología, recomendación).

---

## 2. Emisión de Datos: ¿Qué entrega exactamente el usuario?

Dependiendo del módulo, las tablas transaccionales (`signal_events`, `user_pulses`, `user_actualidad_responses`) almacenan diferentes *payloads*, pero todos comparten un esqueleto técnico de validación:

*   **Identificación de Decisión:** Entidades evaluadas (`left_entity_id`, `right_entity_id`, `selected_entity_id`, o `tema_id`).
*   **Valor de la Señal:** Respuesta exacta (`value_numeric`, `value_text`, `value_boolean` o JSON estructurado).
*   **Métricas de Fricción:** `response_time_ms` (milisegundos que tomó la decisión, vital para descartar bots o clics sin lectura).
*   **Metadatos Técnicos:** `device_hash`, `session_id`, `source_module` (para aislar comportamientos anómalos o *brigading*).

---

## 3. El Perfil Sociodemográfico (Progressive Profiling)

La riqueza de la data estadística en Opina+ reside en el cruce de la señal con la identidad del usuario. La tabla `user_profiles` no se exige toda al inicio, sino que se construye progresivamente a cambio de gamificación. Contiene una matriz de alta dimensionalidad:

*   **Demografía Básica:** `birth_year`, `age_bucket` (Cohortes), `gender`.
*   **Geografía:** `region` y `comuna` (Cortes poblacionales).
*   **Nivel Socioeconómico:** `education_level`, `employment_status`, `income_range`.
*   **Composición del Hogar:** `household_size`, `children_count`, `housing_type`, `car_count`.
*   **Psicografía:** `purchase_behavior`, `influence_level`.

---

## 4. El Cruce Estadístico y Ponderación del Dato (Motor de Inteligencia)

Para el **auditor estadístico**, es crucial notar que Opina+ **no asume que todos los votos valen "1"**. Utiliza un motor matemático en tiempo real (`effective_weight`) para limpiar y estandarizar la muestra.

### 4.1. Snapshot de Variables Demográficas
En el milisegundo exacto en que un usuario emite una señal, el sistema hace una copia (*snapshot*) de su `age_bucket`, `gender`, `region` y `comuna` directamente en la fila de la señal. 
*   **Razón Auditora:** Si el usuario envejece o se muda dos años después, la señal histórica mantiene la integridad estadística del momento en que se emitió.

### 4.2. Ponderación de Confianza (Trust & Completeness)
El voto (`raw_weight`) se altera dinámicamente (`effective_weight`) según:
1.  **Completitud del Perfil (`profile_completeness`):** Un voto de alguien que ha entregado todas sus variables socioeconómicas pesa más analíticamente que un voto anónimo.
2.  **Fidelidad y Confianza (`trust_score`):** Evaluado en base a su antigüedad y nivel (Bronce a Platino). Cuentas verificadas y consistentes tienen un factor multiplicador.
3.  **Velocidad de Respuesta:** Tiempos humanamente imposibles (ej. < 200ms) o patrones repetitivos degradan automáticamente el peso a 0.

---

## 5. Ejemplos Prácticos de Estructuras de Datos

Para ilustrar cómo el *Cubo de Datos* estandariza estas interacciones para su extracción y análisis estadístico, a continuación se detallan ejemplos de cómo se registran físicamente en la base de datos módulos específicos.

### Ejemplo A: Módulo de Profundidad (`profundidad`)
El usuario evalúa una marca específica (ej. "Banco Estado") en un atributo de confianza.

**Registro en tabla `signal_events`:**
*   `signal_id`: `uuid-1234`
*   `module_type`: `"profundidad"`
*   `selected_entity_id`: `uuid-banco-estado`
*   `question_id`: `uuid-pregunta-confianza` (Ej. "¿Confías en esta institución para tus ahorros a largo plazo?")
*   `value_numeric`: `4` (En escala de 1 a 5)
*   `response_time_ms`: `1850` (1.85 segundos)
*   **Snapshot Demográfico:** `age_bucket`: `"25-34"`, `gender`: `"female"`, `region`: `"Metropolitana"`
*   **Ponderación:** `raw_weight`: `1.0` -> *Cálculo del motor* -> `effective_weight`: `1.45` (Ejemplo por alta fidelidad y perfil completo).

### Ejemplo B: Módulo de Productos (`productos` / Escaneo)
El usuario escanea un código de barras de un jugo en el supermercado y evalúa su relación precio-calidad.

**Registro en tabla `signal_events`:**
*   `signal_id`: `uuid-5678`
*   `module_type`: `"productos"`
*   `selected_entity_id`: `uuid-jugo-marca-x` (Entidad maestra asociada al EAN/UPC escaneado)
*   `question_id`: `uuid-pregunta-precio-calidad`
*   `value_text`: `"Muy Caro para la calidad"` (O valor de un catálogo)
*   `origin_element`: `"barcode_scanner"` (Valida que la señal fue capturada físicamente en terreno, otorgando una señal de contexto espacial).
*   `response_time_ms`: `3400`
*   **Snapshot Demográfico:** `age_bucket`: `"45-54"`, `gender`: `"male"`, `comuna`: `"Providencia"`
*   **Ponderación:** `raw_weight`: `1.0` -> *Cálculo del motor* -> `effective_weight`: `1.20`

Estos registros atómicos permiten que los motores de agregación de Opina+ calculen de forma precisa promedios ponderados (`weighted_score`), intervalos de confianza (`ci_lower`, `ci_upper`) y "Share of Preference" aislando segmentos demográficos específicos sin riesgo de contaminación estadística.
