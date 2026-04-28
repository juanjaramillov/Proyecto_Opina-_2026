# Cruce · Análisis Gemini Deep Research vs Código Real OpinaScore

> Fecha: 2026-04-28
> Origen del análisis externo: Gemini Deep Research (modo investigación), prompt completo en sesión Cowork.
> Verificación local: migraciones `20260314000400/500`, `20260328000000`, `20260314000200`, `useVersusGame.ts`, `ProgressiveRunner.tsx`.

Este documento cruza el análisis externo de Gemini contra la implementación real para separar lo que aplica de lo que no, y producir un plan priorizado.

## Resumen ejecutivo

| Categoría | Conteo |
|---|---|
| Aciertos de Gemini (mejoras que SÍ aplican) | 6 |
| Errores de Gemini (sugiere algo que ya está implementado) | 7 |
| Hallazgos correctos pero ya cubiertos parcialmente | 2 |
| Mejoras sugeridas que vale ejecutar | 4 priorizadas |
| Riesgo regulatorio identificado | 1 deuda real |

## 1. Lo que Gemini acertó

| Sugerencia | Estado | Acción |
|---|---|---|
| Falta prior bayesiano por categoría (hoy es 0.5 fijo) | Confirmado en `calculate_opinascore_v1_1` línea 51 | **Ejecutar como migración nueva v1.2** |
| Falta raking / post-estratificación demográfica | Confirmado: cero evidencia en código | Esfuerzo alto, decisión de producto |
| Falta opción "No conozco a uno de estos" en versus | Confirmado: schema actual de `signal_events` no la soporta | Mejora valiosa, requiere cambio de schema |
| Falta strength of schedule (Bradley-Terry / Elo) | Confirmado: WPS es proporción local | Implementable como métrica paralela, no reemplazo |
| Riesgo regulatorio Chile/Colombia | Leyes citadas correctamente (Ley 1480, 1581, 19.628, SERNAC, SIC) | **Cerrar deuda con ficha técnica obligatoria** |
| Diferenciación "Conocimiento" vs "Preferencia" | Hoy se mezclan en el WPS | Liga con "no conozco" arriba |

## 2. Lo que Gemini se equivocó (porque no leyó el código)

| Sugerencia de Gemini | Realidad en código | Migración |
|---|---|---|
| "nEff no usa fórmula de Kish, solo cuenta votos limpios" | **Falso.** Usa Kish exacta: `SUM(w)^2 / SUM(w^2)` | `20260314000500` línea 91 |
| "Habría que migrar a Beta-Binomial para tener intervalos" | **Ya hay Wilson weighted.** | `calculate_wilson_interval_weighted` |
| "Falta declarar empate técnico" | **Ya existe `technical_tie_flag`** y baja eligibility a EXPLORATORY | `20260314000500` línea 103 |
| "Falta time-decay" | **Existe** `opina_math_time_decay()` y `get_trending_leaderboard_decay()` | `20260328000000`, `20260314000200` |
| "Falta randomización de orden A vs B" | **Ya hay shuffle** en frontend | `useVersusGame.ts:94`, `ProgressiveRunner.tsx:53` |
| "Falta velocity burst detection" | **Ya hay** `flag_velocity_burst`, `flag_device_concentration`, `flag_repetitive_pattern` | `get_analytical_integrity_flags` |
| "Faltan tres niveles de eligibilidad" | **Ya hay**: `PUBLISHABLE / EXPLORATORY / INTERNAL_ONLY` | `get_premium_eligibility_v1_1` |

**Lección operativa**: cuando solicitemos auditorías externas a futuro, adjuntar siempre `docs/analytics/opinascore-v1.1-current-state.md` para que la IA externa parta del estado real, no de hipótesis.

## 3. Hallazgos parciales o matizados

- **Time-decay y WPS principal**: la función `opina_math_time_decay()` existe y se usa en leaderboards trending, pero NO se ve aplicada explícitamente dentro de `calculate_opinascore_v1_1`. Está la suposición de que `effective_weight` ya viene con decay aplicado upstream, pero no está verificado. **Deuda de verificación**.
- **Stability label**: aparece en el tipo de output pero la lógica de asignación está distribuida en consultas y vistas. **Deuda de centralización** (función única `get_stability_label()`).

## 4. Lo que Gemini NO vio y vale resaltar

- **`integrity_multiplier`** (= integrity_score / 100) que multiplica el score base. Ya cubre buena parte del riesgo adversarial.
- **Penalización por width Wilson > 0.1** con descuento de hasta 300 puntos. Ya cubre buena parte de la "credibilidad estadística".
- **`v_bayesian_m = 10`** sin justificación documentada. Decisión arbitraria que no fue auditada.

## 5. Plan priorizado de mejoras factibles

### Bundle 1 — "Refuerzo regulatorio + tuning bayesiano" (recomendado, ~3 sprints)

| # | Acción | Esfuerzo | Impacto | Riesgo |
|---|---|---|---|---|
| 1 | Documentar `m=10`, `prior=0.5`, penalizaciones, thresholds | 1 día | Alto (auditoría futura) | Cero |
| 2 | Tabla `opinascore_category_priors` + función `recompute_category_priors()` + `get_category_prior()` | 1 sprint | Alto (priors realistas por categoría) | Bajo (no toca cálculo aún) |
| 3 | Migración `calculate_opinascore_v1_2` que usa el prior por categoría con fallback a 0.5/10 | 1 sprint | Alto | Medio (cambio de cálculo central) |
| 4 | Ficha técnica + disclaimer obligatorio en cada export B2B | 1 sprint | Alto regulatorio | Bajo (UI + plantilla) |

### Bundle 2 — "Validación metodológica" (post-MVP, ~3 sprints)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 5 | Implementar Bradley-Terry como score paralelo (no reemplazar WPS) | 3 sprints | Medio (validación cruzada) |
| 6 | Centralizar `get_stability_label()` en una sola función | 1 sprint | Medio (mantenibilidad) |
| 7 | Verificar y documentar dónde se aplica time-decay al WPS principal | 0.5 sprint | Medio (cierra deuda activa) |

### Bundle 3 — "Representatividad poblacional" (decisión de producto, ~6 sprints)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 8 | Raking demográfico contra censo Chile/Colombia | 4-6 sprints | Alto B2B (representatividad real) |
| 9 | Opción "No conozco a uno de estos" + métrica `aided_brand_awareness` | 2 sprints | Medio-alto (limpia ruido del WPS) |

### Decisiones que NO recomiendo ejecutar tal cual

- **Migrar a Beta-Binomial puro** (Gemini lo propone): redundante porque ya hay Wilson weighted con interpretación equivalente para intervalos al 95%. Cambiar genera deuda sin beneficio claro.
- **Reescribir nEff** (Gemini cree que no es Kish): ya es Kish exactamente.
- **Implementar Plackett-Luce ahora**: solo aplica si Opina+ migra a batallas con 3+ opciones simultáneas (decisión de producto, no de cálculo).

## 6. Riesgo regulatorio — cierre obligatorio antes de venta B2B pública

Gemini identificó correctamente las regulaciones aplicables. Si Opina+ vende el OpinaScore a clientes B2B que lo usen en publicidad o comunicación pública, **cada export debe llevar ficha técnica obligatoria** con:

- Declaración: "muestra no probabilística de participación voluntaria".
- Margen de error: ancho del intervalo Wilson al 95% (ya calculado, falta exponerlo).
- Periodo de recolección: fechas exactas.
- Mención de filtros antifraude.
- Disclaimer estándar (texto sugerido en `docs/analytics/opinascore-v1.1-current-state.md` §11 o más abajo).

**Disclaimer mínimo sugerido** (para incluir en cada export B2B público):

> "El ranking de preferencia reportado se basa en el índice OpinaScore, calculado a partir de comparaciones binarias realizadas por usuarios registrados en la plataforma Opina+ en [Chile/Colombia]. Los datos reflejan la percepción de una muestra de participación voluntaria y no constituyen una encuesta probabilística. Resultados sujetos a un margen de error estadístico de ±[X]% con un nivel de confianza del 95%. La metodología completa y auditoría de integridad están disponibles para consulta técnica."

**Acción concreta**: agregar este disclaimer al footer de los reportes generados en `src/features/b2b/`, especialmente `narrativeEngine.ts`, `OverviewB2BDeepDive.tsx` y los archivos que produzcan PDF o exports compartibles.

## 7. Lo que está sólido y NO se toca

Confirmamos los 5 puntos del análisis de Gemini en su sección "Lo que está bien y NO tocaría":

- Comparación binaria (versus) como captura principal.
- Penalización por entropía de Shannon en módulos news.
- Suavizado bayesiano para muestras chicas.
- Visualización B2B "Bloomberg-style".
- Métrica `marginVsSecond` como indicador accionable.

Sumamos a esa lista (lo que Gemini no destacó pero está sólido):

- Wilson weighted interval con `technical_tie_flag`.
- Integrity multiplier que castiga señales adversariales.
- Pipeline de eligibilidad PUBLISHABLE/EXPLORATORY/INTERNAL_ONLY.
- nEff de Kish ponderado.
- Order randomization en frontend.

## 8. Próximos pasos concretos

1. **Inmediato (hoy)**: revisar y aprobar este cruce.
2. **Sprint próximo**: ejecutar **#1 (documentar constantes)** y **#2 (tabla de priors por categoría)**. Migración propuesta en `supabase/migrations/_proposed_opinascore_category_priors.sql` (sin aplicar todavía).
3. **Sprint +1**: ejecutar **#3 (calculate_opinascore_v1_2 con prior por categoría)** y **#4 (ficha técnica B2B)**.
4. **Backlog**: bundles 2 y 3 según roadmap de producto.
