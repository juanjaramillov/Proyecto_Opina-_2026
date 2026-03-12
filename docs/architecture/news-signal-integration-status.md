# News Signal Integration Status

## Archivos Integrados Base
- `src/lib/signals/recordNewsSignalsFromLegacy.ts`: Servicio maestro de captura, iterando por array de respuestas tipadas desde un formulario noticioso.
- `src/features/feed/components/ActualidadHubManager.tsx`: Administrador global de estado de News. Conecta con Supabase original pasándole el bloque `selectedTopicDetail`, habilitando que al success, se dispare inmediatamente las promesas extras hacia el motor de señales general.

## Supuestos
- Se espera que el editor haya configurado un `category` estricto mapeado en `signal_entities` o que el `title` de la noticia pueda deducirse a través de nuestro helper `resolveMasterEntity` como comodín ("Aprobación", "Presidente").
- Los formatos soportados de Scale/Boolean provienen de las flags `answer_type` que los generadores Admin cargaron (`scale_5`, `yes_no`, y fallback en textos directos).

## Gaps Vigentes
- Los News legacy solían ser altamente "estáticos" y libres; el resolver el *entity_id* maestro al vuelo desde strings arbitrarios para vincular un topic noticioso sigue siendo frágil hasta que un redactor los categorice contra el catálogo `signal_entities` de forma explícita en futuras mejoras al CMS general.
- "Has Answered" de la UI sigue ligada a las tablas y views legacy (`topic_answers` y `actualidad_stats_view`), no lee aún desde `signal_events` por rapidez transaccional, aunque se poble el backend con dualidad a modo de semilla contextual.
