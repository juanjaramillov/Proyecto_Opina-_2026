# Canon de Tendencias y Momentum (V13)

## 1. Definición de Tendencia
En Opina+ V13, la tendencia (o Momentum) **no es** equivalencia al "Top Histórico de Volumen". La tendencia evalúa el cambio de comportamiento de las señales de los usuarios en una ventana de tiempo corta frente a su antecedente inmediato.

## 2. El Baseline "Week over Week" (WoW)
El modelo oficial primario de momentum es el "Week over Week" (`v_trend_week_over_week`).
- **Target Temporal 1 (Actual):** Últimos 7 días móviles.
- **Target Temporal 2 (Previo):** Los 7 días inmediatamente anteriores al bloque actual.

## 3. Taxonomía de Estados Oficiales

Se han definido matemáticamente 4 estados direccionales para la Tracción:

| Estado | Significado Técnico | Requisito Mínimo (Muestra) |
|---|---|---|
| **`acelerando`** | El crecimiento porcentual (Delta) es `>= +15%` frente al periodo previo. | Más de 10 señales en el periodo actual. |
| **`estable`** | El cambio porcentual está contenido entre `-15%` y `+15%`. | Ninguno (si existía data previa). |
| **`bajando`** | El decrecimiento porcentual es `<= -15%` frente al periodo previo. | Ninguno (castiga pérdidas rápidas). |
| **`insuficiente`** | La entidad tiene menos de 10 señales recientes y por su volatilidad no puede juzgarse matemáticamente. | Menos de 10 señales en T1. |

*(Nota: Cualquier entidad sin señales en el periodo previo que reciba más de 10 en la actualidad se designa automáticamente como acelerando)*

## 4. Diferenciación Capas UI

### Resultados (B2C)
En la capa general pública, el `metricsService.getTrendSummary()` excluye deliberadamente el estatus `insuficiente` para no llenar la interfaz de advertencias vacías y focalizarse en "Lo que se mueve":
- UI Ícono **Acelerando:** `trending_up` (Color Primary)
- UI Ícono **Estable:** `trending_flat` (Color Secondary)
- UI Ícono **Bajando:** `trending_down` (Color Danger)

### Inteligencia (B2B)
En la capa de Inteligencia, los reportes deben consumir la vista subyacente para poder mostrar el *Delta Exacto* porcentual (+23%) y no solo la flecha de estado, e incluir entidades marcadas como "insuficientes" para detección temprana de anomalías.

## 5. Deuda Técnica Actual
A futuro, este modelo base se expandirá para soportar también "Preferencia Momentum" (entidades que están ganando rápidamente porcentaje de Win Rate pero no volumen). Por ahora, el momentum es **puramente sobre Volumen de Interacción**.
