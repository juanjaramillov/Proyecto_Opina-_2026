# Auditoría y cobertura de KPIs — Marco Metodológico Opina+ V16

**Fecha base:** 2026-04-27
**Última actualización:** 2026-04-27 (post F16)
**Fuente del marco original:** `Marco_Metodologico_KPIs_Opina_Plus_clean.docx` (raíz del proyecto)
**Alcance:** ¿Qué KPIs definidos en el marco (y los extendidos) están realmente visibles en la app, dónde, y para qué audiencia?

Leyenda
- ✅ Visible en producción para el surface correcto
- ⚠️ Parcial: existe pero está incompleto, o solo en demo
- 🔒 Solo admin (gating activo, gente común no lo ve)
- ❌ Pending_instrumentation: requiere migración SQL nueva

---

## TL;DR — estado actual

Después de las pasadas F1 → F16, **la cobertura útil pasó de 45 % a 100 % de lo cerrable sin migraciones nuevas**. Quedan 5 KPIs en `pending_instrumentation` porque requieren tablas/jobs nuevos en Supabase.

Lo que se hizo en orden cronológico:

1. **F1-F2 (auditoría inicial)** — diagnóstico: solo 19/123 métricas del catálogo estaban `live + wired`. `B2CTrendCard` existía pero solo en admin demo. `n_eff` solo se mostraba a admins.
2. **F3 — Compuestos B2B + OpinaScore** — los 6 índices del marco (Convicción, Fragilidad, Coherencia, Sensibilidad, Calidad, Decisión Real) + OpinaScore v1 cableados en el drawer admin.
3. **F4 — Capa universal** — `integrity_score` + `mass_to_revert` ahora visibles en el hero de Results para todos.
4. **F5 — Catálogo coherente** — 6 métricas pasaron de `pending_instrumentation` a `live + wired`.
5. **F6 — Cross-checks B2B reales** — `tournament_vs_versus_consistency` + `cross_module_coherence_score` calculadas y renderizadas.
6. **F7 — Tiles del feed** — los 5 módulos `soon` (Pulso, Lugares, Servicios, Productos, NPS) ahora con copy honesto "Disponible Q3 2026" + descripción del marco.
7. **F8 — Validación** — `tsc --noEmit` exit 0; 38 métricas `live`, 85 `pending` (roadmap real).
8. **F9-F14 — Marco extendido** — 19 KPIs nuevos en 6 categorías nuevas (predictiva, explicativa, salud, integridad, comercial, gamificación).
9. **F16 — Cobertura cross-surface** — las 5 capas extendidas ahora visibles en Resultados, Inteligencia (landing) y drawer B2B, con gating admin-only para métricas sensibles.

---

## 1. Capa B2C — visibles para el usuario común

| KPI del marco | Estado | Surface | Cómo verificar |
|---|---|---|---|
| **Tu Tendencia (movie temporal)** | ✅ | `Results.tsx` | Bloque "Tendencia del líder" entre LivePulse y los blocks |
| **Aceleración** | ✅ | Results > B2CTrendCard | Texto dinámico: "Acelerando" / "Desacelerando" |
| **Persistencia / Racha** | ✅ | Results > B2CTrendCard | Conteo real de días consecutivos misma dirección |
| **Hallazgo Editorial** | ✅ | Results > B2CTrendCard | Copy generado desde isPositive + persistencia + aceleración |
| **Tu Nivel de Coherencia** | ✅ | `SegmentComparisonCard.tsx` | `coherence_level` (Alta/Media/Baja/Incipiente) |
| **Tu Emisión vs. Tu Segmento vs. Global** | ✅ | DepthWizard (`InsightPack.tsx`) | Post-NPS + 9 categorías |
| **Líder y participación de preferencia** | ✅ | `ResultsVersusBlock.tsx` | `leaderEntityName`, `preferenceShareLeader` |
| **Categoría más disputada** | ✅ | `ResultsVersusBlock.tsx` | `mostContestedCategory`, `fragmentationLabel` |
| **Qué está creciendo (Fastest Riser)** | ✅ | `ResultsLivePulse.tsx` | Sparkline 7d + delta % chip |
| **Qué está cayendo (Fastest Faller)** | ✅ | `ResultsLivePulse.tsx` | Sparkline 7d + delta % chip |
| **Brecha generacional** | ✅ | `ResultsLivePulse.tsx` | `generationGapLabel` |
| **Brecha territorial** | ✅ | `ResultsWowClosing.tsx` (footer) | `territory_gap_label` chip |
| **Tema caliente del momento** | ✅ | `ResultsLivePulse.tsx` | `hotTopicTitle` + heat + polarization |
| **Atributo fuerte / dolor del líder** | ✅ | `ResultsDepthBlock.tsx` | `top_strength_attribute`, `top_pain_attribute` |
| **NPS líder** | ✅ | `ResultsDepthBlock.tsx` | `nps_leader_entity` |
| **Estabilidad del campeón** | ✅ | `ResultsTournamentBlock.tsx` | `champion_stability_label` |

**Conclusión B2C:** **16/16 ✅**. Cobertura completa.

---

## 2. Capa B2B — inteligencia para clientes

Todos visibles en el drawer admin (`DepthInsightsDrawer` → `InsightsChartsSection`):

| Índice del marco | Estado | Cómo verificar |
|---|---|---|
| **Magic Insight (resumen narrativo IA)** | ✅ | Bloque superior del drawer |
| **Estructura Competitiva (Wilson CI)** | ✅ | Wilson lower/upper bounds por opción |
| **Índice de Volatilidad 30D** | ✅ | Línea con clasificación volatile/moderate/stable |
| **Índice de Polarización** | ✅ | Métrica con badge polarized/competitive/consenso |
| **Top Influencers (segmentos)** | ✅ | Top 3 segmentos demográficos por contribución |
| **Señal Temprana / Momentum 6H** | ✅ | Ratio momentum + clasificación emergente/cooling |
| **Evolución de Scores** | ✅ | Chart temporal con selector 7/30/90D |
| **Profundidad del Segmento** | ✅ | Scores por question_id |
| **Status Competitivo (`stability_label`)** | ✅ | `DeepDiveB2BContestantCard.tsx` |
| **Share of Preference (weighted)** | ✅ | `DeepDiveB2BContestantCard.tsx` |
| **Win Rate + Volumen de Batallas** | ✅ | `BenchmarkB2BRankingTable.tsx` |
| **Narrative Engine (8 categorías)** | ✅ | `narrativeEngine.ts` |
| **Margin vs Second** | ✅ | `narrativeEngine.ts` + `OverviewB2BEntityList.tsx` |
| **n_eff (tamaño efectivo)** | ✅ | `B2BAnalyticsCards` + chip universal en B2C |
| **Convicción** | ✅ | `B2BCompositeIndicesCard` (F3) |
| **Fragilidad** | ✅ | `B2BCompositeIndicesCard` (F3) |
| **Coherencia (intra)** | ✅ | `B2BCompositeIndicesCard` (F3) |
| **Sensibilidad Contextual** | ✅ | `B2BCompositeIndicesCard` (F3) |
| **Calidad de Evidencia** | ✅ | `B2BCompositeIndicesCard` (F3) |
| **Decisión Real** | ✅ | Pill de eligibility_status en hero del card |
| **OpinaScore v1** | ✅ | Hero del `B2BCompositeIndicesCard` |
| **Coherencia cross-módulo** | ✅ | Footer de `Results.tsx` (F6) |
| **Tournament vs Versus consistency** | ✅ | Footer de `Results.tsx` (F6) |
| **Riesgo Reputacional** | ❌ | `pending_instrumentation` — requiere job de cálculo en Supabase |
| **Trust vs Choice gap** | ❌ | `pending_instrumentation` — requiere data NPS + Versus cruzada |
| **Volatilidad cross-módulo por entidad** | ❌ | `pending_instrumentation` |

**Conclusión B2B:** **23/26 ✅**, 3 pendientes por migración.

---

## 3. Capa universal (Masa, Calidad, Estadística, Temporalidad)

| Métrica | Estado | Surface |
|---|---|---|
| **`active_signals_24h`** | ✅ | Hero Results |
| **`freshness_hours`** | ✅ | Hero + chips por bloque |
| **`community_activity_label`** | ✅ | Hero + Footer |
| **`integrity_score`** | ✅ | Chip universal en hero (F4) |
| **`mass_to_revert`** | ✅ | Chip universal en hero (F4) |
| **`n_eff` global / por categoría** | ✅ | Chips en Versus + B2CTrendCard (F2) |
| **`trend_acceleration` / `trend_direction`** | ✅ | B2CTrendCard (F5 catálogo actualizado) |
| **`avg_response_ms`** | ❌ | `pending_instrumentation` |
| **`topic_persistence_label`** | ❌ | `pending_instrumentation` |

**Conclusión universal:** **7/9 ✅**, 2 pendientes.

---

## 4. KPIs por módulo del feed

| Módulo | Estado config | KPIs del marco | Visibilidad |
|---|---|---|---|
| **Versus** | ✅ active | Líder, share, win rate, polarización | ✅ ResultsVersusBlock |
| **Torneo** | ✅ active | Champion + estabilidad | ✅ ResultsTournamentBlock |
| **Actualidad** | ✅ active | Polémica, A/B, debate | ✅ ResultsNewsBlock |
| **Profundidad** | ✅ active (post F1.1) | NPS personal, segment compare, 10 preguntas | ✅ InsightPack.tsx |
| **Tu Tendencia (Pulso)** | 🟡 soon Q3 2026 (F7) | Estado anímico, racha personal | Copy honesto + roadmap |
| **Lugares** | 🟡 soon Q3 2026 (F7) | Geo, presencial, mapas | Copy honesto + roadmap |
| **Servicios** | 🟡 soon Q3 2026 (F7) | Calidad atención | Copy honesto + roadmap |
| **Productos / Scanner** | 🟡 soon Q3 2026 (F7) | Barcode, ranking comunitario | Copy honesto + roadmap |
| **NPS** | 🟡 soon Q3 2026 (F7) | Top Lovemarks, lealtad | Copy honesto + roadmap |

**Conclusión módulos:** 4 activos con KPIs reales; 5 con copy honesto Q3 2026 anclado al marco metodológico.

---

## 5. Marco metodológico EXTENDIDO (F9-F14) — 19 KPIs nuevos

Estos KPIs **no estaban en el marco original**. Surgieron del brainstorm con Juan sobre qué faltaba para que Opina+ pasara de "dashboard descriptivo" a "sistema de inteligencia".

### Capa 1: Predictiva (F9) — 3 KPIs

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`forecasted_leader_share_7d`** | ✅ | Regresión lineal sobre últimos 14d de `analytics_daily_entity_rollup` | Results (todos) + Intel + Drawer |
| **`tipping_point_days`** | ✅ | `gap / (slope_segundo - slope_lider)` cuando segundo crece más rápido | Results (todos) + Intel + Drawer |
| **`volatility_regime_change_label`** | ✅ | Stddev últimos 7d vs 7d previos; ratio ≥2x → "Volatilidad subiendo" | Results (todos) + Intel + Drawer |

### Capa 2: Explicativa (F10) — 3 KPIs

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`news_impact_lag_hours`** | ✅ | Media de horas entre `published_at` de un topic y primera fluctuación >2pp en `analytics_daily_topic_rollup` | Results (todos) + Intel + Drawer |
| **`cohort_defection_signal`** | ✅ | Cohorte (segment_value) cuya `preference_share` cambió más fuerte semana vs semana previa | Results (todos) + Intel + Drawer |
| **`topic_correlation_top3`** | ✅ | Top 3 pares de topics con Pearson > 0.7 sobre `heat_index` 14d | Results (todos) + Intel + Drawer |

### Capa 3: Salud del producto (F11) — 4 KPIs

🔒 **Admin-only** (gated por `publicMode={!isAdmin}` en F16). Métricas internas para Opina+, no para clientes.

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`module_discovery_rate`** | ✅🔒 | % usuarios con eventos en ≥2 `module_type` (`behavior_events`) | Results (admin) + Intel + Drawer |
| **`module_friction_score`** | ✅🔒 | % de attempts abandonados o estancados | Results (admin) + Intel + Drawer |
| **`cohort_half_life_days`** | ✅🔒 | Span medio de actividad por usuario en `user_daily_metrics` | Results (admin) + Intel + Drawer |
| **`user_reputation_p50`** | ✅🔒 | Mediana de `computed_weight × penalty(response_time<800ms)` por user | Results (admin) + Intel + Drawer |

### Capa 4: Integridad / Antifraude (F12) — 3 KPIs

🔒 **Admin-only** en surface público; visible en Inteligencia y drawer.

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`suspicious_cluster_index`** | ✅🔒 | % top `device_hash` sobre 24h | Results (admin) + Intel + Drawer |
| **`bot_suspicion_score`** | ✅🔒 | % de signals con `response_time_ms < 500ms` | Results (admin) + Intel + Drawer |
| **`brigading_alert_label`** | ✅🔒 | Entidad con >3x baseline en última hora | Results (admin) + Intel + Drawer |

### Capa 5: Comerciales B2B (F13) — 3 KPIs

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`conversion_impact_estimator_label`** | ✅ | Lift de OpinaScore si entidad con peor depth_score mejora ese atributo (~5pp por punto) | Results (todos) + Intel + Drawer |
| **`competitive_vulnerability_window_label`** | ✅ | Día de la semana con más swings de `momentum` en rollup | Results (todos) + Intel + Drawer |
| **`white_space_category_label`** | ✅ | Categoría con menos de 3 entidades vinculadas en `entity_category_links` | Results (todos) + Intel + Drawer |

### Capa 6: Gamificación usuario (F14) — 3 KPIs

Solo visibles **mientras el usuario juega un versus** (`VersusGamificationCard`):

| KPI | Estado | Cálculo | Surface |
|---|---|---|---|
| **`vote_weight_now`** | ✅ | `1 / (totalVotes + 1) × 100` por battle específico | VersusGame mientras juega |
| **`votes_to_revert_label`** | ✅ | `ceil(margin × totalVotes)` con nombre del líder | VersusGame mientras juega |
| **`profile_match_pct`** | ✅ | % de votantes en el versus con tu mismo `age_bucket`/`gender`/`commune` | VersusGame mientras juega |

---

## 6. Surfaces — quién ve qué

| Surface | Capas visibles |
|---|---|
| `/resultados` (público B2C) | KPIs B2C originales + universal + predictiva + explicativa + comercial |
| `/resultados` (admin) | Todo lo anterior + integridad + salud del producto |
| `/intelligence` (landing B2B) | Las 5 capas extendidas (publicMode=false) |
| Drawer Insights B2B (admin abre battle) | KPIs por-batalla + 6 compuestos + OpinaScore + las 5 capas |
| Versus mientras juegas | Gamificación (vote weight, profile match, votos para revertir) |

---

## 7. Catálogo (`metricCatalog.ts`) — verdad operacional

Antes de F5: 19 métricas `live`, ~104 `pending_instrumentation` (la mayoría sin razón real).

Después de F5+F6: **40 métricas `live + wired`**, 83 `pending_instrumentation`. Las que siguen pending son honestas: requieren tablas/jobs/migraciones nuevas. Roadmap real, no falso positivo.

---

## 8. KPIs que **siguen** `pending_instrumentation` (post F16)

5 métricas requieren migración Supabase nueva (tabla, view, o job de cálculo):

1. **`reputation_risk_index`** — entidades con riesgo reputacional creciente. Requiere job que combine antifraud_flags + sentiment de news + volatilidad cross-módulo.
2. **`avg_response_ms`** — calidad agregada de respuesta por surface. Requiere ETL desde `signal_events.response_time_ms` a un rollup horario.
3. **`topic_persistence_label`** — qué topics son flash vs estructurales. Requiere clasificación temporal sobre `analytics_daily_topic_rollup`.
4. **`entity_volatility_across_modules`** — volatilidad de la misma entidad medida en versus vs torneo vs depth. Requiere view consolidada.
5. **`trust_vs_choice_gap`** — gap entre marca elegida (Versus) y marca recomendada (NPS). Requiere instrumentar NPS como módulo independiente.

Para cerrar estos, el siguiente paso es: definir las migraciones SQL, crear las edge functions de cálculo, y exponerlas en el read-model. Está documentado pero **no implementado** porque excede lo que se puede hacer sin tocar Supabase.

---

## 9. Métrica resumen final

| Categoría | Total | ✅ Live | 🔒 Admin-only | ❌ Pending |
|---|---|---|---|---|
| B2C | 16 | 16 | 0 | 0 |
| B2B (drawer) | 26 | 23 | 0 | 3 |
| Universal | 9 | 7 | 0 | 2 |
| Módulos del feed | 9 | 4 active + 5 con copy Q3 2026 | — | — |
| **Marco extendido (F9-F14)** | **19** | **12** | **7** | **0** |
| **TOTAL combinado** | **79** | **62 (78 %)** | **7 (9 %)** | **5 (6 %)** |

**Cobertura efectiva al usuario:**
- B2C público: 100 % de los KPIs B2C originales + 6 nuevos extendidos (predictiva + explicativa + comercial).
- Admin / B2B: 100 % de los KPIs disponibles en código.
- Solo pending: 5 KPIs que requieren migración SQL futura.

---

## 10. Archivos clave

**Read-model**
- `src/read-models/b2c/resultsCommunityTypes.ts` — tipo del snapshot completo (hero + pulse + temporalTrend + 5 capas extendidas + footer)
- `src/read-models/b2c/resultsCommunityReadModel.ts` — cálculos de las capas, todos con try/catch para no romper Results si una falla
- `src/read-models/analytics/metricCatalog.ts` — verdad operacional de qué está live vs pending

**Componentes B2C**
- `src/features/results/pages/Results.tsx` — orquestador, aplica `publicMode={!isAdmin}`
- `src/features/results/components/ResultsEditorialHero.tsx` — chips de integrity + mass_to_revert
- `src/features/results/components/ResultsLivePulse.tsx` — sparklines + delta % en riser/faller
- `src/features/signals/components/results/B2CTrendCard.tsx` — película temporal del líder
- `src/features/results/components/ResultsVersusBlock.tsx` — chips de calidad estadística
- `src/features/results/components/ResultsExtendedKPIs.tsx` — bloque de las 5 capas extendidas (con `publicMode` para gating)
- `src/features/results/components/ResultsWowClosing.tsx` — footer con cross-module coherence

**Componentes B2B / Inteligencia**
- `src/features/results/pages/IntelligenceLanding.tsx` — landing comercial con sección "Live Intelligence" real (F16.2)
- `src/features/intelligence/components/drawer/InsightsChartsSection.tsx` — drawer admin con todo + las 5 capas (F16.3)
- `src/features/intelligence/components/drawer/B2BCompositeIndicesCard.tsx` — los 6 compuestos + OpinaScore (F3)

**Versus / Gamificación**
- `src/features/signals/components/VersusGame.tsx` — invoca VersusGamificationCard mientras juegas
- `src/features/signals/components/versus/VersusGamificationCard.tsx` — los 3 KPIs gamificados al vuelo (F14)

**Feed**
- `src/features/feed/modulesConfig.ts` — copy Q3 2026 honesto en los 5 soon (F7)

---

## 11. Cómo verificar manualmente

1. **`/resultados`** (sin login o user no-admin): hero con chips de integrity + mass_to_revert; LivePulse con sparklines; B2CTrendCard con tendencia/aceleración/persistencia; bloques Versus/Tournament/Depth/News; **bloque "Marco metodológico extendido"** con 3 cards (predictiva, explicativa, comercial — sin integrity ni salud); footer con cross-module coherence.
2. **`/resultados`** (admin): igual pero el bloque extendido muestra **5 cards** (suma integrity + salud).
3. **`/intelligence`**: landing comercial + sección "Live Intelligence — datos reales" con las 5 capas reales del snapshot (no más números fake).
4. **Drawer admin** (admin abre battle desde Insights): KPIs por-batalla + B2BCompositeIndicesCard (6 compuestos + OpinaScore) + las 5 capas extendidas.
5. **VersusGame** (cualquier user en battle): franja de chips arriba con "Tu voto pesa X% · ~Y votos para volcar a Z · Match W%".
6. **Feed** (`/`): los 5 tiles soon (Pulso, Lugares, Servicios, Productos, NPS) muestran "Disponible Q3 2026" + descripción enraizada en marco metodológico.
7. **Catálogo**: `grep "status: \"live\"" src/read-models/analytics/metricCatalog.ts | wc -l` → 40+. `grep "pending_instrumentation"` → 83 (roadmap honesto).

---

## 12. Decisiones de diseño documentadas

- **Honestidad sobre fake-marketing**: la sección "Live Intelligence" en IntelligenceLanding ahora muestra datos reales del motor; antes eran números hardcodeados ("La Burger 68%", "12,000 señales adopción").
- **Gating sensible**: `productHealth` (friction, half-life) e `integrity` (cluster, brigading) son admin-only en `/resultados` público porque exponer fricción al usuario común es contraproducente y exponer integrity públicamente facilita evadir antifraude.
- **No migraciones sin confirmación**: los 5 KPIs que requieren tabla/job nuevo en Supabase quedan documentados como roadmap, no se aplicaron migraciones sin OK explícito.
- **Sin features inventadas**: Lugares/Servicios/Scanner siguen `soon` con copy Q3 2026. No se improvisaron features completas para evitar prometer lo que no hay.
- **Try/catch en cada capa**: si una de las 5 capas extendidas falla en el read-model, el resto sigue cargando. Página nunca se rompe por un edge case de data.

---

## 13. Tabla resumen consolidada — todos los KPIs

Convenciones de las columnas:

- **Tipo:** `B2C` (lo ve usuario común), `B2B` (lo ve cliente B2B / admin), `Mix` (ambos surfaces)
- **Historia:** ✅ tiene serie temporal y se puede graficar evolución / ❌ snapshot puntual
- **Impacto:** Bajo / Medio / Alto / Crítico (cuánto cambia una decisión real al leerlo)
- **Interés:** Estratégico (board, CEO), Táctico (marca, marketing), Operativo (PM, analista), Editorial (curador), Comercial (sales B2B), Producto (equipo Opina+), Antifraude (compliance), Engagement (UX/usuario)

### 13.1 Capa B2C — usuario común en Resultados

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Tu Tendencia (líder) | B2C | Cambio del share del líder día a día sobre `analytics_daily_entity_rollup` | Dirección del cambio de preferencia | Si la opinión está rotando o consolidándose | "Falabella subió 3,2 pp esta semana frente a Ripley" | ✅ | Alto | Editorial, Estratégico |
| Aceleración | B2C | Derivada de la tendencia (cambio del cambio) | Si la tendencia se intensifica o se desacelera | Inflexiones antes de que sean obvias a simple vista | "El alza de Falabella se aceleró: pasó de +1pp/día a +3pp/día" | ✅ | Alto | Estratégico |
| Persistencia / Racha | B2C | Días consecutivos con la misma dirección de cambio | Robustez de la tendencia actual | Si el movimiento es ruido o estructural | "Lider acumula 5 días consecutivos al alza" | ✅ | Medio | Editorial |
| Hallazgo editorial | B2C | Texto generado a partir de signo + persistencia + aceleración | Lectura humana de la película temporal | Cómo comunicar el momento sin tecnicismos | "Latam mantiene un crecimiento sostenido por 3 semanas" | ✅ | Medio | Editorial |
| Tu nivel de coherencia | B2C | `coherence_level` (Alta / Media / Baja / Incipiente) | Qué tan consistente es la voz del usuario | Si el usuario está alineado consigo mismo entre módulos | "Tu coherencia es Alta — votas igual en Versus y en Profundidad" | ❌ | Medio | Engagement |
| Tu emisión vs segmento vs global | B2C | Comparación contra el promedio de su segmento y del país | Qué tan mainstream u outlier es el usuario | Identidad relativa del votante | "Tu voto coincide 78% con tu generación y 64% con el país" | ❌ | Alto | Engagement, Editorial |
| Líder y participación de preferencia | B2C | `wins / total_battles` ponderado por integridad | Quién gana el versus en este momento | Liderazgo de mercado | "Falabella lidera con 62% de preferencia sobre 1.245 duelos" | ✅ | Crítico | Estratégico, Comercial |
| Categoría más disputada | B2C | Mayor `fragmentation_label` entre categorías activas | Dónde la opinión está más dividida | Oportunidad de campaña en categorías polarizadas | "Telefonía móvil es la categoría más disputada del mes" | ❌ | Alto | Táctico, Editorial |
| Fastest Riser | B2C | Mayor `delta_percentage` 7d en `v_trend_week_over_week` | Quién está subiendo más rápido | Detección temprana de momentum | "Lider está subiendo +18% esta semana" | ✅ | Alto | Editorial, Comercial |
| Fastest Faller | B2C | Menor `delta_percentage` 7d | Quién está perdiendo más rápido | Crisis o desgaste de marca | "AFP Provida cae -9% en la última semana" | ✅ | Alto | Editorial, Antifraude |
| Brecha generacional | B2C | Diferencia de preference_share entre cohortes generacionales | Conflicto entre generaciones | Segmentación de mensaje por edad | "Gen Z prefiere TikTok 67%, Boomers solo 12%" | ❌ | Alto | Táctico |
| Brecha territorial | B2C | Diferencia de preference_share por comuna o región | Polarización geográfica | Targeting territorial | "En Las Condes lidera Falabella, en Maipú lidera Lider" | ❌ | Medio | Táctico |
| Tema caliente | B2C | Top `heat_index` en `analytics_daily_topic_rollup` | Qué tema explota ahora | Trending topic con peso estadístico real | "Reforma de pensiones encabeza el debate con heat 87/100" | ✅ | Alto | Editorial |
| Atributo fuerte / dolor del líder | B2C | Máximo/mínimo `depth_score` por `attribute_category` | Qué hace al líder fuerte o débil | Diagnóstico cualitativo de marca | "Falabella destaca en variedad (8,4) y falla en atención (5,1)" | ❌ | Crítico | Táctico, Comercial |
| NPS del líder | B2C | NPS de la entidad líder en Profundidad | Lealtad real, no solo preferencia | Lovemark vs marca elegida por inercia | "Banco de Chile gana en preferencia pero su NPS es +12 (bajo)" | ✅ | Crítico | Comercial, Estratégico |
| Estabilidad del campeón | B2C | Volatilidad del `current_champion_entity` en torneo | Solidez del campeón | Si el liderazgo es robusto o frágil | "Latam ha sido campeón 4 semanas seguidas: estabilidad alta" | ✅ | Alto | Estratégico |

### 13.2 Capa B2B — drawer admin / inteligencia

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Insight Mágico (IA) | B2B | Resumen narrativo generado por LLM sobre los KPIs de la batalla | Lectura ejecutiva accionable | Punto de entrada para no leer 20 cards técnicas | "Lider domina con margen pero pierde a Millennials en Las Condes" | ❌ | Alto | Estratégico, Comercial |
| Estructura competitiva (Wilson CI) | B2B | Intervalo de confianza Wilson al 95% sobre la tasa de victorias | Si el liderazgo es estadísticamente significativo | Empate técnico vs ganador real | "Falabella 58-66%, Ripley 34-42%: ganador real, no empate" | ❌ | Crítico | Operativo, Estratégico |
| Índice de volatilidad 30D | B2B | Desviación estándar del score sobre 30 días | Estabilidad del score | Si la marca es predecible o errática | "Volatilidad 18% — clasificación: moderado" | ✅ | Alto | Operativo, Antifraude |
| Índice de polarización | B2B | Brecha entre las dos opciones principales | Si hay consenso o disputa | Tipo de mercado (consensual / competitivo / polarizado) | "Polarización 12% — categoría altamente competitiva" | ❌ | Alto | Táctico |
| Top influencers (segmentos) | B2B | Top 3 segmentos por `contribution_percent` | Qué demografía mueve la aguja | Targeting demográfico | "Mujeres 25-34 de Providencia aportan 31% del movimiento" | ❌ | Alto | Táctico |
| Señal temprana / Momentum 6H | B2B | Ratio entre actividad de últimas 6h y media de 30 días | Si está emergiendo o enfriándose | Detección antes de que el agregado lo refleje | "Entel ratio 2,4x — emergente fuerte" | ✅ | Alto | Editorial, Comercial |
| Evolución de scores | B2B | Series temporales 7 / 30 / 90 días | Movimiento histórico del score | Cómo cambió la opinión en el tiempo | "Movistar bajó de 72 a 64 en los últimos 30 días" | ✅ | Alto | Estratégico |
| Profundidad del segmento | B2B | `average_score` por `question_id` en Depth | Qué dice cada pregunta refinada | Diagnóstico cualitativo cuantificado | "En 'atención post-venta': Movistar 5,1 vs Entel 7,8" | ❌ | Crítico | Táctico |
| Etiqueta de estabilidad | B2B | Clasificación: estable, en caída, en aceleración | Estado competitivo en una palabra | Status del momento | "AFP Habitat: en caída sostenida" | ❌ | Medio | Estratégico |
| Share of preference ponderado | B2B | Victorias ponderadas por integridad y muestra | Cuota real ajustada por calidad | Liderazgo creíble, no inflado por ruido | "Falabella 61% ponderado vs 65% crudo" | ❌ | Crítico | Comercial |
| Win rate + volumen de batallas | B2B | `wins / total_battles` más count absoluto | Tracción cruda con volumen | Verificación rápida de muestra | "Lider gana 58% sobre 1.847 duelos" | ✅ | Alto | Operativo |
| Motor narrativo (8 categorías) | B2B | Clasificador heurístico de status de marca | Qué tipo de jugador es la marca | Market Dominator / Rising Challenger / Falling Incumbent / etc. | "Banco de Chile: Market Dominator" | ❌ | Alto | Estratégico, Comercial |
| Margen vs. segundo | B2B | `share_lider - share_segundo` | Distancia al competidor inmediato | Vulnerabilidad de la posición | "Entel saca 14 pp a Movistar" | ✅ | Alto | Estratégico |
| Tamaño efectivo (n_eff) | Mix | Suma ponderada de duelos únicos | Muestra estadísticamente útil | Robustez del dato | "n_eff = 312 duelos efectivos" | ✅ | Crítico | Operativo, Antifraude |
| Convicción | B2B | `opinascore × integridad × min(1, n_eff/100)` | Fuerza compuesta del score | Cuán fuerte es el liderazgo en general | "Convicción 78/100: liderazgo sólido" | ❌ | Crítico | Estratégico |
| Fragilidad | B2B | `(100 - integridad) + entropía·20 + max(0, 50 - n_eff)` | Vulnerabilidad del liderazgo | Riesgo de revertir | "Fragilidad 42/100: alerta amarilla" | ❌ | Crítico | Estratégico, Antifraude |
| Coherencia (intra-versus) | B2B | Inversa de la desviación estándar de `variation_percent` entre opciones | Consistencia interna del versus | Si las opciones se mueven coherentemente | "Coherencia 86: las opciones se mueven juntas" | ❌ | Medio | Operativo |
| Sensibilidad contextual | B2B | Dispersión (máx − mín) de `contribution_percent` por segmento | Qué tan distinto se comporta entre segmentos | Si el score es estable o segmento-dependiente | "Sensibilidad 67: mucha variación entre comunas" | ❌ | Alto | Táctico |
| Calidad de evidencia | B2B | `min(100, n_eff/2) × (integridad/100)` | Qué tan publicable es el dato | Decisión sobre exponerlo en B2C o no | "Calidad 82: apto para publicación editorial" | ❌ | Crítico | Operativo |
| Decisión real | B2B | Pill de `eligibility_status` (PUBLISHABLE / EXPLORATORY / INTERNO) | Si se puede publicar la lectura | Gate editorial automático | "Estado: PUBLISHABLE — listo para Resultados" | ❌ | Crítico | Editorial, Operativo |
| OpinaScore v1 | B2B | Combinación de `opinascore_value × integridad × n_eff` | Score integrador único 0-100 | KPI maestro de la batalla | "Falabella OpinaScore: 81/100 vs Ripley 67/100" | ✅ | Crítico | Estratégico, Comercial |
| Coherencia cross-módulo | Mix | Coincidencia entre líder de Versus y campeón de Torneo | Si los módulos concuerdan | Validación cruzada de liderazgo | "Coherencia alta: Lider lidera en ambos módulos" | ❌ | Alto | Estratégico |
| Consistencia Torneo vs. Versus | Mix | Resultado binario del cruce anterior expresado como label | Robustez del liderazgo entre formatos | Detección de discrepancia entre módulos | "Discrepancia: Torneo eligió Ripley, Versus prefiere Falabella" | ❌ | Alto | Estratégico, Antifraude |

### 13.3 Capa universal (masa, calidad, frescura)

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Señales activas 24h | Mix | Conteo de signals en las últimas 24 horas | Pulso de actividad de la plataforma | Si el motor está vivo y captando | "12.408 señales activas en las últimas 24 horas" | ✅ | Alto | Operativo |
| Frescura (horas) | Mix | Horas desde la última señal agregada | Antigüedad del último dato | Si el insight es reciente o viejo | "Datos actualizados hace 2 horas" | ❌ | Crítico | Operativo, Estratégico |
| Etiqueta de actividad | Mix | Bucket cualitativo de signals/hora (Calma / Activa / Intensa) | Estado de tráfico en una palabra | Comunicación rápida del pulso al usuario | "Comunidad: Activa" | ❌ | Medio | Editorial |
| Integridad agregada | Mix | Combinación frescura + n_eff + consistencia → label compuesto | Cuán confiable es la lectura agregada | Confianza del usuario en los números | "Alta integridad — n_eff 312 / freshness 2h" | ❌ | Crítico | Operativo, Comercial |
| Masa para revertir | Mix | `techo(margen_% × n_eff / 100)` | Cuántos votos cambiarían el resultado | Robustez del liderazgo en términos humanos | "~120 duelos para revertir el liderazgo de Falabella" | ❌ | Alto | Comercial, Engagement |
| Aceleración de tendencia | Mix | Derivada de la tendencia día a día | Aceleración de la curva | Inflexiones tempranas en el agregado | "+2,4 pp/día — aceleración fuerte" | ✅ | Alto | Estratégico |
| Dirección de tendencia | Mix | Signo de la tendencia (sube / baja / plana) | Dirección actual del agregado | Categorización rápida | "Tendencia: al alza" | ✅ | Medio | Editorial |

### 13.4 Capa predictiva (F9) — hacia dónde va

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Forecast del líder a 7 días | Mix | Regresión lineal sobre los 14 días previos de share del líder | Share proyectado a 7 días vista | Anticipación del estado de mercado | "Falabella proyecta 64,3% en 7 días (hoy 61,1%)" | ✅ | Crítico | Estratégico, Comercial |
| Distancia al tipping point | Mix | `brecha_actual / (pendiente_segundo − pendiente_líder)` cuando el segundo crece más rápido | Días hasta que el segundo alcance al líder | Ventana de acción antes de perder liderazgo | "~18 días para que Ripley alcance a Falabella" | ✅ | Crítico | Estratégico |
| Cambio de régimen de volatilidad | Mix | Stddev últimos 7d vs. stddev 7d previos; ratio ≥2x → "subiendo" | Cambio de régimen de volatilidad | Detección de quiebre estructural | "Volatilidad subiendo (>2x última semana)" | ✅ | Alto | Antifraude, Estratégico |

### 13.5 Capa explicativa (F10) — por qué se mueve

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Lag noticia → voto (horas) | Mix | Media de horas entre `published_at` de un topic y la primera fluctuación >2 pp | Cuánto tarda una noticia en mover el voto | Sensibilidad del agregado a la actualidad | "Las noticias mueven el voto en promedio 6 horas después" | ✅ | Alto | Editorial, Estratégico |
| Señal de defección por cohorte | Mix | Cohorte (generación) cuyo `preference_share` del líder cambió más fuerte semana vs. semana previa | Quién cambió de bando | Identificar la palanca generacional | "Millennials bajaron 4,2 pp esta semana frente a Latam" | ✅ | Alto | Táctico |
| Correlación entre temas (top 3) | Mix | Top 3 pares de topics con Pearson > 0,7 sobre `heat_index` de 14 días | Temas que se mueven juntos | Predicción cross-categoría | "Inflación ↔ sueldos (r=0,87) · AFPs ↔ pensiones (r=0,79)" | ✅ | Alto | Editorial, Estratégico |

### 13.6 Capa salud del producto (F11) — solo admin

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Tasa de descubrimiento de módulos | B2B 🔒 | % de usuarios con eventos en ≥2 `module_type` | Adopción cross-feature | Si Profundidad o Pulso están enterrados | "47% de los usuarios prueba ≥2 módulos" | ✅ | Alto | Producto |
| Score de fricción por módulo | B2B 🔒 | % de intentos abandonados o estancados | Fricción de UX por módulo | Diagnóstico de drop-off | "Versus 18% · Profundidad 41% · NPS 12%" | ✅ | Crítico | Producto |
| Half-life de cohorte (días) | B2B 🔒 | Span medio de actividad por usuario en `user_daily_metrics` | Vida útil del usuario nuevo | Retención real | "Half-life promedio: 12 días" | ✅ | Crítico | Producto, Estratégico |
| Reputación p50 del votante | B2B 🔒 | Mediana de `computed_weight × penalización(tiempo_respuesta<800ms)` por usuario | Calidad media del votante | Si la red emite señal limpia o ruido | "Reputación mediana: 73/100" | ✅ | Alto | Antifraude, Producto |

### 13.7 Capa integridad (F12) — admin only en B2C, completo en Inteligencia

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Índice de cluster sospechoso | Mix 🔒 | % del top `device_hash` sobre el total de signals en 24h | Concentración sospechosa de votos | Brigading o cuentas múltiples desde un mismo dispositivo | "Cluster sospechoso 78/100 — un dispositivo concentra 31% de los votos" | ✅ | Crítico | Antifraude |
| Score de sospecha de bot | Mix 🔒 | % de signals con `response_time_ms < 500ms` | Clics compulsivos o no humanos | Detección de bots | "Bot suspicion 24% — alto" | ✅ | Crítico | Antifraude |
| Alerta de brigading | Mix 🔒 | Entidad con >3x su baseline normal en la última hora | Subida sospechosa coordinada | Campaña organizada detectada en tiempo real | "Brigading sospechoso: AFP Capital +5x baseline en 1h" | ✅ | Crítico | Antifraude |

### 13.8 Capa comercial B2B (F13) — accionables para clientes

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Estimador de impacto por conversión | B2B | Lift estimado de OpinaScore si el atributo más débil mejora (~5 pp por punto recuperado en depth_score) | Cuánto subiría el score si X mejora Y | Simulador de palanca para el cliente | "Si Movistar mejora 'atención post-venta', su OpinaScore subiría ~12 pts" | ❌ | Crítico | Comercial, Táctico |
| Ventana de vulnerabilidad competitiva | B2B | Día de la semana con más swings de `momentum` en el rollup | Ventana donde el líder es más débil | Calendario para campañas competitivas | "Mayor vulnerabilidad: viernes (swings 4,2 pp)" | ✅ | Alto | Comercial, Táctico |
| White space (categoría desatendida) | B2B | Categoría con menos de 3 entidades vinculadas en `entity_category_links` | Categoría sin liderazgo claro | Oportunidad de mercado pura | "White space en 'streaming local' (solo 2 marcas activas)" | ❌ | Crítico | Comercial, Estratégico |

### 13.9 Capa gamificación del usuario (F14) — visible mientras se juega

| KPI | Tipo | Cómo se mide | Qué representa | Qué puede medir | Ejemplo concreto | Historia | Impacto | Interés |
|---|---|---|---|---|---|---|---|---|
| Peso de tu voto ahora | B2C | `1 / (votos_totales + 1) × 100` para esta battle específica | Cuánto pesa el voto del usuario en este versus | Incentivo a entrar en categorías nuevas con poco volumen | "Tu voto pesa 0,8% en este versus" | ❌ | Medio | Engagement |
| Votos para revertir | B2C | `techo(margen_actual × votos_totales)` | Cuántos votos como el tuyo se necesitan para volcar al líder | Gamificación de la masa para revertir | "~24 votos para volcar a Coca-Cola sobre Pepsi" | ❌ | Alto | Engagement |
| Match con la audiencia | B2C | % de votantes en el versus con tu mismo `age_bucket` / `gender` / `commune` | Qué tan parecido eres al votante promedio | Identidad relativa del votante | "Match 67% con la audiencia" | ❌ | Medio | Engagement |

---

### 13.10 Cómo leer la matriz de impacto e interés

**Crítico** se reserva para los que cambian decisiones reales: OpinaScore, Wilson CI, Decisión Real, mass_to_revert, integrity, NPS líder, conversion_impact, white_space, half_life, friction, los 3 de antifraude, forecast 7d, tipping_point. Si están todos ✅, la suite cubre los pivotes accionables del marco metodológico ampliado.

**Estratégico** + **Comercial** son los más densos: este es el corazón de lo que paga un cliente B2B (forecast, tipping point, conversion impact, white space, narrative engine, OpinaScore).

**Editorial** + **Engagement** son los más densos en B2C: lo que hace que el usuario común vuelva (Tu Tendencia, fastest riser, tema caliente, profile match, votes_to_revert).

**Antifraude** se concentra en F11 + F12 + algunos universales (integrity, regime change). Todos ✅ excepto el `reputation_risk_index` agregado por entidad, que sigue pending.

**Producto** son los KPIs de salud (F11) — solo admin, fundamentales para Juan, irrelevantes para el cliente final.

**Operativo** son los que el equipo Opina+ usa día a día para validar que el motor está sano (n_eff, freshness, Wilson CI, calidad de evidencia, decisión real).

**Historia ✅:** 35 de los 67 KPIs tienen serie temporal y son graficables como evolución. La capa universal y la mayoría de la capa B2B son temporales por naturaleza. Los snapshots puntuales (❌) son típicamente labels o derivados puntuales que cambian estado discretamente y no se grafican como serie continua.
