# Signal Engine Schema

Este documento describe la base inicial del motor de señales de Opina+.

## Objetivo

Permitir que todas las interacciones relevantes del producto puedan almacenarse como señales estructuradas, comparables y explotables.

## Tablas creadas

### signal_types
Catálogo de tipos oficiales de señal.

### entity_types
Catálogo de tipos de entidades evaluables.

### signal_entities
Entidad universal evaluable.
No reemplaza los catálogos actuales del producto; convive con ellos.

### signal_contexts
Contextos donde ocurre una señal:
- versus
- progressive
- depth
- news
- pulse

### verification_levels
Niveles de calidad/verificación del usuario que luego permiten ponderar señales.

### signal_events
Tabla madre del sistema.
Toda interacción futura relevante debería poder terminar representada aquí.

## Principios de diseño

- additive only
- no rompe tablas actuales
- permite convivencia con modelo legacy
- prepara futura consolidación del producto bajo la lógica de señales

## Próximo paso esperado

Conectar progresivamente los módulos actuales del producto para que además de su almacenamiento actual, escriban también en signal_events.
