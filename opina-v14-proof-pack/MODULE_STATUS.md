# Status por Módulo

- **Versus = conectado**
  (Envía nativamente `response_time_ms`, entidades competidoras, contexto de victoria y tiempo medido reactivo a la base de datos).

- **Torneo = conectado**
  (Se colgaron hooks para rutear las variables idénticas arrojadas por `TorneoRunner` directamente al RPC de Base de Datos).

- **Profundidad = parcial**
  (El pipeline RPC y el `depthService` soportan recibir el payload enriquecido { `response_time_ms`, `question_version` } pero las interfaces visuales subyacentes como `InsightPack` aún no activan un timer ni leen la metadata versionada).

- **Actualidad = parcial**
  (El pipeline RPC y `actualidadService` aceptan la versión y orígenes, pero `ActualidadHubManager` ejecuta respuestas en lote sin cronometrar tiempos analíticos individuales de cada pregunta).
