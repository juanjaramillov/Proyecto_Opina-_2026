# OPINA+ — MARCO MAESTRO DE DISEÑO, UX/UI Y SISTEMA VISUAL
Versión 1.1 (actualizado 2026-04-28 — paleta migrada a `brand-*` por DEBT-009; invariante de fondo blanco aclarado).
Ámbito: todo desarrollo frontend, diseño de interfaces, componentes React, Tailwind CSS e interactividad.

OBJETIVO
Asegurar la consistencia visual, la jerarquía, el uso correcto de la paleta de colores corporativa y mantener un estándar de producto digital Premium (claro, limpio y funcional).

------------------------------------------------
1. PALETA DE COLORES CORPORATIVA
------------------------------------------------

El color principal de Opina+ es el Azul Primario (`brand-500` a `brand-900` en Tailwind, `#2563EB` en hex).
El color secundario y de acento positivo es el Esmeralda/Teal (`accent-500`, `#10B981` en hex).

REGLAS DE COLOR:
- **SIEMPRE** usar la paleta `brand-*` para botones principales, enlaces activos, highlights de marca y elementos de interacción principal. La paleta vieja `primary-*` fue migrada en DEBT-009; cualquier uso superviviente debe corregirse.
- **SIEMPRE** usar `accent-*` para CTAs positivos, validación de participación y indicadores de éxito.
- **SIEMPRE** usar tokens semánticos (`danger-*`, `warning-*`) para errores y avisos. Nunca colores hardcoded para esos casos.
- **NUNCA** usar colores genéricos o fuera de marca (`cyan`, `blue` genérico de Tailwind, `indigo`, `violet`, `purple`, `sky`, `teal`, `lime`, `amber`, `pink`) para elementos estructurales o decorativos.
- Fondos de página y tarjetas: **fondo blanco SIEMPRE** (invariante de diseño). Usar `bg-white` para tarjetas y `bg-slate-50` para el fondo base de la aplicación. **No existe Dark Mode global** — el invariante actual del producto exige fondo claro en todas las páginas (`project_opina_design_invariants`).
- Excepción acotada: fragmentos puntuales con fondo oscuro (`bg-slate-900`) están permitidos solo para Hero sections internas o tarjetas decorativas dentro de una página de fondo blanco. Nunca como fondo de página completa.
- Textos: Usar `text-slate-900` para títulos principales, `text-slate-600` para descripciones y `text-slate-400` para microcopy secundario.

------------------------------------------------
2. NEUTRALIDAD Y PRESENTACIÓN DE MARCAS (LOGOS)
------------------------------------------------

Opina+ es un árbitro neutral. El trato visual a las marcas evaluadas debe ser equitativo.

REGLAS DE LOGOS:
- **SIEMPRE** utilizar el componente unificado `<BrandLogo />`.
- **NUNCA** usar etiquetas `<img />` directamente para renderizar logos de entidades o marcas en el código fuente.
- Los logos deben adaptarse dinámicamente según su contexto (tamaño relativo al módulo/tarjeta).
- **Proporciones:** Los logos NUNCA deben deformarse (estirarse o aplastarse) ni recortarse de manera que se pierda su legibilidad original. Utilizar `object-contain` estricto en el componente centralizado.
- Ninguna marca debe destacar visualmente sobre otra en listados o grillas por medio de fondos de colores saturados. Mantener fondos neutros (blancos o transparentes) detrás de los logos.

------------------------------------------------
3. DISEÑO LIMPIO Y EXPERIENCIA PREMIUM (UX/UI)
------------------------------------------------

- **Jerarquía Visual:** Mantener un balance claro. Un solo H1 por página. El llamado a la acción (CTA) debe ser el elemento con mayor peso visual en la vista.
- **Espaciados consistentes:** Usar la escala de Tailwind de forma consistente (ej. `p-6`, `gap-4`, `mb-8`). Tarjetas importantes deben respirar (alto padding).
- **Ausencia de "Flashes":** Prevenir parpadeos (flashes) de UI durante la carga de datos. Utilizar siempre `SkeletonModuleCard` o estados de carga (`PageState`) que mantengan la estructura de la página antes de que lleguen los datos.
- **Estados Vacíos (Empty States):** Los estados vacíos no deben ser "callejones sin salida". Deben funcionar como "Unlocking Blocks" (Bloques de desbloqueo), explicando de manera premium y limpia el valor de la función y ofreciendo un claro botón de acción para interactuar.

------------------------------------------------
4. ANIMACIONES
------------------------------------------------

- Usar `framer-motion` para micro-interacciones (hover, tap) y transiciones de entrada (fade-in, slide-up).
- Las animaciones deben ser sutiles (`duration: 0.3` a `0.5`, `easeOut` o primavera suave).
- Evitar animaciones exageradas, rebotantes extremas o lentas que entorpezcan la rapidez de la lectura de datos.
