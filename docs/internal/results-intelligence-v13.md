# Opina+ V13 — Resultados vs Inteligencia

## 1. Definición Conceptual y Reglas de Negocio

El ecosistema de lectura de Opina+ V13 divide deliberadamente la visualización de los datos en dos capas estrictamente separadas para proteger el valor comercial del proyecto (B2B) al mismo tiempo que recompensa la participación del usuario final (B2C).

### 1.1. Capa B2C: Resultados
Es la ventana de "recompensa instantánea" para el usuario de la comunidad tras emitir señales. Retiene al usuario demostrándole dónde encaja su opinión en el marco general.

**Reglas de Diseño:**
*   **Métricas Permitidas:** Sólo se exponen agregaciones de alto nivel (Share Comparativo %, Win Rate de una entidad ganadora de torneos, Volumen General de interacciones si aplica, Promedio Simple de notas superficiales).
*   **Segmentación Prohibida:** El usuario B2C NUNCA podrá aplicar filtros cruzados demográficos (género, edad, sector). Siempre verá el Universo General (`segment_hash = 'GLOBAL'`).
*   **Evolución Estática:** La línea temporal suele estar simplificada a promedios generales o snapshots en lugar de evolutivos milimétricos en el tiempo real.

### 1.2. Capa B2B: Inteligencia
Es el núcleo analítico y el producto comercial a exportar por Opina+ hacia clientes externos o dashboard de administradores. Requiere acceso nivel `admin` o tokens corporativos.

**Reglas de Diseño:**
*   **Segmentación Profunda:** Permite cortes multidimensionales por grupo etario, género, nivel de influencia y región simultáneos.
*   **Capas Temporales:** Muestra series de tiempo detalladas, fluctuación del "Pulso" anímico y migración de share.
*   **Insights de Profundidad:** Compendia semánticamente respuestas del módulo `Depth` para revelar intencionalidad (no solo la elección, sino *por qué* lo eligieron).

---

## 2. Mapeo de UI/UX

| Módulo/Componente | Capa a la que Pertenece | Público Objetivo | Descripción Rápida de UX |
| :--- | :--- | :--- | :--- |
| `/results` | Resultados (B2C) | Usuarios Registrados (mínimo de señales cumplido) | Muestra rankings generales, entidades destacadas (hot trend) y si la última señal del usuario fue mayoría/minoría. El entrypoint en el Hub se llama "**Resultados**". |
| `Versus (Post-Voto)` | Resultados (B2C) | Usuarios Registrados y Guests | Pantalla final simple ("70% votó X, 30% votó Y"). |
| `/intelligence-dashboard` | Inteligencia (B2B) | Administradores, Analistas | Consola con tableros interactivos, drill-down y cruces demográficos. |

---

## 3. Datasourcing V13 y Contratos
Siguiendo la convergencia del Signal Engine iniciada en el Bloque 8, **todos** los componentes de lectura están obligados a usar las vistas analíticas unificadas (Read Models) que emanan de `signal_events`.

### 3.1. Read Models Oficiales (Para Resultados)
La página `Results.tsx` y su paquete de funciones ubicadas en `src/lib/results/` consumen los siguientes modelos limpios y seguros:
*   `v_comparative_preference_summary`: Retorna el share y % de victorias. Fuente de los leaderboards y Versus post-voto.
*   `v_signal_entity_period_summary`: Identifica el total_signals actual contra la semana anterior para tendencias "hot".
*   `v_depth_entity_question_summary`: Promedios pre-calculados de estrellato/calificaciones superficiales.

### 3.2. Restricción Legacy
Servicios antiguos (ej. `resultsAggService.ts` o el `resultsService.ts` anclado a `public_rank_snapshots`) han sido etiquetados como `@transitional - LEGACY BRIDGE`.
*   **Prohibición de Uso Nuevo:** Nunca se deben incluir estos servicios para levantar la UX frontal de Opina+ B2C ni de Opina+ Intelligence B2B a partir de V13.

## 4. Catálogo Oficial de Métricas

### 4.1. Métricas de Resultados (B2C)
| Métrica | Pantalla/Capa | Fuente de Datos | Estado | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Global Leaderboard** | Resultados | `v_comparative_preference_summary` | **OFICIAL** | Ordena entidades por `win_rate`. Provee Share, Wins y Total Votos. |
| **Highlights (Versus/Depth)** | Resultados | `v_comparative_preference_summary`, `v_depth_...` | **OFICIAL** | Devuelve un mix de hitos basados en datos consolidados. |
| **Highlights (Pulse)** | Resultados | - | **ELIMINADO** | Placeholder hardcodeado removido para evitar falsos insights. |
| **Mayor Tracción (WoW)** | Resultados | `v_signal_entity_period_summary` | **TRANSITORIO** (Inactivo) | Desactivado al operar solo sobre volumen reciente sin factor WoW cruzado real. |
| **Cruce de Preferencias** | Resultados | `v_comparative_preference_summary` | **TRANSITORIO** (Inactivo) | Desactivado al emitir "tu preferencia" sin amarrar al UUID actual consistente. |

### 4.2. Métricas de Inteligencia (B2B)
*(Estas métricas se habilitan vía plataforma administrativa consumiendo RPCs, no vistas abiertas)*

| Métrica | Servicio | Fuente de Datos (RPC/Tabla) | Estado | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Advanced Results (Filtros)** | `analyticsService` | `get_advanced_results` | **OFICIAL** | Segmentación demográfica real (gender, age_bucket, region). |
| **Depth Distribution** | `analyticsService` | `get_depth_insights` | **OFICIAL** | Semántica y distribución de estrellas. |
| **Trending Ranking** | `platformService` | `get_ranking_with_variation` | **OFICIAL** | Ponderado de batallas incluyendo variación porcentual genuina. |
| **Segmented Ranking/Trending** | `platformService` | `get_segmented_ranking` | **OFICIAL** | Cruces multidimensionales en el feed del hub. |
| **System Health & KPI Activities**| `platformService` | `get_system_health_metrics`, `get_kpi_...`| **OFICIAL** | Integridad del sistema y cohortes de retención real. |
| **Polarización / Volatilidad** | `platformService` | `get_polarization_index`, `get_battle_volatility`| **OFICIAL** | Clasificaciones avanzadas sobre disputabilidad. |

---

## 5. Deuda Técnica a Futuro (Backlog)
- Las vistas actuales (como `v_comparative_preference_summary`) asumen el modelo general sin segmentos. Para habilitar B2B comercial real, estas vistas requerirán extenderse de forma paramétrica con funciones `get_` (RPCs) construidas puramente sobre `signal_events` soportando `p_gender`, `p_age_bucket`, etc.
- El filtrado de UUID nulos por fallas de `resolveMasterEntity` será saneado asíncronamente o en vista materializada para no castigar el cálculo del backend.
- Construir vistas temporales en SQL genuinas (e.g. `v_trend_week_over_week`) para habilitar el widget de **Mayor Tracción** en la UX B2C de Resultados sin falsear datos.
