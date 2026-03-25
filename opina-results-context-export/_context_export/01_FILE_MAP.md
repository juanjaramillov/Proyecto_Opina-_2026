# Mapa de Archivos (Context Export)

Esta carpeta fue generada exportando selectivamente componentes clave para el entorno **Resultados**, **Home**, y **Señales**.

## Estructura Principal
- `_context_export/`: Esta misma carpeta, con resúmenes ejecutivos.
- `screenshots/`: Capturas de Home, Señales y Resultados en Desktop y Mobile.
- `src/App.tsx`: Definición de Rutas Principal. Contiene la estructura general de navegación.
- `src/index.css`: Hoja de estilos globales.
- `tailwind.config.js`: Tokens de diseño y utilidades personalizadas.

## Features
### `src/features/results/` (Página Principal a Rediseñar)
Contiene la lógica y UI del módulo de resultados.
- `pages/Results.tsx`: Entrada principal de la vista Resultados.
- `components/`: Módulos visuales que componen Resultados. Existen subcarpetas legacy (v3 y v4 archivadas) y módulos activos. Los activos parecen ser los ubicados en `v4/` y `components/` directamente.

### `src/features/home/` (Referencia Visual)
Página principal o landing.
- `pages/Home.tsx`: Archivo raíz de Home.
- `sections/`: Diferentes bloques visuales del Home que sientan el tono (ej. InteractiveHeroSection, CommunityPulseSection).

### `src/features/signals/` (Referencia Funcional/Visual)
Corazón de la experiencia de usuario (Radar/Versus).
- `pages/BattlePage.tsx`: Vista dedicada de batalla.
- `components/`: Componentes del versus, insight packs, header, states.

### `src/features/feed/` (Hub de Señales)
- `pages/SignalsHub.tsx`: El hub general donde conviven diferentes dinámicas (Versus, Profundidad, etc). Comparte lenguaje de diseño interactivo.

## Shared System
### `src/components/`
Componentes compartidos (UI system, Layouts).
- `ui/`: Botones, Fallbacks, Esqueletos, Loaders. Define la base visual.
- `layout/`: MainLayout y PageShell. Manejan fondos, constraints de ancho y menús.

### `src/hooks/` y `src/services/`
Lógica reusable y comunicación de datos. Permite entender qué datos se mockean o de dónde se consumen realmente. Utilizado intensamente por Resultados.
