# Gobernanza de Partición de Componentes

## Principio General
La interfaz de Opina+ debe mantenerse simple, gobernable y reutilizable. Un componente frontend debe coordinar qué se muestra y cómo reacciona, pero no debe convertirse en un sumidero donde se mezcle diseño complejo (SVG inline), mapeo intensivo de datos espurios, y estado complejo.

## ¿Cuándo partir un componente visual?
1. **Líneas de Código**: Si supera las ~250-300 líneas y la mayoría es JSX puro (como un `ActualidadTopicsGrid` o un `LiveTrendsSection`), debe extraerse el diseño atómico de sus "tarjetas" a subcomponentes hijos.
2. **Helpers y Constantes Nativas**: Si un componente depende fuertemente de mocks pesados (arrays estáticos grandes) o helpers complejos de renderizado condicional (ej. `toneClasses`), estos deben irse a un archivo `.data.ts` o `.helpers.ts` colindante.
3. **Micro-Components Locales**: Componentes internos definidos en el mismo archivo (`function MiBadge() { ... }`) que ocupan pantalla o complejidad, deben salir a su propio archivo `MiBadge.tsx` cerca de su contenedor principal si su uso asume más de 25 líneas.
4. **Mix de Responsabilidades**: Si un componente evalúa el estado inicial, renderiza el _Loading State_, renderiza el _Empty State_, e itera sobre _N_ nodos complejos inflando _inline_ estilos enormes para un card individual, hay que partirlo. Para estados vacíos y carga, utilícese siempre la **UI Foundation** oficial (`<EmptyState>`, `<SectionShell>`, etc).

## ¿Qué NO queremos particionar?
1. **No sobre-abstraer**: No crear archivos para botones o textos genéricos si la *UI Foundation* ya tiene primitivos, o si el JSX ocupa 3 líneas y su contexto no será reutilizado.
2. **No crear carpetas globales `utils/` sin control**: Si el helper solo sirve para `HubSecondaryTracks`, debe vivir junto a `HubSecondaryTracks` no en `src/utils/hub/tracks`. Cohesión espacial.

## Adopción de UI Foundation
En todo archivo refactorizado, sustituir los `div` de fallback, errores o skeletons artesanales por sus análogos oficiales si ya existen (`SectionShell`, `StatTile`, `EmptyState`, `FilterPill`).
