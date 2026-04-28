# Roadmap Sugerido de Saneamiento y Preparación: Opina+ V15

A continuación, se propone un plan táctico de remediación secuenciado para llevar a Opina+ V15 hacia su grado B2B corporativo y preparar el producto para su expansión formal sin riesgos comerciales. **Importante: No iniciar Fases 2 y 3 sin antes completar la contención de los elementos de la Fase 1.**

---

## FASE 1: Contención de Riesgos Críticos (Integridad B2B)
**Objetivo:** Erradicar cualquier residuo de datos sintéticos, mocks o lógica de "prototipo en demo" de las rutas críticas. Garantizar que lo que se muestra es 100% auditable contra la base de datos real.

- [ ] **Desmontar Generadores "Live":** Refactorizar `src/features/signals/pages/BattlePage.tsx` (Eliminar `activeStats` basado en hashes). Proveer telemetría real de un endpoint Supabase RPC cacheado o desactivar los contadores en vivo.
- [ ] **Limpiar Código Muerto en Front:** Eliminar rastros de archivos `.env.vercel.tmp` o credenciales inyectadas, dejando sólamente `import.meta.env` con claves no expuestas.
- [ ] **Remover Filtros B2C Mocks:** Garantizar que los componentes de resultados y "Tu Pulso" solo dibujan señales confirmadas en `signal_events`.
- [ ] **Gatekeeping Estricto:** Re-auditar todos los Supabase RLS (Row Level Security) Policies sobre `app_events` y `antifraud_flags` para que una inyección cliente B2C nunca manipule contadores vitales B2B.

---

## FASE 2: Estabilidad Arquitectónica y Consistencia UI 
**Objetivo:** Unificar el *Design System*, estabilizar rutas y asentar una terminología formal ("Ubiquitous Language") que alinee Frontend y Backend.

- [ ] **Glosario y Rutas:** Estandarizar la definición de *Battles, Modules, y Signals*. Reflejar este cambio en URLs visibles, variables y types (`src/types`).
- [ ] **Poda del Tailwind Config:** Eliminar al menos 15-20 claves reasignadas sin uso de `tailwind.config.js`. Usar una paleta semántica estricta (`brand`, `accent`, `surface`, `ink`) en lugar de amalgamas redundantes (ej: `background-b2c`, `primary-b2c`).
- [ ] **Limpieza de Scripts Root:** Reubicar scripts manuales de operaciones (`ops:fetch-logos`, `logos:apply-*`) a una carpeta de utilidades blindada, centralizando el CLI o moviendo lógica cruda a Supabase Edge Functions.
- [ ] **Revisión de Pesos / Bundle Size:** Verificar en TS-Config / Vite-Config el cargado diferido (Lazy Loading) de librerías como `chart.js` o bloques masivos B2B de inteligencia.

---

## FASE 3: Escalabilidad, Sofisticación y Mantenibilidad
**Objetivo:** Aumentar automatización, incorporar Cypress/Playwright para tests E2E y mejorar rendimiento.

- [ ] **Test E2E Automatizado:** Configurar Playwright / Cypress. Cubrir estrictamente el "Happy Path B2C" de jugar un módulo Progresivo, votar en 4 Batallas y culminar en onboarding o Resultados.
- [ ] **Optimización de Render en Listas y Animaciones:** Ajustar Framer Motion. Para catálogos grandes B2C y B2B, utilizar *Virtualización de Listas* (p. ej: `@tanstack/react-virtual`) para evitar degradación DOM en dispositivos modestos.
- [ ] **Admin Automations:** Convertir el engorroso proceso de subida manual de Entidades y "Logos" de las marcas en un Formulario/Admin-CMS que suba a `Supabase Storage` con compresión on-the-fly, atado a los modelos del Catálogo, desconectándolo del ciclo de deployment (`git push`).

---

## FASE 4: Preparación Comercial, Piloto y Crecimiento
**Objetivo:** Pulir y robustecer paneles finales para inversionistas, clientes corporativos y crecimiento puro.

- [ ] **Onboarding B2C Optimizado:** Despliegue paulatino y telemetría A/B del wizard de bienvenida (demografía) vs. fricción de completitud con puntaje de "Lealtad / Opinascore".
- [ ] **Panel B2B Enterprise-Ready:** Desplegar capas de inteligencia y reportes listos para consumir por terceros `/b2b/reports` con vistas encriptadas para PDF o webviews.
- [ ] **Documentación "White Label":** Si se planean licencias o derivaciones, encapsular lógicas genéricas en `src/shared/sdk` reduciendo acoplamientos a código monolítico actual.
- [ ] **Auditoría de Penetración (Pen-Testing):** Evaluación de seguridad independiente previo a inyecciones de tráfico masivo para asegurar la protección contra bots votadores (Re-visitar módulo antifraude interno).

---

### *Próximo Paso Inmediato Sugerido*
Aprobar la ejecución focalizada de la **FASE 1**. Iniciar con la creación de los tickets críticos y el borrado quirúrgico del mock de muestreo vivo de la UI para presentar la aplicación al 100% sobre Supabase transaccional puro.
