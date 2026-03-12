# Entity Logo UI Pattern

## Objetivo

Unificar la representación visual de entidades dentro de Opina+ usando logos locales o fallback elegante.

## Componentes

- EntityLogo
- EntityBadge

## Fuente de logos

/public/logos/entities/

## Regla principal

No usar APIs externas de logos en runtime.
Toda la UI debe consumir assets locales.

## Fallback

Si no existe logo o falla la carga:
- mostrar inicial principal
- mantener contenedor limpio, consistente y premium

## Rollout inicial

Primer módulo integrado:
- Versus

## Próximos módulos sugeridos

1. Progresivos
2. Resultados / rankings
3. Depth
4. Hub y cards de entidades
