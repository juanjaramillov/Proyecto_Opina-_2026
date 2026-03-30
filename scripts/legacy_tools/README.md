# Herramientas Legadas (Legacy Tools)

**ADVERTENCIA: Las herramientas contenidas en este directorio están obsoletas y desactivadas del flujo operativo principal de Opina+ (V15).**

## ¿Por qué se archivaron?

Historicamente, la gestión de logotipos, metadatos y dominios del catálogo (marcas, lugares, etc.) se realizaba procesando y copiando imágenes localmente (`/public/logos/entities/`) usando estos scripts de Node.js. Esto generaba fricción al requerir procesos manuales, PRs, reconstruir el proyecto para añadir logos y mantenía el catálogo atado al código fuente.

## Nuevo Flujo Operativo

A partir de la Fase 3, Opina+ usa infraestructura genuina para resolver esto en **Caliente (Runtime)**:

1. **Gestión desde Panel Admin**: Los editores ingresan a la app `/admin/entities` para crear o modificar entidades.
2. **Supabase Storage**: Las imágenes y logos se suben instantáneamente al bucket público de Supabase (`entities-media`).
3. **Frontend Desacoplado**: El componente central del motor gamificado (`EntityLogo.tsx`) fue refactorizado. Ahora captura dinámicamente el `logo_path` de la base de datos y lo prioriza sin necesidad de actualizar locales. En caso de fallar o de tratarse de logos viejos, preserva _backwards compatibility_ buscando el slug local.

Este cambio escala mejor la operación, minimiza el tamaño del código fuente (ya no subiremos miles de logos con el tiempo) e independiza a los equipos de producto/contenido de los lanzamientos técnicos.

## Contenido Archivo

- `logos/` (Auto curation, inyección de dominios, conciliación de fallos, priorización por lotes).
- `seed_lugares.ts` (Importador hardcodeado histórico).
- `get_marcas.ts`
- `update-catalog-domains.ts`

Por favor no restaurar su uso directo sin evaluar refactorizarlos hacia Edge Functions o procesos aislados que inserten directo en `entities` con las mismas reglas de validación que el Front Admin.
