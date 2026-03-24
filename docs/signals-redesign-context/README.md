# Contexto Técnico: Rediseño de Señales

Este directorio contiene el mapa técnico, restricciones y copias de seguridad de la página "Señales" (Radar de Experiencias) de Opina+ V13. Su objetivo es proporcionar una referencia segura para acometer un rediseño UI extenso sin romper contratos de funcionalidad.

## Resumen del Ecosistema "Señales"
El punto de entrada es `SignalsHub.tsx`. Funciona como un orquestador o "enrutador interno" (sin cambiar URL en su mayoría) que alterna qué vista principal cargar usando un estado global de "modo" (`useExperienceMode`). Inicialmente, todas las visitas entran en el modo `"menu"`.

En este modo principal, ocurren decisiones críticas basadas en la evaluación del motor:
- **¿El usuario tiene una sesión de batch de señales activa?** Si sí, carga `HubActiveState` que monta las tarjetas de versus o la interfaz que corresponda.
- **¿Ya terminó o está en enfriamiento?** Despliega `HubCooldownState`.
- Debajo del área de sesión (estado activo/cooldown), se apila geográficamente el **Radar de Experiencias** (`HubSecondaryTracks.tsx`). Sus tarjetas funcionan como enlaces (CTAs condicionales) que inyectan otros módulos especiales, modificando el state principal (modo `"torneo"`, `"actualidad"`, etc.).

## ¿Qué es Puramente Visual? (Libertad alta de rediseño)
- Estructura de _grid_, contenedores horizontales y espaciados generales.
- Animaciones CSS de entrada (e.g. `animate-in fade-in zoom-in-95 duration-500`).
- Tipografía (`text-ink`, `text-primary`), backgrounds y uso del sistema _Glassmorphism_ (`bg-white/90 backdrop-blur-md`).
- Los adornos visuales del `HubSecondaryTracks` (los preview inyectados pueden reemplazarse sin afectar data real en vista `"menu"`).
- _Look and feel_ de estados de error / vacíos, pero manteniendo el CTA de salida (`volver al inicio`).

## ¿Qué es Funcionalmente Sensible? (No romper - Riesgo Alto)
- Inyecciones y comprobaciones de perfil: `if (profile && !profile.isProfileComplete...) return null;`
- El pase de propiedades como `battles`, `onBatchComplete`, `onBack` a los diferentes módulos. Modificar estas pasarelas romperá el store local y el tracking analítico.
- El hook `useHubSession()` define si se debe renderizar el VersusGame principal de la grilla menú, es asíncrono y dependiente.
- Los CTAs "Duro", es decir, botones con eventos inyectados como `onClick={resetToMenu}` que destruyen el sub-modo actual.

El rediseño puede cambiar drásticamente el layout, sin embargo, el motor de estado y renderización condicional (los `if (mode === '...')`) de `SignalsHub.tsx` debe conservarse estrictamente.
