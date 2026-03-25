# Sistema Visual y de Diseño

La identidad visual corporativa para el hub de **Home** y **Señales** está condensada en el archivo `tailwind.config.js` y `src/index.css`.

## Tokens Destacados
- **Colores Principales**: Tonos oscuros de fondo definidos en la configuración de Tailwind, probablemente bajo `var(--background)`. Acentos en azules y púrpuras neón que le dan la cualidad inmersiva.
- **Tipografía**: Font family estándar definida en las utilidades base (normalmente Inter, Roboto, o Custom Display Fonts de la marca).
- **Glassmorphism**: Clases como `bg-white/5 backdrop-blur-md` se observan en `src/index.css` o directamente inline en los componentes más nuevos.

## Componentes UI Clave (`src/components/ui/`)
Estos componentes ya implementan los tokens de forma agnóstica:
- Botones (`Button` base o variaciones)
- `FallbackAvatar` (manejo de imagen de marca ausente)
- `StateBlocks` y `Skeleton` (manejo visual de cargas e interfaces asíncronas)
- Contenedores semánticos.

El rediseño de Resultados debe apalancarse **estrictamente** en este set existente de abstracciones. Si un componente de Resultados usa `#ccc` duro, es candidato directo a limpieza y reemplazo por una variable/clase del sistema actual.
