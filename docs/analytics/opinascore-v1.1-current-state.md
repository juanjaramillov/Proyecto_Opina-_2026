# OpinaScore v1.1 · Estado Actual del Cálculo

> Última verificación contra código: 2026-04-28
> Origen: migraciones `20260314000400_opinascore_v1_and_antifraud.sql` + `20260314000500_opinascore_v1_1_formalization.sql` + `20260328000000_math_engine_functions.sql` + `20260314000200_non_battle_signals_contract.sql`.

Este documento describe **lo que el código realmente hace hoy**, no lo que debería hacer. Sirve como referencia única para auditorías, comerciales y revisiones externas.

## Visión general

OpinaScore convierte votos de "batallas" (versus binario, news, depth) en un score 0-1000 por entidad. La conversión combina cuatro capas:

1. **Suavizado bayesiano** sobre la proporción ponderada de victorias.
2. **Penalización por incertidumbre estadística** vía Wilson interval.
3. **Multiplicador de integridad** (0-1) que castiga señales adversariales.
4. **Pipeline de eligibilidad** que clasifica el score como `PUBLISHABLE / EXPLORATORY / INTERNAL_ONLY`.

El cálculo principal vive en la función `calculate_opinascore_v1_1(p_entity_id, p_module_type, p_option_id)`.

## 1. Cálculo base por módulo

### 1.1. Versus (`p_module_type = 'versus'`)

Para una opción dentro de una batalla:

- **Total de votos ponderados** de la batalla:
  ```sql
  v_total_weight = SUM(effective_weight) WHERE battle_id = p_entity_id
  ```
- **Tamaño efectivo de muestra (Kish)**:
  ```sql
  v_n_eff = (SUM(effective_weight))^2 / NULLIF(SUM(effective_weight^2), 0)
  ```
  Esta es la fórmula estándar de Kish para diseños con pesos. Si la suma de cuadrados es cero, fallback a `COUNT(DISTINCT user_id)`.
- **Votos ponderados a favor de la opción**:
  ```sql
  v_opt_weight = SUM(effective_weight) WHERE battle_id = p_entity_id AND option_id = p_option_id
  ```
- **Suavizado bayesiano**:
  ```
  v_score_b = (v_n_eff * (v_opt_weight / v_total_weight) + m * prior) / (v_n_eff + m)
  ```
  Con `prior = 0.5` y `m = 10` (constantes hardcoded en la función).
- **Score base**: `v_score_b * 1000`.
- **Penalización por incertidumbre**: si el ancho del intervalo de Wilson ponderado (`v_w_width = upper - lower`) es `> 0.1`, se descuenta:
  ```
  v_base_score -= 300 * (v_w_width - 0.1)
  ```
  Capeado a un mínimo de 0.

### 1.2. News (`p_module_type = 'news'`)

Mismo suavizado bayesiano sobre la opción más votada (`MAX SUM(effective_weight)` por `value_text`). En lugar de penalizar por Wilson width, penaliza por **entropía de Shannon normalizada**:

```
v_base_score = v_score_b * 1000
v_base_score -= 400 * entropy_normalized
```

Cuanta más dispersión de respuestas (alta entropía), mayor penalización. Si todas las respuestas convergen a una sola opción (entropía baja), el score se conserva.

### 1.3. Depth (`p_module_type = 'depth'`)

Para señales con `value_numeric` (escala 1-10):

- **Promedio ponderado**:
  ```
  v_score_b = AVG(value_numeric)
  ```
- **Suavizado bayesiano** con prior `5.5` (centro de la escala 1-10) y `m = 10`:
  ```
  v_base_score = (v_n_eff * v_score_b + 10 * 5.5) / (v_n_eff + 10)
  ```
- **Normalización a escala 0-1000**:
  ```
  v_base_score = ((v_base_score - 1) / 9) * 1000
  ```

## 2. Multiplicador de integridad

Definido en `get_analytical_integrity_flags(p_entity_id)`. Devuelve:

- `integrity_score` (0-100).
- Tres flags booleanos: `flag_device_concentration`, `flag_velocity_burst`, `flag_repetitive_pattern`.

El multiplicador final aplicado al score base es:

```
v_multiplier = integrity_score / 100
v_final = v_base_score * v_multiplier
```

Es decir, una entidad con integridad 50/100 ve su score base reducido a la mitad.

## 3. Pipeline de eligibilidad

Definido en `get_premium_eligibility_v1_1(p_entity_id, p_module_type)`. Clasifica cada score en uno de tres niveles según thresholds:

| Threshold | Valor | Efecto si NO se cumple |
|---|---|---|
| `n_eff >= 30` (exploratorio) | 30 | `INTERNAL_ONLY` |
| `n_eff >= 100` (premium) | 100 | `EXPLORATORY` |
| `integrity_score >= 50` | 50 | `INTERNAL_ONLY` |
| `integrity_score >= 90` (premium) | 90 | `EXPLORATORY` |
| `opinascore_value >= 300` (premium) | 300 | `EXPLORATORY` |
| `technical_tie_flag = false` | — | `EXPLORATORY` |

`technical_tie_flag` se calcula vía `calculate_wilson_interval_weighted` y se levanta cuando los intervalos de las opciones se solapan suficiente como para considerar empate técnico.

## 4. Time-decay

Existe `opina_math_time_decay()` (migración `20260328000000`) que aplica decay exponencial con half-life parametrizado. Se invoca en:

- `get_trending_leaderboard_decay()` para rankings "trending" del módulo b2b/results.
- Algunas vistas de leaderboard.

**Nota crítica de auditoría**: el decay NO se aplica explícitamente dentro de `calculate_opinascore_v1_1`. Se asume que `effective_weight` en `signal_events` ya viene con el decay aplicado upstream, pero esto no está documentado y debería verificarse en el pipeline de cómputo de `effective_weight`. Si el decay no llega al WPS principal, el score puede arrastrar opiniones antiguas indefinidamente. **Esta es deuda técnica activa**.

## 5. Estabilidad cualitativa

El campo `stability_label` aparece en el tipo `b2b_premium_output` y en metadatos de governance (`20260328200000_analytics_governance.sql`). El valor textual ("Estable", "Volátil", "Insuficiente") se asigna a partir de:

- `n_eff` (umbrales 30 y 100).
- `entropy_normalized` (alta entropía → "Volátil").
- `technical_tie_flag` (empate técnico → reportado como volátil).

La lógica exacta de asignación está distribuida en consultas y vistas, no en una única función. **Esto es deuda de centralización**: convendría tener una función `get_stability_label(p_entity_id)` que sea fuente única de verdad.

## 6. Antifraude e integridad analítica

Tres flags principales:

- **device_concentration**: muchos votos desde un puñado de devices.
- **velocity_burst**: ráfagas anómalas de votos en ventanas cortas.
- **repetitive_pattern**: usuarios votando el mismo patrón repetidamente.

Detalles en `get_analytical_integrity_flags()`. Cada flag activo descuenta puntos del `integrity_score`.

## 7. Order randomization

En frontend (`src/features/signals/hooks/useVersusGame.ts:94` y `src/features/signals/components/runner/ProgressiveRunner.tsx:53`) las opciones se barajan antes de mostrarse:

```typescript
const shuffled = [...baseBattle.options].sort(() => 0.5 - Math.random());
```

Esto neutraliza el sesgo de orden (la opción de la izquierda no recibe más clics solo por estar a la izquierda).

> Caveat técnico: `Array.sort` con comparator aleatorio NO es un shuffle uniforme verdadero (Fisher-Yates lo es). Para batallas con 2 opciones el sesgo es despreciable. Para batallas con 3+ opciones (si Plackett-Luce se implementara), convendría migrar a Fisher-Yates.

## 8. Constantes hardcoded sin justificación documentada

| Constante | Valor actual | Función | Justificación documentada |
|---|---|---|---|
| `v_bayesian_prior` (versus, news) | `0.5` | Prior bayesiano sobre proporción ganadora | No documentada (asume "moneda justa") |
| `v_bayesian_prior` (depth) | `5.5` | Prior bayesiano sobre escala 1-10 | Centro de escala (implícito) |
| `v_bayesian_m` | `10.0` | Peso del prior | No documentada |
| Penalización Wilson width | `300 * (width - 0.1)` con threshold `0.1` | Castigo por incertidumbre | No documentada |
| Penalización entropía | `400 * entropy_normalized` | Castigo por dispersión | No documentada |
| `v_min_n_eff_premium` | `100` | Threshold premium | No documentada |
| `v_min_n_eff_exploratory` | `30` | Threshold mínimo (CLT) | Implícita: regla CLT |
| `v_min_integrity` (premium) | `90` | Threshold integridad premium | No documentada |
| `v_min_opinascore` | `300` | Threshold score mínimo publicable | No documentada |

Estas constantes deberían pasar a una tabla `opinascore_config` o `app_config` con auditoría de cambios y justificación escrita en cada caso.

## 9. Limitaciones conocidas

- **Prior universal 0.5**: marca nueva en cualquier categoría parte con la misma ancla. Una marca de banca y una marca de comida rápida tienen el mismo prior. Mejora propuesta: prior por categoría histórico (ver `docs/audit/opinascore-gemini-review-2026-04-28.md`).
- **Sin strength of schedule**: una victoria contra el líder pesa lo mismo que contra una marca menor. No hay Bradley-Terry ni Elo.
- **Sin raking demográfico**: el score refleja a quien participó, no al universo poblacional. No es representativo en sentido probabilístico estricto.
- **Sin opción "no conozco"**: forzar elección entre dos marcas que el usuario no conoce introduce ruido aleatorio.
- **Time-decay no llega claramente al WPS principal**: deuda activa de verificación.
- **Constantes mágicas sin tabla de configuración**: cualquier ajuste requiere migración SQL.

## 10. Lo que está sólido y NO se debería tocar

- **Comparación binaria (versus)** como mecanismo principal de captura: superior a Likert/escala absoluta.
- **Bayesian smoothing** para evitar scores extremos con muestras chicas.
- **Wilson weighted interval** para estimar incertidumbre.
- **Integrity multiplier** como salvaguarda contra ataques adversariales.
- **Penalización por entropía** en news: detecta polarización.
- **Eligibility tiers** explícitos: PUBLISHABLE/EXPLORATORY/INTERNAL_ONLY antes de exportar a B2B.
- **Order randomization** en frontend.

## 11. Para una auditoría externa o revisión por IA

Si vas a pedir una revisión de OpinaScore a una IA externa (Gemini, ChatGPT, Claude), **adjuntá este documento junto con las migraciones citadas en el header**. Sin este contexto, las IAs externas asumen que el sistema NO tiene cosas que sí tiene (Wilson, Kish, integrity multiplier, etc.) y proponen mejoras redundantes.
