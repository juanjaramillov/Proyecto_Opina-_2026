# Referencias Funcionales y Visuales de Señales

La experiencia de **Señales** (*Radar de Señales* y el módulo Versus) ha sido rediseñada recientemente, estableciendo el estándar más alto de UI interactivo en la aplicación.

## Partes Relevantes del Código
- **`src/features/feed/pages/SignalsHub.tsx`**: Contenedor tipo grid que integra el contenido.
- **`src/features/signals/components/VersusGame.tsx`**: El módulo central interactivo. Destaca por las animaciones y la experiencia inmersiva.
- **`src/features/signals/components/InsightPack.tsx`**: Elementos complementarios que entregan contexto.
- **`src/features/feed/components/TorneoView.tsx` y otros**: Módulos secundarios del ecosistema de feed.

## Patrones Visuales e Interacción
- **Cards de Alto Impacto**: Presentación limpia, imágenes o logos de marcas (ej: `EntityLogo.tsx`) centradas, que reaccionan al **hover**.
- **Esquema de Color Semántico**: Uso del color corporativo primario para acentos, fondos muy oscuros o blur. 
- **Microinteracciones**: Al votar en el versus se despliegan marcadores y overlay de feedback (`VersusFeedbackOverlay.tsx`). 

## Ideas para Resultados
La página Resultados debe heredar este sentido de inmersión y modernidad. Los contenedores de datos de resultados (ej. pulso ejecutivo o detalle por marca) deben sentirse como la continuación natural de un voto en Señales.
