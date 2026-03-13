# Política de Observabilidad y Errores de Opina+

Este documento resume la taxonomía oficial de dominios y severidades utilizada para la gestión de logs, monitoreo y control de errores en Opina+. Esta estandarización permite auditar comportamientos clave, detectar silencios en la UI y escalar alertas operativas sin agregar ruido.

## 1. Dominios de Logs (LogDomain)

El campo `domain` categoriza el área funcional del evento o error. Los dominios estandarizados en `src/lib/logger.ts` son:

| Dominio | Descripción | Ejemplo de Origen |
|---------|-------------|-------------------|
| `auth` | Todo evento o error relacionado con sesión de usuario, login y perfil. | `AuthContext`, `authService` |
| `access_policy` | Reglas de acceso, portones B2B y restricciones a nivel módulo. | `Gate`, `accessGate` |
| `signal_write` | Emisión y guardado de señales (votos de Actualidad, Torneos). | `TorneoRunner`, `ActualidadTopicView` |
| `sync_outbox` | Actividad y errores de la cola offline/sync hacia la DB. | `signalOutbox` |
| `actualidad_editorial` | Flujos de backoffice de Actualidad y consulta editorial. | `useActualidadEditor`, `AdminActualidad` |
| `admin_actions` | Cualquier otra vista o servicio operacional en `/admin`. | `AdminAntifraud`, `adminInvitesService` |
| `b2b_intelligence` | Hub B2B, Benchmark y descarga de leads. | `B2BLeadForm`, `metricsService` |
| `network_api` | Interacciones crudas o errores base de Supabase. | `supabaseClient` (interceptors) |
| `platform_core` | Elementos estructurales base como Feedback y Notificaciones nativas. | `FeedbackFab`, `notifyService` |
| `unexpected_ui_state` | Crashes de React y UI sin resolver, capturados globalmente. | `GlobalErrorBoundary` |

## 2. Severidades (LogSeverity)

El campo `severity` dictamina qué acción es requerida:

- `info`: Traza de negocio (ej., sincronización de colas, éxito). No requieren acción humana.
- `warning`: Problemas no bloqueantes y recuperables (ej., intento de reintento).
- `recoverable_error`: Fallos que bloquean una operación única pero donde el usuario puede reintentar (ej., red desconectada).
- `blocking_error`: Fallo de sistema donde el flujo se interrumpió y no puede sanar localmente.
- `critical_integrity_error`: Fugas de B2B, corrupción de datos, fraude obvio. Requiere alerta a on-call.

## 3. Estados Operativos (LogState)

El estado `state` comunica la intención o cierre:
- `pending`: Transacción en curso (sirve para trazar cuellos de botella).
- `retrying`: El sistema detectó un fallo y está operando un reintento.
- `confirmed`: Éxito operacional clave.
- `failed`: La transacción falló definitivamente en el alcance del usuario.
- `blocked`: El sistema rechazó la acción por política (ej., `policy_violation`).

## 4. Política de Boundaries y Estados Silenciosos

Para sostener esta observabilidad en la UI:
1. **Evitar `console.error` solitario:** Todos los bloques `catch` de flujos críticos deben llamar a `logger.error` o `logger.warn` usando la taxonomía superior y un objeto de contexto `LogBaseContext`.
2. **GlobalErrorBoundary:** Un boundary raíz envuelve las rutas para capturar crashes renderizables bajo el dominio `unexpected_ui_state` y renderizar un "Fallback" que invita a recargar. Los componentes internos deben recurrir a Skeletons (cargando) y EmptyStates (sin data / error de data local).
3. **Notify Service:** Las interacciones nativas vía toast (`react-hot-toast`) publican sus estados operativos de notificaciones directamente al `logger` en el dominio `platform_core`.
