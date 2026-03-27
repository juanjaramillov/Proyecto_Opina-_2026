# Resumen Ejecutivo - Validación Arquitectura V14 (Opina+)

## ¿Qué está realmente validado (Conectado)?
1. **app_sessions**: El tracker reactivo `SessionProvider` combinado con Zustand de facto asigna un `session_id` persistente y unificado a lo largo del ciclo vital de la App, previniendo recreaciones gracias a flags de inicio semánticos (`hasInitialized`) y verificaciones de Auth activas en efecto.
2. **Endurecimiento Atómico del Base Node**: La migración `20260325000000_extend_insert_signal_event_v14.sql` nativizó todos los metadatos extendidos para que el backend realice inserciones atómicas (`signalWriteService.ts` ya no hace updates silenciosos desincronizados).
3. **VersusModule**: Cierra el ciclo nativo y envía de forma medible `response_time_ms`, `session_id`, `left_entity_id`, `right_entity_id`, etc.

## ¿Qué está parcial?
1. **Torneo / Progresivo**: Su infraestructura (`saveTorneoSignal`) acepta `response_time_ms`, `left_entity_id` y `right_entity_id` provenientes de `VersusGame`. Sin embargo, `sequence_id` y `sequence_order` no son inyectados como IDs UUID trazables aún, dependiendo de `meta.stage`.
2. **Profundidad**: `depthService.ts` se conectó a V14 aceptando `question_id`, `question_version`, y `response_time_ms`. Sin embargo, los componentes de interfaz (como `InsightPack`) no han sido adaptados para cronometrar localmente su respuesta de forma atómica por pregunta.
3. **Actualidad**: `actualidadService.ts` acepta todo el pipeline V14, pero su vista contenedora (`ActualidadHubManager`) inyecta temporalmente `live` (temporal mode) y asume un flujo "fire and forget". Falta cronometrar el input en la visualización por pregunta individual.

## ¿Qué quedó pendiente?
- La inyección de medición (timer) reactiva de UI hacia los constructores de llamadas (payloads) dentro de **Profundidad** y **Actualidad**.

## Recomendación de Cierre Técnico
1. **Implementar Hooks Globales de Tiempo:** Crear un `useInteractionTimer` para incrustar rápidamente `response_time_ms` en las vistas parciales.
2. **Migrar `sequence_id` en Torneos:** Generar un UUID único nativo al iniciar una sesión de torneo para hilar estructuralmente todas las opciones dentro de la BD, reemplazando el reliance parcial a `meta.stage`.
