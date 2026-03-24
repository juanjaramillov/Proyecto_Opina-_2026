# Árbol de Renderizado de Señales (Render Tree)

Mapeo de la estructura nativa jerárquica cuando se dibuja la página y sus nodos más importantes en el flujo estándar.

```mermaid
graph TD;
    A[SignalsHub.tsx] -->|mode='menu'| B[Hub Container: Layout General]
    
    %% Ramificación del Estado en Menú
    B --> C{useHubSession === 'ACTIVE'?}
    
    C -- YES --> D[HubActiveState.tsx]
    D --> E[VersusGame.tsx]
    E --> F[VersusHeader]
    E --> G[VersusLoadingState / VersusFeedbackOverlay]
    E --> H[Card A / Card B Options]
    
    C -- NO --> I[HubCooldownState.tsx]
    
    %% Render del Radar Global
    B --> J[Contenedor Hub-Tracks]
    J --> K[HubSecondaryTracks.tsx]
    K --> L[Módulo: Torneos Preview]
    K --> M[Módulo: Actualidad Preview]
    K --> N[Módulo: Lugares Preview]
    K --> O[Módulo: Profundidad Preview]

    %% Vistas Dinámicas Esclavas (al hacer clic en una tarjeta del radar)
    A -->|mode='torneo'| P[TorneoView.tsx]
    A -->|mode='actualidad'| Q[ActualidadHubManager.tsx]
    A -->|mode='lugares'| R[LugaresView.tsx]
    A -->|mode='profundidad'| S[ProfundidadView.tsx]
    A -->|mode='versus'| T[VersusView.tsx]
    
    %% Condición Global para todas las vistas
    B -.- U(BatchSessionResults Overlay Modal)
    P -.- U
    T -.- U
    S -.- U
```

### Explicación Estructural
El rediseño estructural asume que:
1. Las cabeceras como `PageHeader` inyectadas dinámicamente a nivel superior de "Señales" controlan lo que ve el usuario. 
2. Si un usuario se encuentra en `mode='menu'`, el árbol cargará secuencialmente `HubActiveState` en la parte superior del flujo y luego en `Hub-Tracks` desplegará el _Radar de Experiencias_. Ambas secciones comparten la misma pantalla vertical (`min-h-[100vh]`).
3. Modificar el árbol CSS a "Flex row" cambiará cómo el HubActiveState convive con HubSecondaryTracks, pero no destruirá la reactividad subyacente de cada módulo por separado.
