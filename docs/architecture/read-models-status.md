# Read Models Status Report

## Vistas Creadas
- `v_signal_entity_summary`: Resumen estático por Entidad.
- `v_signal_entity_type_summary`: Resumen por Entidad y Tipo de Señal.
- `v_signal_entity_period_summary`: Cuentas agregadas transaccionales (Día y Semana) por Entidad.
- `v_comparative_preference_summary`: Comparativas unificadas `VERSUS_SIGNAL` y `PROGRESSIVE_SIGNAL`. Expone Victorias, Derrotas y ratios (Win Rate / Share).
- `v_depth_entity_question_summary`: Métricas evaluativas NPS, Promedios Booleanos y Escalas numéricas para `DEPTH_SIGNAL`.

## Métricas Incluidas (Canónicas)
- `total_signals`, `weighted_signals`.
- `unique_users_count`: Calculado tomando en cuenta al usuario registrado o en su defecto su ID anónimo.
- `last_signal_at`: Última interacción registrada.
- `preference_share` y `win_rate`: Ratios estables de comparación.
- `average_score`: Promedios flotantes redondeados para encuestas numéricas.
- `nps_score`: Expresado porcentualmente (-100 a +100) para preguntas marcadas bajo `scale_0_10`.

## Supuestos Tomados
- **Additive-Only**: Ninguna de las agregaciones destruye y tampoco reemplaza consultas directas de las vistas legacy actuales. Es una capa intermedia de read-models pura.
- **Mapeo Loser_Entity_Id**: La vista comparativa cruza el UUID desde el dictionary *value_json* (`value_json->>'loser_entity_id'`). Históricamente esto puede estar nulo en conversiones antiguas. Hemos usado `NULLIF` estricto para no contabilizar "Entidades genéricas".
- **Identificadores NPS**: Se calculó NPS automáticamente para cualquier respuesta estructurada mediante un límite `scale_0_10` basándose en umbrales estándar (Detractores <= 6, Promotores >= 9).

## Gaps Vigentes Analíticos
- Las dimensiones evaluadas de **Tu Pulso** (`PERSONAL_PULSE_SIGNAL`) no están cruzadas aún en una vista única por no tener modelo evaluativo estándar (algunas son 1-5, otras Si/No, otras palabras). Requeriría un Read Model extra una vez su tipología madure (`v_pulse_dimension_summary`).
- Las entidades faltantes de catálogo (Topics string de News / Actualidad) no sumarán volumetría global dado que su inserción suele estar skipeada en el motor por sanidad cruzada.
