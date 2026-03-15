# Arquitectura: Contrato Nativo de Señales No-Battle

## Problema Original
Históricamente, el Motor de Señales de Opina+ (tabla `signal_events` y la función `insert_signal_event`) fue diseñado bajo una validación estricta de FK hacia las tablas `battles` y `battle_options`.

Esto forzaba a los módulos **Actualidad** y **Depth** a inyectar UUIDs falsos o reutilizar de forma "hackeada" parámetros diseñados para el flujo comparativo (Versus). Por ejemplo:
- Depth guardaba la Entidad Evaluada en `battle_id`, la respuesta en `option_id`, y la pregunta en `attribute_id`.
- Actualidad guardaba el ID del Tópico en `battle_id`, y la respuesta en `option_id`.  

## El Nuevo Contrato Nativo (Bloque 3)
A partir de la versión v3 del Motor Analítico, `insert_signal_event` soporta validación flexible ("Loose Validation") para los `module_type` que no requieran flujo comparativo.

### Firmas y Parámetros
Se habilitaron los campos nativos ya previstos en la tabla base:
- `entity_id` (UUID): Identificador único absoluto de la entidad u objeto de estudio (ej: ID de la Marca en Depth, ID del Topic en Actualidad).
- `entity_type` (TEXT): Etiqueta ontológica (ej: `brand_evaluation`, `news_topic`).
- `context_id` (TEXT): El string del contexto o sub-dimensión (ej: 'trust' o el ID en cadena de la pregunta).
- `value_numeric` (NUMERIC): Para scores directos (ej: nota del 1 al 10 en Depth).
- `value_text` (TEXT): Para selecciones nominales (ej: respuesta categórica en Actualidad).

### Comportamiento de `insert_signal_event`
1. **Flujo Versus / Progressive:** Si el `module_type` es uno de estos, la base de datos **sigue exigiendo** que `p_battle_id` y `p_option_id` existan en sus respectivas tablas maestras.
2. **Flujo Depth / News:** Si el `module_type` es de este tipo, la DB no valida la FK hacia la tabla de batallas. Solo exige que se mande un `entity_id`. Si se omite, pero se envió `battle_id` por legado, el motor lo "resuelve" mapeándolo silenciosamente al `entity_id` para garantizar interoperabilidad con clientes viejos.

### Servicios Modificados
- `actualidadService.ts`: Al enviar encuestas, mapea `entity_id = topicId`, `context_id = question_id`, `value_text = answer_value`.
- `depthService.ts`: Al evaluar NPS u otros, mapea `entity_id = optionId`, `context_id = question_key`, `value_numeric = parseFloat(answer_value)`.
