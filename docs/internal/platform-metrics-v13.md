# Opina+ V13 — Plataforma de Métricas (metricsService)

## 1. Definición de la Capa Central de Métricas

La capa central de métricas (`src/features/metrics/services/metricsService.ts`) actúa como el **cerebro analítico** y la única interfaz autorizada a proporcionar *insights* consolidados a las capas visuales (Resultados e Inteligencia) en Opina+.

El propósito de esta capa es **desacoplar los cálculos y las llamadas SQL** (read models y RPCs) de los componentes de React, prohibiendo terminantemente el uso de consultas ad hoc `supabase.from(...)` distribuidas por la aplicación para propósitos de KPIs y analítica. Todo componente que exponga una tendencia, ranking o posición de mercado debe obligatoriamente solicitar los datos a través del `metricsService`.

---

## 2. Catálogo de Métricas Oficiales

| Nombre Oficial | Descripción | Fuente (Read Model / RPC) | Consumidor(es) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Global Leaderboard** | Top entidades del momento evaluadas por Win Rate general sin filtros demográficos cruzados. | `v_comparative_preference_summary` | Resultados (B2C), Inteligencia (B2B) | **OFICIAL** |
| **Module Highlights** | Hitos sobresalientes y ganadores estáticos de torneos (Versus) y semántica (Depth). | `v_comparative_preference_summary`, `v_depth_entity_question_summary` | Resultados (B2C) | **OFICIAL** |
| **Cruce de Preferencia** | Indicador de coincidencia entre las preferencias del usuario versus el voto de la mayoría | `v_comparative_preference_summary` | Resultados (B2C) | **TRANSITORIA** (Requiere tracking estricto de UUID o cohorte por sesión) |
| **Trend Summary** | Evolución del volumen/preferencia entre periodos consecutivos (e.g. Deltas WoW). | - | Resultados (B2C) | **EN CONSTRUCCIÓN** (Actualmente inactiva a la espera de read models que entreguen el factor temporal delta) |
| **Advanced Segmented Results** | Ranking con soporte demográfico cruzado (género, edad y geografía) de acceso premium. | `get_advanced_results`, `get_segmented_ranking` (Vía `analyticsService`/`platformService` abstraídos o migrados en un futuro iterativo) | Inteligencia (B2B) | **OFICIAL** |
| **Distribución de Profundidad** | Dispersión anímica o semántica sobre cómo califican los usuarios un atributo (estrellas/escala). | `get_depth_insights` | Inteligencia (B2B) | **OFICIAL** |

> **Nota de Arquitectura:** `metricsService.ts` asimila por ahora puramente los *endpoints* B2C (Resultados). Aquellos listados arriba para *Inteligencia* continúan proveyéndose desde `analyticsService.ts` y `platformService.ts`, con la visión de que ambos paquetes se adhieran al gran paraguas conceptual de la "Capa de Métricas".

---

## 3. Manejo de Fallbacks Legacy

A partir de la V13, **se prohibe** la lógica de red social "Híbrida" donde se consulten fuentes antiguas si el motor nuevo carece de datos:

*   **Sin combinaciones opacas de vistas:** Si el nuevo motor de `signal_events` no contiene data representativa, el frontend mostrará el estado vacío ("Aún estamos recopilando información" / EmptyStates).
*   **Encapsulamiento de Legacy:** Cualquier métrica o export histórico residual es estrictamente mantenida fuera del espectro visible al usuario B2C. `resultsAggService.ts` ha sido marcado como legado inoperable para UX Front-Ends. 

---

## 4. Alineación de Negocio

La existencia formal del `metricsService.ts` soporta la **Tesis de Monetización** del proyecto:

1.  **La Señal es la unidad de valor cruda** y nunca debe exponerse sin agregador.
2.  **La Métrica es la extracción monetizable**, y esta vive empaquetada aquí.
3.  **Resultados B2C** tiene acceso a métodos acotados y pre-segmentados globalmente que solo buscan gamificar (mostrar el Leaderboard general, tu coincidencia con las masas).
4.  **Inteligencia B2B** tiene llaves a todo el catálogo paramétrico (cruce por cohortes), pero parte exactamente del mismo subyacente.

---

## 5. Deuda Técnica Remanente

- **Tendencias Auténticas**: Despliegue en Supabase de una vista (o trigger analítico) `v_trend_week_over_week` que exponga la varianza (Up, Down, Stable) sobre `signal_events` para que `getTrendSummary()` pueda volverse operativa con total veracidad en B2C.
- **Unión de scopes de Inteligencia**: Consolidación paulatina de los métodos analíticos hoy ubicados en `platformService.ts` a la carpeta `metrics/` para purificar la segregación de código.
