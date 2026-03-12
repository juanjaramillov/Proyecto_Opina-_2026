# Catalog Curation Rules

## Objetivo

Convertir el Excel actual del catálogo de Opina+ en una base maestra curada y utilizable para signal_entities.

## Reglas principales

- El Excel del usuario es la base oficial inicial.
- No todo lo que venga en el Excel debe asumirse perfecto.
- Se curan nombres, slugs, codes y dominios.
- Los dominios solo se completan cuando existe alta confianza.
- Si no existe certeza, el dominio queda vacío.
- No hacer merges agresivos de registros ambiguos.
- El catálogo maestro convivirá inicialmente con los catálogos legacy.

## entity_type por defecto

La gran mayoría de opciones deben tratarse inicialmente como BRAND.
Solo cambiar a COMPANY, SERVICE, PRODUCT o INSTITUTION cuando sea muy evidente.

## Duplicados

Los duplicados evidentes pueden consolidarse con trazabilidad.
Los ambiguos deben quedar marcados para revisión manual.

## Estado de curación

- curated
- auto_completed
- needs_review
