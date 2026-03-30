# Inventario de Representación de Datos en Opina+

*Fecha: 30 Mar 2026*

Este documento detalla el estado actual de todas las interfaces, badges, bloques y métricas que presentan información cuantitativa o cualitativa al usuario, clasificadas bajo la política unificada de datos de Opina+.

## 1. Zonas con Dato REAL (Conectado a Supabase / Read Models Reales)

### `src/read-models/analytics/metricResolvers.ts` (Métricas Reales)
- **Qué muestra:** `active_signals_24h`, `preference_share`, `leader_entity_name`, `fastest_riser_entity`, `fastest_faller_entity`, `hot_topic_title`, `hot_topic_heat_index`.
- **Qué sugiere:** Estadísticas de tendencias, rankings y volumen de participación comunitaria en tiempo real.
- **Fuente real:** Vistas de base de datos como `v_comparative_preference_summary`, `analytics_daily_entity_rollup`, `v_trend_week_over_week`.
- **Clasificación:** REAL.
- **Riesgo:** Bajo.
- **Observación técnica:** La lectura es canónica a través de `supabase.rpc` o tablas de resumen actualizadas periódicamente.

### `src/features/signals/pages/BattlePage.tsx` (Microcopy Cualitativo)
- **Qué muestra:** Cápsulas "Evaluación rápida" y "100% Anónimo". (Corregido en Paso 1).
- **Qué sugiere:** Seguridad, velocidad y privacidad en el proceso de votación.
- **Fuente real:** Texto estático validado legal y operativamente.
- **Clasificación:** CURADO / REAL (No es métrica, es claim de producto real).
- **Riesgo:** Bajo.
- **Observación técnica:** Limpio de simulación viva.

## 2. Zonas con Dato CURADO PERMITIDO (Autorizado temporalmente por decisión de proyecto)

### `src/read-models/analytics/metricResolvers.ts` (Fallbacks controlados)
- **Qué muestra:** `most_contested_category` ("Categoría Principal"), `hot_topic_polarization_label` ("Neutro"), `generation_gap_label` ("Brecha Moderada"), `integrity_score` (95), `entropy_normalized` (0.5).
- **Qué sugiere:** Sugiere que el motor de analítica ya categorizó la madurez del debate, la polarización generacional y la entropía del set de datos.
- **Fuente real:** Hardcoded estático en el TypeScript del resolvedor de métricas de frontend.
- **Clasificación:** CURADO PERMITIDO.
- **Riesgo:** Medio.
- **Observación técnica:** Está permitido temporalmente para mantener viva la UI de Resultados, pero existe un riesgo latente si B2B confía en un `integrity_score` estático. Debe sustituirse progresivamente.

### `src/features/results/config/resultsRuntime.ts`
- **Qué muestra:** Flag global `RESULTS_RUNTIME_MODE = 'real'`.
- **Observación técnica:** Es una contradicción semántica (marca 'real' pero los resolvedores usan fallbacks fijos). Clasificado como Curado transaccional.

### `src/features/feed/components/HubActiveState.tsx`
- **Qué muestra:** Barajeo (shuffle) de la cola de batallas usando `Math.random()`.
- **Clasificación:** CURADO / TÉCNICO.
- **Riesgo:** Bajo. (Aleatoriza presentación, no falsifica métricas).

## 3. Zonas con Dato SINTÉTICO PROHIBIDO (Dato engañoso disfrazado de real)

### `src/features/signals/components/runner/CrownedChampionView.tsx`
- **Qué muestra:** "Tu preferencia sostenida es [Brand]... El `40 + Math.floor(Math.random() * 20)`% de la comunidad también respaldó a esta opción." Y claims como "Global Reach: 78%".
- **Qué sugiere narrativamente:** Sugiere la existencia de un "AI Insight Progresivo" (mencionado así explícitamente en el componente) que ha evaluado en tiempo real la elección del usuario contra la masa crítica del universo de usuarios, obteniendo un porcentaje de soporte comunitario.
- **Fuente real:** `Math.random()` local y literales harcodeados.
- **Clasificación:** SINTÉTICO PROHIBIDO.
- **Riesgo:** Crítico. Rompe la integridad algorítmica y la percepción de veracidad B2B/Externa. 

### `src/features/signals/components/TorneoRunner.tsx`
- **Qué muestra:** Títulos del torneo se manipulan para aparentar dinámica constante (Ej: "Guerra" se cambia a "Dilema de", "Terapia de", basado en un hash del título original).
- **Qué sugiere narrativamente:** Abundancia editorial inagotable generada algorítmicamente.
- **Fuente real:** `ironicPrefixes[hash % ironicPrefixes.length]`.
- **Clasificación:** SINTÉTICO PROHIBIDO (Modalidad Semántica Editorial).
- **Riesgo:** Medio. No falsea el dato de analíticas pero introduce una mutabilidad no trazable al administrador/catálogo original.
