# Legacy to Signal Write Flow

## Objetivo

Conectar módulos legacy del producto al motor unificado de señales sin romper el comportamiento actual.

## Estrategia

1. Mantener escritura legacy a `signal_events` original o la tabla que sea necesaria (`saveSignalEvent`).
2. Agregar escritura adicional hacia el nuevo motor (vía `record_{module}_signal` RPCs) que resuelva master entity_ids y localice/cree `signal_contexts`.
3. Si la escritura principal fue exitosa pero la segunda falla (por entity_ids no resueltos, errores de BD temporales, etc), atrapar el error, loguearlo y no romper el flujo principal (el voto cuenta en la UI).

## Módulos integrados inicialmente

- Versus
- Progresivos

## Reglas implementadas

- No insertar señales con `entity_id` ambiguo o incorrecto (se busca match duro, por ID o por `slug`).
- Resolver contextos de forma trazable usando `resolveSignalContext` (reusa/crea por `legacy_reference_id`).
- Mantener `source_module` y `source_record_id` en todos los payloads.
- Usar funciones SQL oficiales del framework como `record_versus_signal`.

## Flujo en Código

1. UI (`Experience.tsx`) -> Llama `signalService.saveSignalEvent`
2. Si todo bien: try -> `recordVersusSignalFromLegacy(...)`
3. `record[X]SignalFromLegacy`: Busca Contexto y Entidades (Ganador/Perdedor).
4. `rpc('record_[X]_signal')`.

## Próximos módulos sugeridos

- Depth
- News / actualidad
- Tu Pulso
