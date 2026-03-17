# Results vs Intelligence Read Models

## Objetivo

Separar la capa de lectura user-facing de la capa de lectura B2B / intelligence.

## Resultados

Debe consumir lecturas parciales, amigables y limitadas:
- rankings simples
- share visible
- evolución básica
- comparación con otros
- tendencias visibles

## Inteligencia

Puede consumir lecturas más profundas:
- segmentación
- series históricas
- cruces demográficos
- cambios por contexto
- detalle por atributo/pregunta

## Regla central

Resultados e Inteligencia pueden compartir base agregada, pero no deben exponer el mismo nivel de detalle ni la misma profundidad analítica.

## Arquitectura Ficticia de Resultados (V13)

Actualmente, la página de **Resultados B2C** consume directamente una fuente de verdad **determinista y curada** (`getCuratedMasterHubSnapshot`) en lugar de construir con base en la lectura fragmentada o incipiente real (`userMasterResultsReadModel`). 
Esto permite ofrecer sistemáticamente una experiencia premium "completa", mostrar insights ficticios balanceados al perfil del usuario, e independizar el aspecto estructural B2C visual sin afectar a la lectura B2B ni inventar fallbacks intermedios ambiguos. Módulo, demografía y filtros son 100% deterministas en torno a este baseline plausible.
