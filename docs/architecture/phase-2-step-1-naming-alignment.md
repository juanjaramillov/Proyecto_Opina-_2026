# Fase 2 - Paso 1: Alineación de Naming y Lenguaje Canónico (Opina+ V15)

**Fecha**: 30 de Marzo de 2026
**Objetivo**: Establecer un vocabulario técnico unificado que elimine la semántica heredada (legacy), formalizando y blindando distinciones funcionales reales de las dinámicas del producto (como la diferencia entre `Versus`, `Progressive` y `Tournament`), y priorizando un núcleo orientado a interacciones atómicas ("Signals").

## Resumen de Cambios Estructurales
Se efectuó una purga sistemática de términos en el área central interactiva, la cual rige el `feed` y el `signals engine`.

1. **Desambiguación y Corrección de Mecánicas de Juego** (`src/features/signals/types.ts`):
   - Se revirtió la unificación excesiva que colapsaba la mecánica secuencial (*"ganador sigue en racha"*) bajo el concepto cerrado de `Tournament` (rescatado solo para árboles funcionales).
   - Se renombró la exportación de `Tournament` a `Progressive` para representar la carga y ejecución de un bracket de racha en vivo.
   - Las propiedades controladoras transicionaron a `is_active_progressive` para gobernar las opciones en `BattleOption`.
   - Se mantuvo intacto y canónico el concepto `Battle` como la unidad atómica inalterable.

2. **Propagación en el Ecosistema Frontend**:
   - Refactor estricto de los contratos (`progressiveData`) adaptándolos a TypeScript. Principalmente en:
     - `src/features/signals/components/runner/ProgressiveEmptyState.tsx`
     - `src/features/signals/components/VersusGame.tsx`
     - `src/features/signals/hooks/useVersusGame.ts`
     - `src/features/feed/components/TorneoView.tsx`

3. **Cierre Final de Integridad Arquitectónica (Ajuste B):**
   - **Módulo Runner Reescrito**: La opción ambigua `TorneoRunner.tsx` fue renombrada físicamente y refactorizada bajo **Opción A** a `ProgressiveRunner.tsx` trasladada al directorio `/runner`. Ahora la pieza central de orquestación de racha se adecua canónicamente a la arquitectura real que implementa.
   - **Completitud del Glosario**: Se extendió la huella canónica abarcando fronteras difusas, oficializando la gobernanza del dominio:
     - *Signal/Response/Event*: Refinamiento semántico estricto. **Signal** rige como el acto atómico de UX/Negocio. **Response** se clasifica como Canonical para contextos estructurados (ej. contestaciones en inputs o Profundidad). **Event/SignalEvent** se rescata oficialmente como **Canonical Técnico** para referirse a la unidad inmutable persistida en BD para auditoría y trazabilidad.
     - *Entity/Brand/Subject*: Entity dictamina jerarquía técnica, Brand pasa a legacy dado que no todas las Entidades son comerciales.
     - *Context/Topic*: Context centraliza pulso; Topic purgado a favor de semánticas precisas.
     - *B2B/Intelligence*: B2B namespace en código; Intelligence se eleva a proposición de valor publicitaria de marca hacia afuera.
     - *Publication Modes*: Centralizados en secuencias verdaderas temporales.
   - **Gobernanza de Flags (Progressive vs Tournament)**: 
     - Se documentó estructuralmente que `is_active_progressive` es el flag operativo y activo que vive en Frontend y Read-Models para habilitar instancias en el runner de supervivencia (`ProgressiveRunner`).
     - `is_active_tournament` existe semánticamente en TypeScript y como resguardo futuro, latente a nivel de contrato para llaves y cuadros B2B estáticos, sin mezclarse en la racha de consumo al azar.

4. **Renombrado General y Consolidación Base** (`src/features/signals/types.ts`):
   - `totalVotes` migró definitivamente a `totalSignals`.
   - `myVote` migró definitivamente a `mySignal`.
   - `VoteResult` consolidado y estandarizado como `SignalResult`.

5. **Mapeo y Documentación de Rutas Core** (`src/App.tsx`):
   - **`[CANONICAL]`** Se validó y documentó `/signals` (Signals Hub interactivo).
   - **`[CANONICAL]`** Ruta ancla de submódulos dinámicos se mantiene en `/m/:slug`.
   - **`[LEGACY]`** Visor solitario `/battle/:battleSlug` y ruta `/experience` delimitados sólo a accesos web legacy y deep-links.

6. **Ajuste Documental y de Gobernanza Final**:
   - El archivo `docs/architecture/canonical-system-language.md` ahora incluye explícitamente tabuladores de las dimensiones 1 a la 5 con estados claros.

7. **Validación de Integridad**:
   - Se continuó validando mediante compilación estricta (`npm run typecheck`), demostrando consistentemente `0 errors`, probando que el front-end, los componentes, las variables de estado y la estructura de archivos (`ProgressiveRunner.tsx`) obedecen al 100% de coherencia.

## Conclusión y Cierre Definitivo
Con esta última vuelta de precisión arquitectónica se da por **FINALIZADO Y CERRADO EL PASO 1**. El sistema cuenta ahora con una definición rigurosa que prohíbe fundir mecánicas interactivas dispares y blinda el Glosario de Datos, estableciendo `is_active_progressive` sobre `ProgressiveRunner` como mecánica de supervivencia asíncrona, desterrando de la Base de Código (UI aparte) un "Torneo" ficticio, preparando el entorno a salvo para las lecturas limpias B2B a abordar en el siguiente nivel de la remediación.
