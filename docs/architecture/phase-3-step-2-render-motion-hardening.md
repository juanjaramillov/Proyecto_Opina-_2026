# Fase 3 / Paso 2: Render & Motion Hardening (Marzo 2026)

Este documento registra los ajustes realizados en el Frontend de Opina+ (V15) para estabilizar la tasa de cuadros (FPS), reducir el impacto en GPU/CPU por animaciones pesadas y erradicar re-renders innecesarios durante el flujo de gamificación, asegurando una experiencia premium en dispositivos móviles sin sacrificar exactitud funcional.

## 1. Validación de la Optimización de Render en el Motor Core (`VersusGame` & `OptionCard`)

### Memoización y Estrategia de Contrato de `OptionCard.tsx`
Se detectó que el prop pasivo inyectado en *VersusGame* (`onClick={(e) => handleVote(a.id, e)}`) disparaba renderizados innecesarios del Virtual DOM bajo iteraciones complejas, incluso cuando las Opciones A/B no tenían mutaciones en pantalla. Si bien el primer acercamiento fue usar `JSON.stringify` sobre la prop completa de la opción, esto fue fiscalizado y rechazado por su sobrecosto futuro en V8 (complejidad de recolección de basura, costo en serialización cíclica, etc).

- **Estrategia Final Elegida (Comparator Explícito o Reducción Funcional):** Evaluando que `OptionCard` actúa como un canvas integral para una "entidad de marca" o "recurso conceptual", este componente consume y requiere casi la totalidad del objeto relacional (IDs, labels, imágenes URL, iconos, colores, configuraciones y KPIs). Reestructurar el componente para recibir 11 props separadas en lugar de la cápsula semántica `option: BattleOption` habría roto su utilidad portable en la arquitectura.
Por lo tanto, se optó por una **estrategia de Comparator Explícito Acotado**. Se reemplazó el ineficiente `JSON.stringify` por una función externa predecible, determinística y basada estrictamente en punteros escalares.

- **Props Exactos Consumidos y Validados:**
  La nueva función `areOptionCardPropsEqual` únicamente verifica identidades (`===`) en primitivos y estados semánticos del Layout interactivo. Ignora las *clausuras anónimas* (`onClick`) o fechas irrelevantes nativas (`created_at`, si existieran), concentrándose exclusivamente en:
  1. Identificadores de Marca: `option.id`, `option.type`, `option.brand_domain`.
  2. Recursos Gráficos: `label`, `icon`, `image_url` / `imageUrl`, `bgColor`, `imageFit`, `imageClassName`.
  3. Estados Virtuales Activos: `stats?.onlineCount`, `stats?.totalAnswers`, `isSelected`, `showResult`, `showPercentage`, `percent`, `layout`, y el banderín de `isChampion`.
  4. Contextos In-flight (Framer Momentum y Theme): El theme y progresión de porcentaje.

- **Ausencia garantizada de Stale Closures en `onClick` (Prueba Estructural):**
  Excluir `onClick` del *comparator* eleva un riesgo clásico de React: ¿podría el usuario hacer clic sobre una función congelada / *stale*? 
  El análisis y la prueba del contrato demuestran que **no es posible en esta arquitectura**. Cuando `handleVote` (en `VersusGame`) cambia su referencia (por ejemplo, porque `isCurrentlySubmitting` pasa a `true`), paralelamente se altera la propiedad `disabled={isCurrentlySubmitting}` inyectada en `OptionCard`. 
  Como `disabled` **sí** forma parte estricta del Custom Comparator, la re-creación de esa prop visual desencadena un *re-render* forzoso, el cual permite que la card capte y guarde orgánicamente la nueva versión de `onClick`. Están acoplados semánticamente en el motor.

- **Prueba Obligatoria de Contrato de Stale UI (`tests/components/OptionCard.memo.test.tsx`):**
  Se estableció un banco de pruebas que documenta con rigurosidad el uso deseado vs comportamientos maliciosos:
  1. **NO Re-renderiza:** Modificar el `onClick` o insertar props nulas (`created_at`) anula e interrumpe cualquier repintado inútil y ahorra GPU.
  2. **SÍ Re-renderiza (Visuales o Stats):** Cambios directos de UI (`isSelected`) o la métrica afilada en `stats.onlineCount` sí rompen el memo.
  3. **Seguridad Anti-Stale (Prueba Conductual DOM):** Se sumó una prueba de integración (UI wrapper real con `Testing Library`) que en lugar de evaluar sólo la ecuación lógica, evalúa **el comportamiento de clicks reales en el Virtual DOM** a través de repintados sucesivos. Simula pasar de Estado A (esperando decisión) -> Estado B (submitting bloqueado donde inyecta el nuevo Handler) -> Estado C (liberado en el test con `disabled=false`); concluyendo al disparar `.click()` que la tarjeta **ejecuta exitosamente el Handler Fresco C** y extingue contundentemente cualquier clausura zombie de pasadas anteriores.

### Hoisting de State Hooks
Reacomodamos estructuralmente los hooks volátiles (`handleVote` y dependencias de UI). Si un Torneo finalizaba antes de que se regeneren dependencias por un mal lugar topológico o early return condicional, existía el riesgo de corromper la cola reactiva (regla dorada de React). La estabilización de este código fuente en la raíz principal de `VersusGame.tsx` previene "ghost states" para iteraciones de fallos transitorios.

## 2. Reducción en Carga de GPU y "Motion Debloat"

Se abordó al sistema Framer Motion para asegurar que su impacto en la GPU no frene iteraciones pesadas de `selected` en dispositivos menos robustos.
- **Qué se simplificó realmente:** El renderizador de salidas en *VersusGame* utilizaba filtros combinados (`blur(4px)` e instancias `blur-[2px]`) que resultaban excesivos de procesar simultáneamente con transformaciones de escala. En móviles, los *filters* compuestos disparan ciclos *repaints* muy caros al salir de contexto. Estos fueron eliminados rotundamente de las propiedades envolventes salientes de *Framer Motion* (`exit={{ filter: "blur(4px)" }}`) y reemplazados en los un-selects descartados por bajadas puras de `opacity-30` (o al 50% según Layout originario). Las caídas y distancias ya no hacen "blurring focus" sino fade transparente.
- **Qué se mantuvo o redujo fuera de alcance (Reduced Motion):** No se afectaron interactivades principales como transiciones dinámicas (ubicación del layout `type: "spring"`), expansiones de la Winner Card (Champions) ni el balance lateral. De momento, no existe un bypass programado dentro de un Context o variable local globalizada para detectar CSS `prefers-reduced-motion` originario de SO de accesibilidad. Ha quedado programado para una fase transversal futura por fuera de este ciclo particular cerrado.

## 3. Conclusión Transaccional

**Estado de Finalización:** Tras un pase de auditoría completo y reconfirmar el render de las dependencias (`npm run build` // `vitest run tests/...`), un test Unitario del Custom Comparator fiscalizado bajo Vitest sin fallos, y los tests manuales / E2E de Playwright íntegros logrando finalizar votaciones:
✔️ **El Paso 2 de la Fase 3 se declara formalmente CERRADO y con el Motion/Render estable, seguro y determinístico.**
