# Bloque 3: Preguntas, Noticias y Snapshots

## Objetivo
Congelar la experiencia de presentación (WYSIWYG) frente al usuario para no invalidar datos si una misma entidad o contexto cambia con el tiempo. Establecer motores de preguntas reutilizables.

## Cambios Implementados

### 1. Sistema de Cuestionarios
- **`question_catalog`**: Repositorio maestro inmutable de preguntas. Soporta versionado manual (columna `version`).
- **`question_set_items`**: Ordena secuencias (`set_code`) para dictar cómo se formulan baterías de preguntas de profundidad o encuestas transversales.

### 2. Evidencia Congelada (Snapshots)
- **`content_snapshots`**: Asegura la fidelidad periodística o temática de lo que el usuario vio al emitir una señal. Guarda réplicas hardcodeadas de `title`, `source`, `url` en el instante del consumo (especialmente útil en Módulo de Actualidad).
- **Relaciones con Noticias (`news_articles`)**: Se implementaron puentes de `news_entity_links` y `news_context_links` para no acoplar semánticamente la noticia a una sola marca o categoría en `jsonb`.

## Notas de Integración Frontend
El módulo Actualidad debe, al registrar en `signal_events`, primero persistir la instancia en `content_snapshots` y pasar a `signal_events` el UUID retornado en `content_snapshot_id`. Esto evitará discrepancias analíticas cuando la fuente se corrompa a futuro.
