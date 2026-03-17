# QA Mínimo Operativo

## Propósito
Este conjunto reducido de pruebas no busca lograr una cobertura completa ni servir como marco E2E general para UI. Su objetivo es actuar como **red de seguridad para tres flujos críticos estructurales** del sistema que ya han sido parcheados contra problemas severos, garantizando que futuras modificaciones no desarmen los bloqueos de seguridad logrados.

## Qué cubre específicamente
1. **Contrato de Señales Base (`signalService`)**: Valida que envíos desde módulos multi-respuesta tiren error si no traen su `context_id` (pregunta específica), y valida que flujos `battle` mantengan integridad del payload perdonándoles esa exigencia.
2. **Ciclo Multi-Respuesta (`actualidadService`)**: Asegura que el iterador de preguntas asigne `context_id` diferentes y que los errores queden asociados individualmente a la pregunta que falló.
3. **Flujos Versus (`battleService`)**: Asegura testeo de no-regresión para validación de campos opcionales del engine original.
4. **Control de Accesos Front-end (`policyResolver`)**: Ratifica que las compuertas Gate exijan roles de admin/b2b explícitamente y expulsen intrusos.
5. **Autenticación en Edge Functions (`test:auth`)**: Ejecuta un ping real contra los Endpoints Edge en despliegue garantizando que devuelven `401/403` a usuarios nulos o regulares y `200` a admins de sistema con base a JWT. (Bloque 2).

## Cuándo ejecutar
1. **Antes de cualquier despliegue importante a pre-producción o producción.**
2. Siempre que se alteren esquemas de la tabla `signal_events`.
3. Siempre que se modifiquen middlewares o políticas RLS compartidas.

## Comandos
*Test runner unitario local, en memoria (rápido):*
\`\`\`bash
npm run test:run
\`\`\`

*Test runner de integración Auth API (Lento / Efectivo contra BBDD):*
\`\`\`bash
npm run test:auth
\`\`\`

## Dónde agregar pruebas nuevas a futuro
Si un nuevo contrato de API o un flujo canónico de base de datos de alta fricción o de cobro es modificado, se debe incluir **exclusivamente a nivel de servicio** bajo la carpeta `/tests/`. Evita crear pruebas ligadas a componentes DOM de React (`.tsx`) a menos que el render en sí mismo concentre variables críticas (por ej. un widget de cobro Stripe).
