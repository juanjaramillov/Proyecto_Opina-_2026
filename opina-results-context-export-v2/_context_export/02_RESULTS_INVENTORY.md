# Inventario de Resultados (Corregido)

La vista **Resultados** actual expone métricas y consensos de los usuarios. Aquí se mapean exclusivamente las dependencias activas comprobadas por código.

## Dependencias Principales Activas
### Entrada
- **`src/features/results/pages/Results.tsx`**: Contenedor principal de la página. Utiliza un fondo blanco (`bg-white`) general, y apila secciones de datos.
- **`src/features/results/hooks/useResultsExperience.ts`**: El controlador de estado que obtiene el snapshot de datos.
- **`src/read-models/b2c/hub-types.ts`**: Define `MasterHubSnapshot`, el contrato principal de datos de la página.

### Componentes Activos de Resultados (Carpeta `v4`)
La arquitectura limpia de `Results.tsx` invoca los siguientes bloques vigentes:
- **`ResultsHeroDynamic.tsx`**: Encabezado masivo y dinámico (fondo blanco, blobs sutiles detrás).
- **`ResultsExecutivePulse.tsx`**: Panel analítico superior.
- **`ResultsFeaturedXRay.tsx`**: Radiografía de métricas.
- **Bloques Modulares (`v4/modules/`)**:
  - `VersusInsightBlock.tsx`, `TorneoInsightBlock.tsx`, `ProfundidadInsightBlock.tsx`, `ActualidadInsightBlock.tsx`, `LugaresInsightBlock.tsx`.
- **`ResultsContextualWall.tsx` y `ResultsWowClosing.tsx`**: Elementos complementarios en el cierre de página.
- **`FilterBar.tsx`**: Barra "sticky" superior para filtrar por módulos y períodos.

## Categorización de Archivos
- **Activos**: Todo el contenido de `src/features/results/pages/` y `src/features/results/components/v4/` (excepto `.archive`).
- **Legacy / Archivados**:
  - Carpetas `.archive/` dentro de `v4/`.
  - La carpeta completa `v3/` representa iteraciones viejas que no son invocadas en Producción pero se conservan como referencia histórica.

## Observaciones Factuales
- El layout general de Resultados es de fondo **blanco**.
- Se implementan múltiples "blobs" (manchas de color con `blur`) como decoración de fondo muy sutil (`bg-[#10B981]/10`, etc.).
- La carga de datos ("snapshot") depende del estado global autenticado.
