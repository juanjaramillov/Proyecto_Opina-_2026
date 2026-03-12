# Depth to Signal Write Flow

## Objetivo

Conectar el módulo de **Depth** al motor unificado de señales sin romper el comportamiento actual. La estructura base exige que las mediciones longitudinales profundas persistan métricas tabuladas.

## Regla de Modelado Obligatoria
En el nuevo formato estandarizado, las señales de este módulo no son guardadas como JSONs gigantes, sino desagregadas:
**1 respuesta estructurada del cuestionario = 1 señal iterativa (`DEPTH_SIGNAL`).**

- NPS = una señal
- Precio/Calidad = una señal
- Sí/No = una señal

## Estrategia

1. **Mantener escritura legacy**: Los flujos siguen grabando `insert_depth_answers` primariamente por compatibilidad del Wizard.
2. **Escritura secundaria asíncrona**: Después del primer save DB, disparamos individualmente promesas SQL que inyectan registros en `signal_events`.
3. **Fallas silenciosa**: Si los helper fallan, o no resuelven validaciones como `resolveMasterEntity`, no afecta el feedback Toast de usuario de la UX actual.
4. **Acoplamiento**: Fire-and-forget en `DepthRun.tsx` y `InsightPack.tsx`.

## Campos relevantes (Map -> DEPTH_SIGNAL)

- `entity_id`: Resultante de buscar el nombre de bloque o marca a través del catálogo curado `signal_entities`.
- `context_id`: Hash de batalla/tour o instancia con `legacy_reference_id` y `kind: 'depth'`.
- `source_module`: `depth`
- `source_record_id`: UUID legado.
- `value_numeric`: Extraído formalmente para promedicar SQL si es "NPS" o Skew.
- `value_boolean`: True o False estricto en "Choice".
- `value_text`: Feedback directo de choice string.
- `value_json`: Todo el metadata legacy de la pregunta (code, etiqueta explícita).

## Normalización
`normalizeDepthAnswer(...)` extrae y mapea límites de escala (0-10 vs 1-5) automáticamente antes de empujar el objeto al RPC PostgreSQL.

## Validación de Producto (Homogeneidad y NPS)

Se ha validado una auditoría que la app cumple lo dictado:
- En la interfaz UI, la primera pregunta recibe inyección de tipo `nps_0_10` por la clave originaria `recomendacion` del bucket o posicion=1.
- Todas las estructuras generadas asumen homogenidad estricta para ser comparadas verticalmente en analytics, usando arrays hardcodeados o JSON options.
