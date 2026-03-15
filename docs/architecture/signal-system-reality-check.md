# Signal System Reality Check
## Estado Real de Integración de Señales por Módulo

Este documento refleja el estado **real** y actual del código fuente respecto a la emisión de señales (`signal_events`) en el repositorio central de Opina+.

### 1. Resumen de Estado de Módulos

| Módulo | Estado Actual Real | Tipo de Escritura | Riesgo Actual | Acción Necesaria (Bloque 2/3) |
|---|---|---|---|---|
| **Versus (Classic)** | 🟢 Operativo Real | Directa (`signalService.saveVersusSignal`) | Muy Bajo | Ninguna urgente. Es el estándar del sistema. |
| **Torneo (Progressive)**| 🟢 Operativo Real | Directa (`signalService.saveTorneoSignal`) | Muy Bajo | Ninguna urgente. Bien mapeado a `progressive`. |
| **Actualidad (News)** | 🟡 Parcial / Desalineado | Iteración sobre `saveSignalEvent` | **ALTO**. Posee una doble problemática: 1) **Bug Técnico**: Pasa la prop `source: 'actualidad'`, la cual no está listada canónicamente en `signalService`, haciendo que la señal caiga por el bloque `else` y se escriba erróneamente documentando module = `versus`. 2) **Bug Semántico Estructural**: No cuenta con contrato nativo diseñado en el Ledger originario para su tipología ("noticia/clúster-polarizante"), lo que a largo plazo exige decidir si readaptamos las tablas de `signal_events` o co-existimos por defecto con la tabla complementaria (doble escritura). | Como baseline de Bloque 2: Corregir urgentemente el Source Mapper para descontaminar tabla de Versus. En Bloque 3: Definir viabilidad nativa. |
| **Depth (Profundidad)** | 🔴 Integración Hackeada | Doble Escritura + Iteración | **ALTO**. No es una integración limpia "que funciona". Depth sufre de una integración apoyada en una **metodología "hack" y frágil**: El contrato base de `insert_signal_event` está excesivamente anclado y restringido mentalmente a _Batallas vs. Opciones_, obligando al código a forzar al ID de la entidad principal como si fuera la Batalla y a la Escala o AnswerValue como si fuera la Opción. Dejar esto así es sacrificar el diseño. Opcionalmente dependiente del `insert_depth_answers` paralelo (`Doble Escritura`). | Debe rediseñarse estructuralmente creando un `insert_depth_signal` semánticamente correcto sin falsificar el param `battle_id`. |
| **Pulse (Tu Pulso)** | 🔴 Solo Documentado | N/A | Bajo (no genera errores de prod pero miente en la doc) | Borrar/archivar documentación vieja que habla de `recordPulseSignalsFromLegacy` ya que no existe en `/src/lib/signals`. |

### 2. Evidencia de Código y Servicios Actuales

El servicio canónico actual es **`src/features/signals/services/signalService.ts`**, el cual invoca el RPC `insert_signal_event` pasando por una bandeja de salida (`flushSignalOutbox`).

- El `signalService` define:
  - `source === 'progressive'` -> `PROGRESSIVE_SIGNAL`
  - `source === 'depth'` -> `DEPTH_SIGNAL`
  - `source === 'news'` -> `CONTEXT_SIGNAL`
  - `source === 'pulse'` -> `PERSONAL_PULSE_SIGNAL`
  - *Fallback default* -> `VERSUS_SIGNAL`

### 3. Vistas y Read Models Ya Existentes
Actualmente el RPC y las vistas más pesadas operan para construir Hubs en tiempo real:
- `get_hub_live_stats_24h`
- `get_hub_signal_timeseries_24h`
- `get_hub_top_now_24h`
- Vistas como `actualidad_stats_view` se siguen utilizando en módulos parciales (como Actualidad) de manera acoplada.

### 4. Brechas y Falsos Positivos en Documentación Previa
- Existen documentos en la carpeta `/docs/architecture/` (`news-signal-integration-status.md`, `depth-signal-...`, `pulse-signal-...`) que referencian servicios transaccionales en la carpeta `src/lib/signals/` (ej. `recordNewsSignalsFromLegacy.ts`). Esa carpeta **hoy no existe (está vacía o eliminada de src)**. Dichos documentos representan una iteración anterior del sistema o una sugerencia no implementada en su totalidad, siendo ahora documentación fantasma que debe ser archivada para no confundir.
