# Reporte Interno: Organización de Scripts (Bloque 1.2)

**Fecha:** 11 de Marzo de 2026
**Objetivo:** Establecer un orden canónico y definitivo para la carpeta operativa `/scripts` y purgar todos los scripts sueltos, malubicados o redundantes.

## 1. Estructura Definida
La carpeta de scripts ahora se restringe rigurosamente a estas cuatro (4) carpetas únicas. Ningún archivo debe existir suelto en `scripts/`:
- **`ops/`**: Procesos de mantenimiento, saneamiento de BDD, y recálculos funcionales.
- **`seed/`**: Autogeneración de batallas iniciales, noticias de ejemplo, u operaciones equivalentes de inserción pesada.
- **`debug/`**: Diagnósticos de estado (cron, Whatsapp checks, email tests, etc).
- **`catalog/`**: Modificadores del catálogo de dominios y marcas base.

## 2. Movimientos Ejecutados
Los scripts sueltos detectados previamente o malcategorizados fueron relocalizados:
- `seed_actualidad.ts` -> Movido a `scripts/seed/`
- `seed_versus_battles.ts` -> Movido a `scripts/seed/`
- `generate_all_versus.ts` -> Movido a `scripts/seed/`
- `clean_publish_topics.ts` -> Movido a `scripts/ops/`
- `read_excel.cjs` -> Movido a `scripts/debug/`  (usado para debug/parsing manual)

## 3. Eliminación de Duplicados y Basura
- **`generate_all_ai_versus.ts`**: Eliminado. Era un duplicado obsoleto frente a `generate_all_versus.ts`. La lógica real de generación AI hoy vive en Supabase con `versus-bot`.
- **`test_*2.ts`**: (ej. `test_count2.ts`, `test_webhook_status2.ts`, `test_languages2.ts`, `test_edge_function2.ts`) Eliminados por ser copias temporales y exactas con leves modificaciones que generan ruido técnico.

## 4. Validación Final
La carpeta `scripts/` cuenta estrictamente con estas subcarpetas: `catalog`, `debug`, `ops`, `seed`. No hay archivos `.ts`, `.mjs`, o `.sh` colgando directamente en la raíz de la carpeta scripts ni de la raíz del proyecto.
