# Status de Integración de Señales (Doble Escritura)

Este reporte detalla el estado actual de la integración de módulos legacy hacia el nuevo motor de `public.signal_events` (y `signal_entities`).

## Archivos Integrados Base
- `src/lib/signals/resolveMasterEntity.ts`: Lógica de resolución de `entity_id`. Se apoya fuertemente en match de `slug` actual.
- `src/lib/signals/resolveSignalContext.ts`: Re-uso o upsert de `signal_contexts` para los torneos y versus generados previamente.
- `src/lib/signals/recordLegacySignals.ts`: Punto de inyección que toma payloads legacy (ej: `selected_option_name`) e intenta enviarlos con `rpc('record_versus_signal')`.
- `src/features/feed/pages/Experience.tsx`: Modificado para llamar a las funciones de doble escritura en modo fire-and-forget luego de completar el save legacy.

## Módulos con Doble Escritura Activa
- **Versus (Classic)** ✅
- **Progresivos (Tournaments)** ✅

## Gaps de Mapping Pendientes
- `entity_legacy_mappings` aún no está integrado dinámicamente en el runtime de `resolveMasterEntity.ts` porque la tabla y el catálogo maestro se están recién definiendo/curando. Se dejó un `TODO: Implementar búsqueda` en el código.
- En caso de que el `slug` del JSON legacy no calce exactamente con una entrada en `signal_entities.slug`, el voto se omite silenciosamente para ensuciar `signal_events`.

## Supuestos Tomados
- La doble escritura no interfiere con UX. Si falla, el usuario de todas maneras recibe el toast "Señal guardada" y la UI avanza.
- No migración histórica por ahora: Esto aplica *únicamente* a votos nuevos capturados desde este momento en adelante.

## Pendientes Sugeridos
- `Depth` (Insights Pack)
- `News / Actualidad`
- `Tu Pulso`
