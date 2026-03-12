# Entity Logo System

## Objetivo

Descargar y almacenar localmente logos SVG para las entidades del catálogo maestro curado.

## Fuente de entrada

El sistema usa como base:

/docs/catalog/master-entity-catalog-curated.csv

## Prioridad de búsqueda

1. SimpleIcons
2. Brandfetch (solo como fallback y solo si existe dominio)

## Carpeta de salida

/public/logos/entities/

## Convención

Cada archivo debe usar el mismo valor de entity_slug:

Ejemplo:

- entity_slug: netflix
- archivo: /public/logos/entities/netflix.svg

## Reglas

- No usar APIs de logos en runtime del frontend.
- Los logos deben quedar almacenados localmente.
- Si no se encuentra logo, no inventarlo.
- Los casos faltantes deben quedar registrados en un reporte.

## Reporte

Después de correr el script, debe generarse:

/docs/catalog/logo-fetch-report.csv

con columnas:

- entity_slug
- entity_name
- domain
- status
- source
- notes
