# Endurecimiento de la Escritura de Señales V14

## Objetivo
El objetivo de esta intervención fue consolidar la arquitectura de datos V14 de Opina+, eliminando la dependencia de un `UPDATE` asíncrono inseguro posterior al insert, logrando atomicidad en la escritura de señales e integrando el enriquecimiento V14 transversalmente en los distintos módulos del producto, sin romper la compatibilidad actual.

## Verificación de Pasos Implementados

### 1. Migración SQL y Nativización del Backend
Se redactó la migración `20260325000000_extend_insert_signal_event_v14.sql`.
- **Qué hace:** Redefine el RPC `insert_signal_event` incluyendo `p_event_status`, `p_origin_module`, `p_origin_element`, `p_question_id`, `p_question_version`, `p_display_order`, `p_response_time_ms`, `p_sequence_id`, `p_sequence_order`, `p_content_snapshot_id`, `p_left_entity_id`, `p_right_entity_id`, `p_selected_entity_id` y `p_interaction_outcome` como parámetros opcionales (`DEFAULT NULL`).
- **Logro:** El `INSERT INTO public.signal_events` ahora registra atómicamente la totalidad del payload sin necesidad de llamadas a API supeditadas desde el cliente.

### 2. Refactor de `signalWriteService`
Se eliminó la debilidad más grande del frontend temporal.
- En la función principal `saveSignalEvent` se alteraron los `args` del RPC para transmitir los metadatos de forma directa.
- **Se erradicó por completo el bloque asíncrono silencioso** tipo `(sb.from('signal_events').update(...))`. 
- **Logro:** Reducción de latencia, operaciones atómicas 1 a 1 y menor carga genérica de red.

### 3. Propagación Ecosistémica (Módulos)
Se inspeccionaron y adaptaron los servicios de escritura secundaria de las vistas especializadas:

* **Torneo (`TorneoView.tsx` / `signalWriteService.ts`):**  
  Como `Torneo` consume `VersusGame` subyacentemente para renderizar (el cual ya generaba los metadatos `responseTimeMs` y entidades en `onVote`), se extendió `saveTorneoSignal` y `TorneoView` para canalizar las variables nativas: `response_time_ms`, `left_entity_id`, `right_entity_id`.
  - Se inyecta `origin_module: 'progressive'`.

* **Profundidad (`depthService.ts`):** 
  Se enriqueció `saveDepthStructured` para que su conjunto de respuestas acepte opcionalmente la versión y el `id` base de las preguntas, integrando además un metadato extra general y forzando `origin_module: 'depth'`.

* **Actualidad (`actualidadService.ts`):** 
  Se modernizó el submit canonical (`submitAnswers`), abriendo la recepción de `response_time_ms` y `question_version`. Su `origin_module` ahora se transfiere como `'actualidad'`.

### 4. Seguridad de Tipados
Se corrió favorablemente `npm run typecheck` en el repositorio, ratificando que `SignalEventPayload` provee predictibilidad y la nueva aridad en las llamadas no interrumpe el contrato entre Componentes React y los Servicios de Telemetría.

## Estado Final
- **Robustez:** 5/5. Ya no hay escrituras desincronizadas fallando silenciosamente.
- **Compatibilidad:** Preservada. El schema base permite `NULL` por lo que flujos no refactorizados siguen insertando correctamente la metadata básica.
- **Limpieza del Código:** Alta. Se eliminó un anti-patrón en el servicio núcleo de Opina+ (`signalWriteService`).
