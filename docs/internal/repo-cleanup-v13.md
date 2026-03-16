# Reporte Interno: Limpieza Real del Repositorio (Bloque 1.1)

**Fecha:** 11 de Marzo de 2026
**Objetivo:** Eliminar drásticamente archivos y carpetas irrelevantes generadas automáticamente o de pruebas, dejando el repositorio listo y liviano para auditar.

## 1. Carpetas Eliminadas de Raíz
Se ha borrado el contenido físico de las siguientes carpetas generadas automáticamente para bajar el peso del ZIP:
- `node_modules/` (miles de archivos borrados directamente del entorno)
- `dist/`
- `__MACOSX/` (y cualquier subdirectorio con este nombre generado por macOS)
- `.vercel/`

## 2. Archivos Eliminados
Se limpiaron los siguientes elementos basura:
- Archivos `.DS_Store` esparcidos por el repo.
- Archivos de entorno local ignorados intencionalmente pero que ensuciaban la exportación: `.env.local` y `.env.production.local`.
- Archivos sueltos de prueba:
  - `test_logo3.ico`
  - `check_topics.ts`
  - `query_templates.ts`

## 3. Archivos Movidos
- Los scripts `read_excel.cjs` y `seed_actualidad.ts` que se encontraban ensuciando la raíz, han sido reubicados a `scripts/debug/` y `scripts/seed/` respectivamente.

## 4. Elementos Conservados Intencionalmente
- Se ha respetado `.gitignore`, y ha sido verificado que incluye las reglas de exclusión perfectas para evitar que los archivos arriba mencionados vuelvan al control de versiones si se usa git.
- Se mantuvieron intactas las carpetas `src/`, `supabase/` y demás partes funcionales.

## Validación
- `node_modules` **NO EXISTE** actualmente en la raíz.
- `dist` **NO EXISTE** actualmente en la raíz.
- `__MACOSX` **NO EXISTE** en el proyecto.

## 5. Actualización Bloque 1 (Saneamiento Estructural Real)
La limpieza manual descrita anteriormente fue reemplazada por un flujo determinístico.
La exportación limpia **nunca se hace manualmente**. El comando oficial pasa a ser `npm run ops:repo-hygiene` y luego `npm run ops:zip-clean`.
Esto asegura invariantes estructurales (ej: los archivos `.env` locales nunca se empaquetan, `archive/` se suprime por defecto).
