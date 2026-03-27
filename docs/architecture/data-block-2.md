# Bloque 2: Catálogo Maestro, Categorías y Contextos Oficiales

## Objetivo
Fortalecer el rol de `signal_entities` como catálogo único de entidades del proyecto y crear jerarquías para `signal_contexts` definiéndolo como la tabla oficial de temas, sin crear arquitecturas paralelas redundantes.

## Cambios Implementados

### 1. Robustecimiento de Catálogos Existentes
- **`signal_entities`**: Se explicitó la columna `domain` que anteriormente dependía de parsers lógicos pesados.
- **`signal_contexts`**: Transicionado a un modelo jerárquico mediante la columna `parent_context_id`. Añadidas las columnas convencionales `slug`, `display_order` y `display_name`.

### 2. Tablas Puente Generales (Relaciones N:M)
En lugar de depender enteramente de arreglos `jsonb` estáticos propensos a desactualizaciones cruzadas:
- **`entity_category_links`**: Permite asignar una entidad a múltiples categorías empresariales/rubros (con una principal obligatoria).
- **`context_links`**: Conecta un voto de `signal_events` hacia los temas que toca.
- **`entity_context_links`**: Vincula nativamente una entidad con un contexto dado (e.g., *Teletón* - *Marcas Auspiciadoras*).

## Beneficios Futuros
Las tablas puente permiten optimizar profundamente las _views_ y consultas RPC de resultados, además de simplificar los joins para los Reportes Ejecutivos (B2B).
