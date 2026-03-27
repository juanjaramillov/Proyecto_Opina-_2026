# Resumen de Rediseño de la Arquitectura de Datos (V14)

Como parte de la actualización técnica para Opina+, se implementó una estrategia en **tres bloques incrementales**. Todos los cambios fueron garantizados mediante consultas SQL puramente aditivas, sin disrupción de las APIs actuales.

## 1. Tabla de Creaciones y Cambios

### Tablas Nuevas Creadas
- `app_sessions` (Telemetría / Tracking analítico)
- `behavior_events` (Comportamientos pre-señal)
- `entity_category_links` (Taxonomía marcas)
- `context_links` (Taxonomía señales)
- `entity_context_links` (Taxonomía cruzada)
- `question_catalog` (Motor de encuestas profundas)
- `question_set_items` (Constructor de flujos de preguntas)
- `content_snapshots` (Notariado visual de módulos transitorios como Actualidad)
- `news_entity_links` / `news_context_links` (Tags en noticias)

### Tablas Fortalecidas
- **`signal_events`**: `event_status`, `origin_element`, `question_id`, `question_version`, `display_order`, `response_time_ms`, `sequence_id`, `sequence_order`, `content_snapshot_id`, `left_entity_id`, `right_entity_id`, `selected_entity_id`, `interaction_outcome`.
- **`signal_entities`**: `domain`.
- **`signal_contexts`**: `parent_context_id`, `slug`, `display_order`, `display_name`.

## 2. Riesgos de Compatibilidad Detectados y Resueltos
1. **Relaciones Estrictas vs Flexibles**: Muchos `user_id` e identificadores interactúan entre mundos migrados. Se evitó establecer constraints de clave foránea destructivos (ej. FK obligatorio a `users`) dado que ciertas áreas del código guardan referencias parciales (anon_ids vs user_ids).
2. **Duplicidad Conceptual (`option_id` vs `selected_entity_id`)**: Se estableció convivir temporalmente con ambas lógicas de guardado. Las vistas Materializadas o RPCs podrán migrar cuando el frontend las adopte explícitamente.

## 3. Estado de la Integración Frontend
- **Listo para conectar**: Frontend puede empezar a emitir mutaciones a `app_sessions` en el `_app`/`main.tsx` o en el `<AuthProvider>`.
- **Por implementar en Frontend**: Al reescribir hooks como `useVersusGame`, la base de datos ya soporta campos como `left_entity_id`, `right_entity_id`, `response_time_ms`.
- **Intacto**: La capa actual de _SignalWriteService_ escribiendo a `signal_events` no fallará al desconocer estas tablas, ya que todo sigue soportando valores nulos.

## 4. Siguientes Pasos (Recomendados)
1. **Paso 1**: Enviar la migración a Base de Datos de pre-producción (`supabase db push`) y compilar.
2. **Paso 2**: Implementar la generación de `app_sessions` desde el Onboarding Tracker actual.
3. **Paso 3**: Reescribir progresivamente `signal_events` payload mapping para incluir el *status*, *tiempo de respuesta*, y *opciones mostradas* (Ver Versus).
