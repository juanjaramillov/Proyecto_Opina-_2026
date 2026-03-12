 # Depth to Signal Integration Status

## Archivos Integrados Base
- `src/lib/signals/recordDepthSignalsFromLegacy.ts`: Servicio maestro de captura, iteración asíncrona de N respuestas transformadas a variables explícitas SQL, manejados safe.
- `src/features/profundidad/pages/DepthRun.tsx`: Componente de Depth aislado, ahora orquesta interceptando el prop `handleSave`. Transforma a label names antes de derivar.
- `src/features/signals/components/InsightPack.tsx`: Tab de Signals, se anudó la grabación al igual que DepthRun.

## Supuestos
- La homogeneidad descrita en el payload asume que "recomendacion" (o primer loop) será tratada netamente de base como `nps_0_10` independientemente de si el string del Excel legacy dicta otra cosa.
- Reacción al fallo controlada: Ningún fallo detiene el cuestionario y todas las requests se loguean de manera paralela a base de `Promise.allSettled`.
- Las promesas insertadas toman el JSON en formato de `value_numeric`, booleans string literals y options nativos con el tipado extra de backend PostgreSQL.

## Gaps Vigentes
- Se continúan insertando contextos generados sin mapping base formal por ID, por ende si el torneo legacy no existe, un título heurístico se auto-publicará.
- Las entidades maestras continúan dependientes a nombres extraídos de frontend o ID legados.
- Existen componentes pendientes como News / Actualidad en las próximas olas.
