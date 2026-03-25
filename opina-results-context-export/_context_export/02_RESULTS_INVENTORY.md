# Inventario de Resultados

La vista **Resultados** actual se armó mediante una iteración progresiva de componentes de alto impacto informativo, pero que visualmente podrían estar desalineados respecto al nuevo diseño de Home y Señales.

## Dependencias Principales Activas
### Entrada
- **`src/features/results/pages/Results.tsx`**: Contenedor principal de la página.

### Componentes de Resultados
- **`src/features/results/components/v4/ResultsHeroDynamic.tsx`**: Hero superior que expone las métricas ejecutivas. Actualmente usa una estética mixta.
- **`src/features/results/components/ResultsInsightCarousel.tsx`**: Carrusel de insights.
- **Bloques Visuales de Datos**:
  - `ResultsPulse.tsx`
  - `MomentumBar.tsx`
  - `TensionRing.tsx`
  - Componentes en `v4/modules/*`: `ProfundidadInsightBlock.tsx`, `ActualidadInsightBlock.tsx`, `LugaresInsightBlock.tsx`, `VersusInsightBlock.tsx`. Estos arman los datos por tipo de dinámica.

## Observaciones Factuales del Estado Actual
- **Layout y Contención**: El diseño tiende a estar centrado o en formato listado (dashboard) y no aprovecha los fondos con 'glassmorphism' o la estructura de alto-contraste tipo "editorial" que rige en Home y Señales.
- **Componentes Repetidos/Legacy**: Existen archivos `.archive` o versiones `v3` y `v4` que documentan iteraciones previas del módulo B2C y el muro contextual.
- **Datos Reales vs Simulados**: Muchos módulos (`getCuratedMasterHubSnapshot.ts`) inyectan un snapshot mockeado o datos temporales para estabilizar la vista en lo que la red se conecta al Supabase.

El objetivo del futuro rediseño será transformar esto en algo que impacte visualmente y parezca Premium, siguiendo los patrones definidos en `src/features/signals` y `src/features/home`.
