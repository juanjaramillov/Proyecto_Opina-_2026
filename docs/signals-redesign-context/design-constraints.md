# Restricciones de Diseño Transversales

A la hora de rediseñar las interfaces del Hub de Señales, tómese en cuenta las siguientes advertencias de arquitectura CSS y dependencias estructurales a nivel proyecto.

### 1. Sistema de "Snapping" en el Radar
Actualmente, `HubSecondaryTracks.tsx` usa el sistema nativo de scroll CSS de Tailwind:
- `overflow-x-auto snap-x snap-mandatory flex-nowrap`.
- Para esconder la barra de desplazamiento se inyectó una clase custom `.hide-scrollbar` en `index.css`.
- **Regla:** Si se desea reemplazar este _slider_, puede hacerse mediante cualquier librería moderna de React u otro carrusel puro siempre y cuando renderice limpiamente los botones (CTAs) definidos en los contratos.

### 2. Alturas Dinámicas y Viewports (vh)
- La página maestra `SignalsHub.tsx` depende de cálculos como `min-h-[calc(100vh-80px)]` para obligar al footer a estar abajo y para mantener el estado de sesión visible.
- El diseño del bloque superior (`HubActiveState`) y el bloque inferior (`Radar`) compiten por el vertical real estate de la pantalla. Un rediseño debe pensar en el "Fold" (la línea de corte de la pantalla al cargar) para que el radar demuestre que existe contenido inferior a menos que se posicione distinto.

### 3. Glassmorphism e Identidad de Opina+
- Se ha invertido trabajo fuerte implementando modales con _blur_ (`backdrop-blur-md bg-white/90`).
- Si se alteran a colores sólidos, es totalmente válido. Sin embargo, el rediseñador debe verificar que no existan conflictos de _Z-Index_: el _VersusFeedbackOverlay_ usa `z-[100]`, al igual que el botón de volver atrás de ciertos sub-módulos. Romper esta escalera provocará fallos fatales de interfaz.

### 4. Animaciones Temporizadas (Timeouts críticos)
- El overlay que dice "¡Opinión registrada!" es un insight esclavo con una barrera temporal auto-calculada de entre 2 a 4 segundos. En el rediseño, las transiciones de CSS (por ejemplo, fadeout) no deben estar asincronizadas con esta constante del motor de React en VersusGame.
