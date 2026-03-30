# Política Única de Fuente de Verdad (Single Source of Truth)

*Versión 1.0 — Opina+ V15 (Marzo 2026)*

Este documento establece la gobernanza obligatoria sobre qué constituye un dato válido y cómo debe ser representado en todas las interfaces de Opina+, asegurando la confianza metodológica del ecosistema B2C y B2B.

## 1. Definiciones Fundamentales

### ¿Qué significa REAL en Opina+?
Para que una métrica, porcentaje, label de estado, número absoluto o volumen sea considerado **REAL**, debe cumplir con **todas** estas condiciones:
1. **Trazabilidad Pura:** Su origen es el registro de eventos reales almacenados persistentemente en la base de datos de producción (Supabase).
2. **Método Matemático Limpio:** Es calculado a través de agregaciones estándar o funciones analíticas autorizadas (Ej: `v_comparative_preference_summary`, RPCs validados).
3. **Latencia Controlada:** Refleja un estado válido reciente (ej. rollup diario o ventana en tiempo real) y nunca predice ni inventa tráfico actual.

### ¿Qué significa CURADO en Opina+?
Un dato o etiqueta **CURADA** es contenido editorial estático inyectado deliberadamente por los administradores de la plataforma o preconfigurado en código bajo consentimiento del equipo de producto.
1. **Regla de Transparencia:** Un dato curado **nunca** debe presentarse matemáticamente exacto o pretender originarse algorítmicamente en tiempo real si no lo hace.
2. **Uso Permitido:** Para placeholders informativos, textos de enganche (Hero Subtitles), orientaciones cualitativas ("Categoría Principal"), o configuraciones globales del admin panel (modo de lanzamiento).
3. **Página de Resultados:** Durante la Fase 1, la vista de Resultados B2C opera bajo un modo primariamente **Curado Autorizado**, utilizando fallbacks editoriales definidos mientras acumula volumen estadístico (Min N_Eff).

## 2. Lo que está Estrictamente Prohibido (Data Sintética)

Bajo ningún concepto, en ninguna ruta visible a un usuario final, se permite la programación de:
- **`Math.random()` disfrazado de porcentaje o usuarios.** (Ej: `% de comunidad respaldándolo`).
- **Simulación Determinística:** Hashes iterativos sobre IDs o Slugs para generar métricas estables pero falsas.
- **Labels engañosamente vivas:** Uso de términos como *"ahora"*, *"en vivo"*, *"live"* junto a números no vinculados a subscriptions reales o refreshers con latencia demostrable corta.
- **Aproximaciones Locales de Analítica:** Atribuir a una "IA de Insights" local porcentajes estáticos duros.

## 3. Nomencaltura de Fuentes y Read Models

Toda información consumida en el ecosistema Frontend proveniente del Backend debe provenir de:
- **`analyticsReadService.ts`**: La única vía de obtención de métricas crudas.
- **`resultsCommunityReadModel.ts`**: La única entidad autorizada a empaquetar, formatear y combinar métricas crudas con fallbacks Editoriales/Curados.
- **`MetricAvailabilityState`**: Si un dato real decae (muestra antigua) o es inexistente (volumen insuficiente), la UI debe acatar obligatoriamente el estado `insufficient_data` o `degraded` proporcionado por el modelo, ocultando o transformando la UI a un fallback **Curado Neutro / Empty State**.

## 4. Regla de Integración de Nuevos Componentes (Checklist Analítico)

Antes de renderizar cualquier nueva métrica cuantitativa (%, Nº, Ranking), el desarrollador debe pasar esta validación:
1. ¿La variable proviene de la BD de Producción vía Supabase API/Vistas? **(Si = 2).**
2. Si no hay data suficiente, ¿hay un plan de Fallback (Empty State) Editorial **Cualitativo** aprobado? **(Si = Pasa. No = Bloqueado).**
3. Si el componente usa datos Curados o Editoriales de reemplazo temporal en producción, ¿éstos carecen de cifras numéricas engañosas simuladas? **(Si = Pasa. No = Bloqueado).**
