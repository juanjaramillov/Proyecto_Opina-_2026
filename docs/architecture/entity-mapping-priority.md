# Entity Mapping Priority

## Objetivo

Definir el orden recomendado para mapear entidades desde los catálogos legacy a `signal_entities` utilizando `entity_legacy_mappings`.

## Prioridades

1. **Marcas Principales y Competidores (Opciones)**
   Identificar y vincular las opciones / marcas más iteradas en los Versus o encuestas a sus nodos semánticos en `signal_entities`.

2. **Categorías Analíticas (Tu Pulso / Actualidad)**
   Mapear las áreas principales del sistema `Tu Pulso` hacia `CONCEPT` o `EVENT`, evitando discrepancias de nombre y normalizando los términos más evaluados.

3. **Resto de Módulos (Catálogos Legacy)**
   Mapeo bajo demanda de otros elementos y features residuales, utilizando la tabla `entity_legacy_mappings` con estado `pending_review` o auto-aprobación en caso de alto índice de confianza en matchers (`confidence_score > 0.95`).

## Reglas de seguridad
- No realizar migración destructiva en origen. Mapear de forma puramente aditiva usando `entity_legacy_mappings`.
- Realizar los merges progresivamente, testando por componentes sin interrumpir servicios actuales en producción.
