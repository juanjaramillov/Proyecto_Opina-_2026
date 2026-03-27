# Bloque 1: Sesiones y Comportamiento

## Objetivo
Separar la recolección de eventos de telemetría y navegación de las decisiones reales de los usuarios (señales), mediante estructuras independientes y aditivas.

## Cambios Implementados

### 1. `app_sessions`
Representa de forma granular el inicio y fin de la interacción de un usuario dentro de la plataforma Opina+, registrando propiedades inmutables del dispositivo y contexto general.
- **Campos principales:** `started_at`, `status`, `device_type`, `os`, `platform`.
- **FK:** `user_id` (opcional si es usuario anónimo antes del registro).

### 2. `behavior_events`
Almacena clics, visitas a páginas, aperturas de modales o interacciones ligeras que no califican como un voto o señal real, previniendo el inflado de data en `signal_events`.
- **Campos principales:** `event_type`, `status`, `duration_ms`, `module_type`.
- **Relaciones:** `session_id`, `user_id`, ref simbólica a `entity_id` y `context_id`.

### 3. Fortalecimiento de `signal_events`
Para dar lugar al motor sin romper las funciones actuales de guardado, se han agregado columnas permitiendo una trazabilidad completa de cada voto real. Todo es nullable para convivir con los flows preexistentes.
- **Nuevas Columnas Aditivas:** `event_status`, `origin_element`, `question_id`, `question_version`, `display_order`, `response_time_ms`, etc.

## Riesgos y Mitigaciones
Ninguna columna ha sido alterada o borrada. Los endpoints de inserción del cliente en `signal_events` (_legacy_) seguirán funcionando as-is.
