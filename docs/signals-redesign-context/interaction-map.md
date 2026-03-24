# Mapa de Interacciones

Mapeo exacto entre las acciones físicas del usuario (clics, swipes, hovers) y la lógica subyacente en el código. Estrictamente prohibitivo desconectar estos _Event Listeners_ o callbacks.

## 1. Hub de Señales: Menú Principal
*   **Elemento Trigger:** Inicialización automática.
    *   **Handler:** `useExperienceMode()` establece `mode='menu'` y comprueba limitantes a través de `useHubSession()`.
    *   **Cambio:** Componentes renderizan. Pasa prop dinámica de batallas activas de BD a `VersusGame`.
*   **Elemento Trigger:** Clic en botón de límite excedido ("Intentar de nuevo" en errores de carga).
    *   **Handler:** `window.location.reload()`.

## 2. Componente Versus (VersusGame.tsx)
*   **Elemento Trigger:** Clic principal en la "Card A" o "Card B".
    *   **Handler:** `onVote(selectedId)`.
    *   **Cambio Visual:** Aparece `VersusFeedbackOverlay` (Insight) por ~4 segundos en modo overlay oscuro.
    *   **Cambio en Memoria:** Variable de batallas restantes disminuye, progreso del _batch_ aumenta.
*   **Elemento Trigger:** Clic en "Saltar Batalla".
    *   **Handler:** `onSkip()`.
    *   **Cambio Visual:** Desplazamiento animado del array de elementos al próximo desafío sin abrir _overlay de insight_.

## 3. Radar de Experiencias (HubSecondaryTracks.tsx)
*   **Elemento Trigger:** Scroll X manual dentro de la caja flexible `.snap-mandatory`.
    *   **Handler:** Render nativo y auto-snap de CSS. Sin manipulación React.
*   **Elemento Trigger:** _Hover_ en tarjetas de Radar.
    *   **Handler:** Selectores de utilidades CSS Hover (`hover:shadow-2xl hover:scale-[1.02]`).
    *   **Cambio de UI:** Inyecta colores `toneClasses` estáticos basados en Tailwind a los bloques internos.
*   **Elemento Trigger:** Clic contundente en Card de Radar (ej. "Torneos").
    *   **Handler:** `setMode(item.mode)`.
    *   **Vista Siguiente:** Destruye jerarquía "Menú". SignalsHub detiene inyección del Radar y cambia layout para ocupar el 100% de la pantalla con `TorneoView.tsx`.

## 4. Retorno de Interacción (Volver al Menú Principal)
*   **Elemento Trigger:** Clic en `<button> Volver al Hub </button>` flotante de los sub-módulos.
    *   **Handler:** `resetToMenu()`.
    *   **Cambio:** SignalsHub reinyecta el árbol macro nativo volviendo a pintar el Radar y el Versus inicial.

## Riesgos y Consideraciones
- Si el rediseño encapsula el componente `VersusGame` dentro de un carrusel 3D horizontal o layout drásticamente encajonado, los tiempos de "espera" automáticos del insight de 4 segundos (`VersusFeedbackOverlay`) y las animaciones de salida asíncronas seguirán ocurriendo. Por lo que debe proveer un contenedor `relative` para que esos overlays no rompan los _zIndex_ globales.
