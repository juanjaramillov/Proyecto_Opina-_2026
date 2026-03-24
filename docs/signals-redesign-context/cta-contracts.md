# Contratos de CTAs (Call to Actions)

Para garantizar que el rediseño de Señales conserve toda la funcionalidad del producto, este documento lista los CTAs principales, la función que disparan y qué grado de libertad existe sobre ellos.

| Texto/Elemento Actual | Componente Origen | Función/Acción Ejecutada | Requisito | Cambio de Copy | Cambio de Handler |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Opción A / Opción B** | `VersusGame.tsx` | `onVote(optionId)` | **Obligatorio** | Variable según batalla | **INMUTABLE** |
| **"Saltar"** (o ícono de _skip_) | `VersusGame.tsx` | `onSkip()` | **Obligatorio** | Libre (por texto o ícono) | **INMUTABLE** |
| **Tarjetas del Radar** (ej. "Torneos", "Actualidad") | `HubSecondaryTracks.tsx` | `setMode(item.mode)` | **Obligatorio** | A lineamientos editoriales | **INMUTABLE** |
| **"< Volver al Hub"** | `SignalsHub.tsx` (y módulos esclavos) | `resetToMenu()` | **Obligatorio** | Libre (texto/flecha cruzada) | **INMUTABLE** |
| **"Intentar de nuevo"** | Error Boundaries (`PageState`) | `window.location.reload()` | Dependiente de error | Libre | **INMUTABLE** |
| **"Volver al inicio"** | Empty States (`PageState`) | `navigate("/")` | Dependiente de vacío | Libre | **INMUTABLE** |

## Recomendaciones y Reglas para el Rediseñador
1. Todo CTA listado como **Obligatorio** debe estar presente visualmente en el rediseño sin importar cómo se pinte (ya sea un botón grande, un flotante, un swipe a la derecha, etc.).
2. Los handlers catalogados como **INMUTABLES** no pueden renombrarse, ni se les puede alterar los parámetros que esperan (por ejemplo, `onVote(id)` siempre necesita el `id`).
3. Al rediseñar las "cards" de votación, asegúrese de agregar interactividad (hitbox amplia) para disparar el voto en el teléfono móvil sin frustración técnica.
