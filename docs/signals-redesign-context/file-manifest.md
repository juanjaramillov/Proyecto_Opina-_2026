# Manifiesto de Archivos de Señales

Lista exhaustiva de componentes, _hooks_ y dependencias detectadas en la orquestación actual de la interfaz de Señales.

| Archivo | Rol del Archivo | Criticidad | Impacto |
| :--- | :--- | :--- | :--- |
| `src/features/feed/pages/SignalsHub.tsx` | Enrutador principal y contenedor estructural de la URL `/` (o `/signals`). | **Crítico** | Layout macro, navegación condicional, inyección de props maestro. |
| `src/features/feed/components/HubActiveState.tsx` | Contenedor que empaqueta y renderiza el `VersusGame` durante una sesión estándar. | Importante | Layout de sesión arriba del pliegue. |
| `src/features/feed/components/HubCooldownState.tsx` | Contenedor que despliega estado de espera tras completar el máximo de votos de la sesión. | Secundario | Renderizado intermedio (UI de cooldown). |
| `src/features/feed/components/hub/HubSecondaryTracks.tsx` | Componente "Radar de Experiencias". Despliega el slider con tarjetas para cambiar a otros módulos. | Importante | UI de navegación táctil/horizontal e inyección interactiva. |
| `src/features/feed/components/VersusView.tsx` | Componente orquestador del módulo "Versus especializado". | Importante | Layout de sub-módulo, states, CTAs. |
| `src/features/feed/components/TorneoView.tsx` | Vista del módulo torneo al entrar desde el Radar. | Secundario | Layout esclavo. |
| `src/features/feed/components/ProfundidadView.tsx` | Vista en profundidad cargada desde Radar. | Secundario | Layout esclavo. |
| `src/features/feed/components/LugaresView.tsx` | Módulo de lugares activo. | Secundario | Layout esclavo. |
| `src/features/feed/components/ActualidadHubManager.tsx` | Módulo de actualidad activo. | Secundario | Layout esclavo, CTAs. |
| `src/features/feed/hooks/useExperienceMode.ts` | Hook de estado que cambia dinámicamente el `mode` y afecta qué vista inyecta el `SignalsHub.tsx`. | **Crítico** | Lógica de enrutamiento sin recargas del Hub. |
| `src/features/feed/hooks/useHubSession.ts` | Dispara comprobación contra la BD para discernir si lanzar flujo *activo* o *cooldown*. | **Crítico** | Lógica de barrera de entrada y límite de batallas. |
| `src/store/signalStore.ts` | Almacenamiento global de métricas diarias de sesión (Zustand). | Importante | Datos, tracking UI global. |
| `src/features/signals/components/VersusGame.tsx` | Componente funcional duro de votos. Contiene tarjeta A/B, feedback de insight y avance autómata. | **Crítico** | Lógica y core interactivo más importante del app (El juego principal). |
| `src/features/signals/components/versus/VersusFeedbackOverlay.tsx` | Overlay verde "¡Opinión registrada!" posvoto. | Secundario | Experiencia de usuario, animación y _delay_. |
| `src/features/feed/components/BatchSessionResults.tsx` | El cierre del túnel. Muestra summary en overlay cuando se completa el _batch_. | Importante | Interacciones pos-evaluación. |
