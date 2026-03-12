# Master Entity Catalog

## Objetivo

Definir una capa maestra de entidades para que todas las señales del sistema puedan consolidarse correctamente, aunque provengan de módulos o estructuras legacy distintas.

## Principio

`signal_entities` es el catálogo maestro transversal.
No reemplaza todavía de forma inmediata a los catálogos legacy, pero pasa a ser la referencia unificadora futura del sistema.

## Tipos de entidades

- brand
- company
- product
- service
- institution
- public_figure
- concept
- event

## Tablas de apoyo

### entity_aliases
Permite manejar variantes de nombre, errores comunes, nombres cortos y aliases legacy.

### entity_legacy_mappings
Permite vincular registros actuales del proyecto con una entidad maestra.

### entity_relationships
Permite modelar relaciones como:
- empresa -> marca
- empresa -> servicio
- marca -> producto
- evento -> entidad relacionada

## Reglas operativas

- No hacer merge automático agresivo.
- No asumir que nombres parecidos siempre son la misma entidad.
- El matching puede apoyarse en `normalized_name`, pero la curación final debe ser controlada.
- Los módulos legacy pueden seguir operando mientras exista el mapeo hacia `entity_id`.

## Casos de uso

### Marcas
Netflix, Falabella, BCI, Cruz Verde

### Instituciones
Banco Central, Ministerio de Salud

### Figuras públicas
Presidencia, candidatos, autoridades

### Eventos
Elección presidencial, reforma tributaria, conflicto internacional

### Conceptos
Estrés, felicidad, confianza, bienestar, inflación

## Próximo paso

Construir seeds curados y reglas de mapping para:
- marcas y opciones actuales del producto
- noticias / actualidad
- Tu Pulso
