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

Actualmente, la página de Resultados consume una única fuente de verdad ficticia (`results-fictional-provider`). Esto unifica la experiencia visual, previene la mezcla con datos reales incompletos y ofrece un **Demo Mode exclusivo para admin** que permite transicionar entre perfiles (Explorador, Consistente, Divergente, Intenso). Los usuarios base ven un escenario fijo consolidado. La ingesta de datos reales queda postergada y la UI opera como un contenedor estructural puro (sin lógica de lectura cruzada).
