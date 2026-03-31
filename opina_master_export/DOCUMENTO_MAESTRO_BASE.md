# OPINA+ MASTER EXPORT (Insumos Comerciales V15)

Este documento centraliza toda la lógica de negocio, arquitectura de producto, modelos de datos y decisiones de Diseño (UX/UI) de Opina+. Reemplaza la necesidad de 20 archivos dispersos, consolidando la información de valor en un formato limpio para el *Documento Maestro Comercial*.

---

## 1. Producto y Mecánicas (Product Overview)

Opina+ es una plataforma premium de gamificación conectando la experiencia B2C (captura iterativa de "señales" humanas) con inteligencia B2B (dashboards analíticos vivos para marcas e inversores). 
Su propuesta de valor central es erradicar las encuestas tradicionales monótonas mediante métricas atómicas, modulares y de muy baja fricción llamadas **"Señales" (Signals)**.

### Definición de Módulos (Mecánicas Core)
1. **Tu Pulso:** Registro diario y rápido del estado de ánimo y energía. Sirve como ancla para correlacionar luego el factor humano (psicografía) con preferencias comerciales.
2. **Actualidad:** Módulos efímeros, altamente reactivos a noticias nacionales o globales para capturar el "Momentum".
3. **Versus (Arena):** Mecánica A vs B (Tinder-like). Es el módulo interactivo central donde se comparan entidades para obtener el *Preference Share*.
4. **Insights / Progresivo:** Preguntas directas de opción múltiple muy cortas (max 3 opciones), minimizando carga cognitiva.

### User Flows Principales
1. **Onboarding & Auth:** Autenticación rápida, priorizando recolectar pocas métricas "duras" para que el usuario no huya en el día 1.
2. **Signals Hub (Home):** El "Lobby" visual con misiones, saldo de puntos y accesos táctiles rápidos a los módulos del día.
3. **Capture Flow (Gamified):** Responde señales en ráfaga (micro-interacciones fluidas reforzadas con animaciones, ej: *Framer Motion*).
4. **Gratificación Instántanea (Results):** "Así votaron los demás". El motor social que mitiga la tasa de abandono mostrando el balance global enseguida.
5. **Loyalty System:** Gamificación retenedora (Niveles, Puntos y Rachas).

---

## 2. Experiencia de Usuario (UX/UI)

El marco visual no es de "encuestadora" (como SurveyMonkey o Forms). Es "Premium Fintech/Crypto" fusionado con lógica de Juegos de Móvil.

### Design Principles (V15)
1. **Premium Dark Mode:** Acercándose al nivel de interfaces transaccionales contemporáneas. Menor fatiga visual.
2. **Alta Interactividad (Haptic & Motion):** El acto de dar una opinión debe "sentirse". Uso intenso de esqueletos de carga (Skeletons) para evitar pantallas en blanco y generar sensación de hiper-velocidad ("Fast Data").
3. **Prioridad Móvil Externa (Thumb-Zone friendly):** Elementos clave organizados en el tercio inferior del teléfono para operar con un solo pulgar.

### Decisiones de UX (UX Decisions)
- **Erradicación de la vista "10 preguntas hacia abajo".** Reemplazada por "Cards" apiladas.
- **Micro-paginación Instantánea:** Sin recargas de URL completas. Transiciones entre el "Voto", el "Resultado" y el "Siguiente".

---

## 3. Arquitectura y Modelo de Datos (Data Architecture)

Opina+ utiliza PostgreSQL (backend mediante Supabase) con un diseño revolucionario: **El Abandono de Formularios por Event-Sourcing de Señales.**

### El Single Source of Truth (`user_signals`)
En lugar de una tabla infinita de preguntas y respuestas textuales, la base de datos registra *Eventos de Señal* de forma atómica.
*Cada interacción* es un registro estructurado con:
- `user_id`: Identidad fuerte.
- `entity_id`: A qué marca o tópico afecta el evento.
- `signal_type`: Ej. `PREFERENCE_VERSUS` o `SENTIMENT`.
- `value`: El valor crudo numérico.
- `weight`: La confianza en ese valor (ej. 0 a 1.0).

### Lógica de Snapshot Demográfico
No se puede correlacionar una señal de hace 3 años con la edad que el usuario tiene **hoy**. El modelo graba un *Snapshot inmutable* (un JSON con la franja de edad, GSE, sexo) en cada `user_signal` dictado en ese micro-segundo. Esto asegura consistencia longitudinal al graficar en Dashboards B2B históricos.

### Segmentación de Audiencias
Combinamos variables categóricas (edad/sexo) con psicográficas (usuarios que reportaron alta energía en Tu Pulso) para generar cohorts hiper-segmentadas que ninguna firma de investigación clásica puede ofrecer en tiempo real.

---

## 4. Modelos Matemáticos y Métricas (Metrics & Logic)

Para poder vender esta data (SaaS B2B), la confiabilidad es sagrada.

### Quality Signals & Antifraude
Se audita la *calidad humana*. Si el usuario vota un "Versus" en menos de 400 milisegundos (apenas puede leer), el sistema no bloquea su flujo para que no se dé cuenta, pero hunde el `weight` (peso) de esa señal a casi cero, sacándola virtualmente del cálculo estadístico B2B.

### Modelos de Tendencia y Decaimiento Temporal (Time Decay)
Si evaluamos "Opina Score", una victoria que la Marca X tuvo hace 12 meses frente a la Marca Y cuenta muchísimo menos que una recolectada la semana pasada. Se aplican funciones de decaimiento logarítmico para premiar el *Live Time Momentum*.

---

## 5. Inteligencia B2B (El Producto Comercial Final)

Toda la "máquina de videojuegos" del B2C existe para alimentar los Dashboards B2B. Aquí ocurre la monetización de Opina+.

### Casos de Uso del Cliente B2B (Use Cases)
1. **Brand Tracker Activo:** Empresas observando gráficamente cómo muta su cuota de preferencia mes a mes de manera fluida.
2. **Crisis Management:** Levantar un pulso "Actualidad" post-escándalo (ej. CEO renuncia) y obtener una foto en 24 horas del impacto actitudinal del consumidor.
3. **Concept Testing A/B:** Marcas de consumo suben un empaque nuevo (MarcaA vs MarcaB) y la comunidad vota.

### El Opina Score™ (Métrica Universal V15)
(Estado de diseño actual)
Es el número sagrado (ej. 0 a 100), similar a un Credit Score de "vida de la marca", integrando ponderadamente:
- Preference Share (Acaparación de victorias en Versus)
- Momentum Reciente (Respuesta viva a eventualidades de mercado)
- Engagement/Sentiment (Estado emocional asociado a los votantes de la marca).

---

## 6. Estado Actual de Desarrollo 

Opina+ (Código Base) ha concluido establemente su **Fase 15 (V15)**.
- **Lógica Front-end B2C:** Altamente refinada, testada y robusta en React+Vite, CSS Modules / Tailwind y Supabase.
- **Modelos de Signals y DB:** Configurados y funcionales.
- **Assets de Configuración Activos:** `demoProtocol.ts` inyecta valores predecibles y sintéticos para demostrar el producto a Inversores o Clientes de forma segura.

### Brechas Conocidas (Pending for B2B)
La construcción de los paneles SaaS (Frontend de BI, tablas dinámicas avanzadas y gráficos temporales) requieren esfuerzo front-end posterior, ya que las vistas SQL que agrupan y promedian las data (`Read Models`) están estructuradas pero deben conectarse a una suite de gráficos de alto nivel.

---
**Fin del Documento Maestro Base**
