# Legacy Archive: src_graveyard

## Razón de Existencia
Esta carpeta contiene componentes, hooks y páginas que fueron retiradas del árbol activo del producto (`src/`) durante la limpieza estructural del Bloque 3.

## Por qué sigue aquí
Se retienen de manera transitoria por si se necesita recuperar alguna porción de lógica histórica, referencias a integraciones antiguas (ej. `legacy_bridge`), o consultas analíticas que no hayan sido portadas a los nuevos servicios canónicos.

## Dependencias
NINGUNA de estas piezas debe ser importada por código vivo en la carpeta `src/`. Romper esta regla deshace la categorización arquitectónica.

## Condición de Muerte
Esta carpeta completa puede ser purgada (eliminada del repositorio) una vez que el nuevo motor de señales (Signals Engine Canónico) lleve funcionando en producción sin requerir rollback, o después de un periodo de prudencia definido por el equipo técnico.
