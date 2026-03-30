# Hallazgos Detallados de Auditoría: Opina+ V15

Este reporte aborda en formato de hallazgos las debilidades reales del proyecto divididas por pilar crítico. Se ordenan según prioridad y muestran evidencia empírica encontrada en los componentes y estructura.

---

## 1. Producto y Analítica (El Motor B2B)

### 🔴 HALLAZGO CRÍTICO A1: Simulación de Data Activa y Muestreo (B2C)
- **Pilar Afectado:** Analítica B2B / Credibilidad del Producto.
- **Severidad:** Crítica.
- **Problema:** En el componente `BattlePage.tsx` persiste el modo prototipo visual. En las líneas 92 a 102, el hook `activeStats` genera *stats vitales simulados dinámicamente* sobre la marcha (nº de participantes y votos). Usa el título hash del slug e inyecta hasta un piso de 4500 señales fijas más ruidos de modulación para generar números falsos.
- **Por qué importa:** Si un proveedor B2B descubre este código, asume que TODA la analítica "en tiempo real" de la empresa es mentira/simulada, lo que anula instantáneamente rondas de inversión o comercialización corporativa y expone al proyecto legalmente (Data Governance).
- **Zonas afectadas:** `src/features/signals/pages/BattlePage.tsx`
- **Recomendación:** *Borrar la inyección sintética hoy.* Sustituir inmediatamente por una subscripción Realtime Supabase de contadores en el Edge, o presentar un número vacío/discreto hasta tener la feature real.

### 🟡 HALLAZGO B1: Ambigüedad Nomenclatural (Ubiquitous Language)
- **Pilar Afectado:** Arquitectura del Sistema / Producto.
- **Severidad:** Media a Alta (genera fricción cognitiva en crecimiento).
- **Problema:** Múltiples nombres y dominios se superponen. Las interfaces B2C hablan de "Evaluaciones" o "Señales", los endpoints de red usan "Battles" o "Versus", `src/features/feed` la llama "SignalsHub" pero la ruta es `/signals`.
- **Zonas afectadas:** `src/App.tsx`, backend.
- **Por qué importa:** Con un equipo escalando y APIs expuestas al B2B, utilizar "Battles", "Torneo", "Versus", "Module" para refererirse al mismo modelo de `signal_events` diluye la arquitectura y rompe la capacidad de generalizar "Módulos de opinión".
- **Recomendación:** Formalizar un Glosario canónico (p.ej: Todo Input atómico B2C es un 'Signal', todo Hub es un 'Module', el formato gamificado Biseccional es un 'Versus'). Refactorizar rutas y tablas hacia esa convención.

---

## 2. UX/UI y Diseño Frontend

### 🟡 HALLAZGO C1: Design System Híbrido y Tokens Degradados
- **Pilar Afectado:** Frontend y UI/UX.
- **Severidad:** Alta.
- **Problema:** El fichero `tailwind.config.js` está parcheado e inflado por la incapacidad de separar variables Material Design antiguas vs un Sistema Premium B2C nuevo. Existen docenas de variables CSS con sufijo `-b2c` introducidas artificialmente (`background-b2c`, `primary-b2c`, `surface-b2c`) mientras se guardan `surface`, `primary-fixed`, `inverse-surface` provenientes de una paleta no estructurada y duplicada por compatibilidad de código pre-existente.
- **Por qué importa:** Mantener componentes o crear nuevos modulos o una versión White-Label requerirá descifrar ese `tailwind.config.js` y el uso descontrolado de `primary-50` vs `primary-b2c` llevará a roturas estéticas o componentes monstruosos.
- **Zonas afectadas:** `tailwind.config.js`, `src/index.css`.
- **Recomendación:** Destruir todos los tokens sobrantes de previas iteraciones prototípicas y centralizar una paleta estricta y predecible (Brand/Base/Surface). Limpiar `index.css`.

### 🟡 HALLAZGO C2: Over-fetching vs Lazy Load en Animaciones y Charts
- **Pilar Afectado:** Performance y UX Mobile.
- **Severidad:** Media.
- **Problema:** Los hooks de `Results` cargan toda la matriz de "Bloques de Resultados" con Skeletons condicionados por `!snapshot`, pero los componentes gráficos `chart.js` o bloques elaborados de datos están dentro de cada "Block" respectivo. Si el bundle inicial asimila todas las versiones B2C de gráficos en memoria, el tiempo de "interactive" bajará drásticamente.
- **Zonas Afectadas:** `src/features/results/pages/Results.tsx`
- **Recomendación:** Utilizar React.lazy() o dinámicas de `Suspense` dentro del cuerpo profundo de los resultados para que un chart no bloquee el TTI y `Framer-Motion` tenga aire para arrancar suave la app inicial.

---

## 3. Arquitectura y Mantenibilidad del Repositorio

### 🟡 HALLAZGO D1: Scripts Ad-Hoc en Root (Pivote Operativo Manual)
- **Pilar Afectado:** Operación y Repo Hygiene.
- **Severidad:** Media.
- **Problema:** Se evidencia una cantidad preocupante de scripts de soporte de datos en bash y Node en el `package.json` (`ops:fetch-logos`, `logos:apply-high-priority`, etc).
- **Por qué importa:** Confirma que el onboarding de entidades evaluables y la carga de imágenes (`logos`), un proceso troncal y cotidiano de la app, carece de automatización dentro del dashboard o producto. Esto hace a la empresa rehén del programador cada vez que se quiere lanzar una nueva encuesta de "marcas".
- **Recomendación:** Empaquetar estas lógicas en cronjobs de back-end o exponerlos internamente en el área de `src/features/admin` unificada en el portal.

### 🟡 HALLAZGO D2: Tests de Integración Fantasma o Aislados
- **Pilar Afectado:** Testing.
- **Severidad:** Alta (riesgos de regresión).
- **Problema:** Solo hay un script manual `scripts/tests/auth.integration.ts` o llamadas en bash a smoke test. Todo el motor lúdico y motor recolector de `signal_events` o `useVersusGame` vive al margen de una automatización de Cypress/Playwright o RLT estructurado.
- **Zonas Afectadas:** Entirety of Front-End.
- **Recomendación:** Instaurar pruebas End-to-End obligatorias solo de 3 flujos, los críticos: *(1) Iniciar Señal, (2) Contestar 3 Versus, (3) Ver Modulo Resultados B2B.* Garantizando que viajan los UUIDs precisos a base de datos.`

---

## Quick Wins (10 Mejoras de Alto Impacto - Bajo Esfuerzo)

1. **Purga Inmediata del Hash de BattlePage.tsx:** Eliminar la simulación del activeStats y dejar stats fijos conservadores o solo porcentaje visual de avance. (Esfuerzo: 5 mins).
2. **Limpieza del package.json:** Mover todos los scripts ops a un README subfolder u orquestarlos vía `Makefile` para evitar contaminación en el deploy de Vercel/Node.
3. **Consolidar Tokens Tailwind:** Unificar la paleta de `-b2c` y `primitive` buscando borrar lo que sobrevive sin uso.
4. **Protección de Assets en DB:** Auditar Storage de Supabase y eliminar descargas públicas a buckets sensitivos. 
5. **Pre-Fetching de Skeletons:** En `Results.tsx`, animar entrada del Skeleton para disimular lentitud local.
6. **Lazy Load de Gráficos:** Separar `react-chartjs-2` a un Chunk aparte en `vite.config.ts`.
7. **Homologar Términos en RUTAS:** Estandarizar la sintaxis interna en el enrutamiento (ej: /m -> /module -> /signals).
8. **Sanear Imports de React:** Identificar y eliminar dead-code importations que estén pesando usando el auto-fix de ES-Lint, particularmente en Hooks V14 viejos. 
9. **Eliminar variables `.env` zombies:** Archivos como `.env.vercel.tmp` o copias basura deben incluirse en `.gitignore`.
10. **Avisos Progresivos de Mobile:** Modificar el `MotionConfig` de Framer Motion e inyectar un control para leer la pref. de media-queries si la batería es baja o es low-end device para `reducedMotion`.
