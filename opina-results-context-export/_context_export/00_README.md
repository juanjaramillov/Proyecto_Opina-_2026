# Context Export for Opina+ Resultados Redesign

## Objetivo
Este ZIP contiene todo el contexto visual, estructural y funcional necesario para el rediseño UX/UI de la página **Resultados** de Opina+, incluyendo referencias directas a **Home** y **Señales** para asegurar consistencia visual e iterar sobre patrones de diseño ya establecidos en la plataforma.

## Fecha de Exportación
25 de Marzo de 2026

## Contenido del ZIP
El archivo ha sido organizado para mantener una estructura similar al proyecto original y facilitar el entendimiento de las dependencias:

- `_context_export/`: Documentación y análisis detallado de los componentes de Resultados, referencias de Home y Señales, y el sistema visual.
- `src/`: Carpeta con todos los archivos fuente relevantes (Componentes, Layouts, Features, Servicios, Hooks, etc).
- `screenshots/`: Capturas de pantalla (Desktop y Mobile) del estado actual de Home, Señales y Resultados.
- `tailwind.config.*` / `postcss.config.*`: Configuración global de estilos y sistema de diseño (tokens).

## Qué se ha excluido
Para aligerar el ZIP y mantener el foco, se han excluido:
- La carpeta `node_modules`
- Carpetas de build como `dist` o `.vercel`
- Archivos `.env` y configuraciones privadas
- Features y páginas que no tienen impacto visual ni estructural sobre Home, Señales o Resultados (como el panel admin o B2B si no comparten componentes visuales clave).
