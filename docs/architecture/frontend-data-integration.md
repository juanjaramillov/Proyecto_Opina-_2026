# Integración Frontend - Arquitectura de Datos Opina+ V14

## Objetivos Generales
Este documento explica la integración en el ciclo de vida del Frontend de React de la nueva base de datos y esquema de analítica (V14), garantizando:
1. **Cero impacto en flujos actuales**: No se alteran los RPCs (`saveVersusSignal`, etc.), ni se interrumpe la experiencia y conexión en base de datos.
2. **Reversibilidad y compatibilidad**: Todos los datos que requiere el nuevo modelo se recolectan asíncronamente como enriquecimiento sin bloquear el main thread ni las mutaciones previas.
3. **Escalabilidad de tracking**: Persistencia de sesiones multiplataforma y recolección implícita de tiempo/navegación a nivel aplicación.

---

## 1. Persistencia de Sesión (`app_sessions`)
- **Implementación**: Se creó `SessionProvider.tsx` envuelto en `App.tsx` que es el responsable de interceptar si existe una sesión para el usuario (`profile.id`) conectado.
- **Flujo**: 
  - Al cargar la app, se detecta de la cabecera `navigator` el OS, Device, Platform y Path Inicial.
  - Se guarda el ID insertado en Supabase en el State global de Zustand (`sessionStore.ts`).
  - Las acciones posteriores consultan a `sessionStore` para adjuntar qué sesión ejecutó un evento de negocio (e.g. Voto).

## 2. Tracking Analítico (`behavior_events`)
- **Implementación**: Se aisló la lógica analítica de sistema ("El usuario hizo X pero no votó") en el módulo `behaviorService.ts`.
- **Integraciones Clave**:
  - `useExperienceMode`: Se introdujo un useEffect que captura cada vez que el usuario navega o abre un nuevo "Módulo" principal (`Versus`, `Actualidad`, `Torneo`, `Profundidad`) o el `SignalsHub`, enviando un evento de comportamiento tipo `module_open` adjuntando el módulo.

## 3. Enriquecimiento Post-Evento (`signal_events`)
El esfuerzo principal de V14 requería captar metadatos que antes no existían en las tablas: `left_entity_id`, `right_entity_id` y `response_time_ms`.
- **Implementación (El asíncrono silenciador)**: En `signalWriteService.ts` se modificó el comportamiento de la señal central (e.g. _Versus_). En su flujo, sigue enviando los mismos parámetros requeridos a la función plpgsql (RPC) y espera el ID.
- Una vez recibido el UUID de la tabla `signal_events` por la RPC, el frontend lanza en background una instrucción **`UPDATE` directa de Supabase** inyectando de forma *fire and forget* los metadatos de V14 correspondientes (Como Response Time, Extra Entities).

## 4. Captura de Tiempo Dinámico de Lectura / Reacción (`responseTimeMs`)
- Dentro del hook core de juego cruzado `useVersusGame.ts`, se creó un `Timestamp` inicial reactivo. Cada vez que visualizamos una nueva batalla de "Versus", se guarda la hora Unix.
- Al emitir el voto (disparar `handleSelect`), calculamos `Date.now() - timestampInicial` para capturar el tiempo fisiológico de respuesta del humano en milisegundos y lo enviamos empaquetado como dato transitorio al `signalWriteService`.
