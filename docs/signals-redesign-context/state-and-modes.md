# Estados y Modos ("State Machine" de Señales)

Este documento define la base lógica con la que el router interno de la página Señales se comporta y decide qué dibujar. Esta lógica no puede romperse en el rediseño.

## Máquina de "Experiencias" (Modos)
Manejado primariamente por `useExperienceMode.ts`. La macro-url nunca cambia (siempre estás en `/signals`), por lo que la navegación es enteramente virtual.

**Modos Activos Disponibles:**
1. `menu`: El Hub base. Muestra el Radar de Experiencias y el VersusGame genérico de turno principal.
2. `versus`: Módulo profundo solo de Versus.
3. `torneo`: Despliegue de brackets e interfaces de la Liga/Torneo.
4. `profundidad`: Señales extensivas de evaluación a largo aliento.
5. `actualidad`: Hub interactivo de noticias calientes/opinión social rápida.
6. `lugares`: Comparador de recintos y demografía.

**Transición Base:**
El usuario llega en estado inicial (`menu`). Clickea un banner del HubSecondaryTracks que dispara `setMode('actualidad')`. La vista de menú se desmonta instántaneamente de React y monta `ActualidadHubManager.tsx`. Un botón flotante se inyecta por sobre todo diciendo "Volver", cuyo clic despacha `resetToMenu()` -> retorna al estado 'menu'.

## Estado de Sesión en el Default (El Hub)
Mientras el usuario esté en _menu_, interviene una segunda capa de control mediante el hook asíncrono `useHubSession`:

- **Estado 'ACTIVE':** Hay batallas sin votar que el Backend envía; el usuario tiene límite de batería para el día; se renderiza el `VersusGame`.
- **Estado 'COOLDOWN':** El usuario se quedó sin votos del límite diario o ya vació la canasta de batallas pendientes. Se renderiza un placeholder o anuncio especial (`HubCooldownState.tsx`).

Toda UI de rediseño _macro_ que encierre o envuelva este flujo debe lidiar asimétricamente con estos modos.
