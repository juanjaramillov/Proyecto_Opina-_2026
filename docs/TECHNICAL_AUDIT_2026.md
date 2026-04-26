# Auditoría Técnica Completa y Profunda — Opina+ V16
*(Actualizada tras revisión exhaustiva de RLS, secretos y arquitectura)*

### 1. Resumen Ejecutivo y Veredicto Actualizado

La revisión profunda **confirma el diagnóstico inicial pero eleva drásticamente el nivel de riesgo**. Aunque la arquitectura base (Feature-Sliced Design, Outbox Pattern, Zustand, Sentry) es de nivel *enterprise* y muy sólida para la emisión optimista de señales, la auditoría reveló **vulnerabilidades críticas P0 de exposición de secretos y dependencia frágil del cliente** que **bloquean absolutamente el paso a producción o a una venta B2B real**.

El modelo de Supabase usa un patrón muy avanzado y seguro (`RLS sin policies` + RPCs `SECURITY DEFINER`), lo que blinda la base de datos de ataques REST directos y canaliza todo a través de funciones transaccionales. Sin embargo, el frontend tiene deudas graves en la integración con servicios de terceros y manejo local.

*   **¿La clasificación sigue siendo “parcialmente sólida”?** Sí. La base de ingeniería es excelente, pero la implementación de ciertas integraciones (ej. LLM) es peligrosa, lo que contrasta fuertemente con la calidad del resto del código.
*   **¿Hay riesgos que bloquean producción?** **Totalmente.** La exposición de claves API y el enrutamiento dependiente de strings de error de la BD provocarán pérdida económica (robo de API keys) y fallas estructurales de UI.
*   **¿Hay riesgos que bloquean vender B2B?** **Sí.** En un proceso de *due diligence* técnico, la exposición de secretos en el frontend descalificaría automáticamente el software por incumplimiento de normativas de seguridad (ISO 27001 / SOC 2).
*   **¿Hay riesgos que bloquean demo comercial?** No. Una demo comercial cerrada o controlada por ventas funcionará perfectamente porque el cliente no revisará la red ni se enfrentará a errores inesperados de Postgres.

---

### 2. Tabla Consolidada de Hallazgos Técnicos

| ID | Área | Hallazgo | Evidencia exacta | Archivo / Tabla / RPC | Riesgo | Prioridad | Acción recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A01** | **Seguridad Frontend** | Exposición de clave API de OpenAI en cliente B2B | `dangerouslyAllowBrowser: true` y uso de `import.meta.env.VITE_OPENAI_API_KEY` instanciando cliente en frontend. | `src/features/b2b/engine/LLMNarrativeProvider.ts` (L44, L35) | Robo de API key de OpenAI por cualquier usuario inspeccionando la red o el bundle. | **P0 Crítica** | Mover la generación narrativa a una Supabase Edge Function (`/functions/v1/narrative-bot`). |
| **A02** | **Arquitectura / Errores** | Enrutamiento acoplado a strings de error SQL | Condicionales basados en `msg.includes('INVITE_REQUIRED')` o `msg.includes('PROFILE_MISSING')`. | `src/features/signals/services/signalWriteService.ts` (L147-L177) | Un cambio mínimo de Postgres rompe el onboarding del usuario, dejándolo en pantallas blancas o errores 500. | **P1 Crítica** | El RPC debe retornar un JSON estructurado con `code` de negocio (ej. `ERR_PROFILE_INCOMPLETE`). |
| **A03** | **Supabase (Permisos)** | Confianza total en funciones `SECURITY DEFINER` | Existen +40 referencias a funciones SQL con `SECURITY DEFINER` que saltan el RLS por diseño. | Múltiples migraciones (ej. `20260424000200_multi_session_lock.sql`) | Si un RPC no valida internamente `auth.uid()`, permite inyección o alteración masiva de datos ajenos. | **P1 Alta** | Auditar cada RPC `SECURITY DEFINER` para verificar que invoquen `auth.uid()` o chequeen `service_role`. |
| **A04** | **Seguridad / Estado** | Dependencia extrema de `localStorage` para sesiones y huellas | Lectura cruda de `localStorage.getItem('opina_device_hash')` y `SESSION_ID_KEY` mezclada con lógica. | `src/features/auth/hooks/useSessionGuard.ts`, `signalWriteService.ts` | Posibilidad de manipulación local, evasión de rate limits, o secuestro de sesión XSS. | **P2 Media** | Extraer la lógica a un módulo inyectable, evaluar uso de HttpOnly Cookies o almacenamiento cifrado. |
| **A05** | **Integridad Datos** | Falta validación estricta de variables en flujos dinámicos | Fallbacks que asumen comportamientos sin validar contra `CanonicalModuleType` ni firma RPC. | `src/features/signals/services/signalWriteService.ts` | Corrupción de datos: señales asíncronas guardadas sin contexto rastreable o errores de esquema. | **P2 Media** | Mover validación estructural a Zod para garantizar paridad exacta con la firma del RPC. |
| **A06** | **TypeScript** | Casts inseguros a `any` en llamadas a RPC | `await (sb.rpc as any)('get_entities_by_module', ...)` evadiendo la validación de tipos del cliente. | `src/features/signals/services/signalReadService.ts` | Errores silenciosos en tiempo de ejecución por desincronización de esquemas B2B. | **P2 Media** | Regenerar tipos con `supabase gen types` y actualizar la firma de `Database`. |
| **A07** | **Seguridad APIs** | Posible fuga de claves en proveedores de Assets | Dependencias a `import.meta.env` no protegidas u ofuscadas en un backend para LogoDev. | `src/lib/entities/assets/providers/LogoDevProvider.ts` | Exposición de `LOGO_DEV_SECRET_KEY` si el entorno la inyecta al cliente. | **P1 Alta** | Mover lógica de resolución de Logos a Supabase Edge Functions. |

---

### 3. Checklist de Producción

| Área | Estado | Evidencia | Riesgo | Acción requerida |
| :--- | :--- | :--- | :--- | :--- |
| **Auth y Sesiones** | **Parcial / Riesgo** | `useSessionGuard.ts` depende fuertemente de `localStorage`. | Secuestro de sesión mediante XSS básico. | Integrar manejo nativo de Supabase Auth en lugar de tokens adicionales manuales (a menos que sea estricto para *session lock* anti-fraude). |
| **Manejo de Errores** | **Aprobado** | `windowErrorBridge.ts`, Sentry inicializado en `index.tsx`, uso intensivo de `logger.ts`. | Bajo. Hay buena cobertura de telemetría. | Mantener la disciplina de `getErrorReporter()`. |
| **Seguridad de Secretos** | **Riesgo Crítico** | `import.meta.env.VITE_OPENAI_API_KEY` en `LLMNarrativeProvider.ts`. | Robo de credenciales y facturación inesperada en OpenAI. | **Bloqueante.** Migrar LLM prompt a Edge Function inmediatamente. |
| **Performance Frontend** | **Aprobado** | Componentes usan *lazy loading* y colas asíncronas robustas (`signalOutbox` con IndexedDB). | Bajo. Optimista UI funciona impecable. | Mantener monitorización vía Sentry de *Web Vitals*. |
| **Integridad de Datos** | **Riesgo** | `insert_signal_event` falla si el frontend no coincide con Postgres. | Pérdida de señales e inconsistencia de datos B2B. | Asegurar que `Zod` valide *exactamente* la firma del RPC antes de enviar a Outbox. |

---

### 4. Checklist de Supabase

| Tabla / RPC / Policy | Función | Estado | Riesgo | Acción requerida |
| :--- | :--- | :--- | :--- | :--- |
| **Tablas Core (Signals, Entities, etc.)** | Almacenamiento base | **Aprobado** | Bajo. RLS está estrictamente cerrado para inserciones directas ("RLS sin policies"). | Ninguna. Es una práctica excelente obligar a usar RPCs para la escritura. |
| **RPC: `insert_signal_event`** | Ingesta de datos | **Riesgo** | Alto. Es la función más crítica y es `SECURITY DEFINER`. | Verificar que el RPC realiza *rate limiting* a nivel Postgres, no depender del frontend. |
| **RPC: `get_entities_by_module`** | Lectura de catálogo | **Parcial** | Medio. Frontend usa `(sb.rpc as any)`. | Regenerar tipos para evitar inyecciones indirectas por desincronización de esquema. |
| **Políticas (Policies)** | Lectura/Escritura REST | **Aprobado** | Bajo. Múltiples migraciones demuestran políticas SELECT bien restringidas. | Validar que no existan políticas que permitan DELETE masivo en tablas *logs* o *signals*. |

---

### 5. Checklist de Testing

| Flujo crítico | Test existente | Cobertura real | Riesgo | Test recomendado |
| :--- | :--- | :--- | :--- | :--- |
| **Validación Offline (Outbox)** | `outbox-offline.spec.ts` | Básica (mock de IndexedDB). | Señales huérfanas si el usuario cierra el navegador bruscamente. | Test Playwright que intercepte red (`page.setOffline(true)`), emita señal, recargue página y verifique el POST. |
| **Abuso de Rate Limit** | `versus-rate-limit.spec.ts` | Depende del frontend (`localStorage`). | Bots podrían bypassear el rate limit limpiando `localStorage`. | Test E2E golpeando la API/RPC directamente ignorando el UI para probar los límites reales del backend. |
| **Generación Narrativa LLM** | `narrativeProvider.test.ts` | Solo evalúa la respuesta *mockeada* o fallida. | Textos B2B erráticos y errores silenciosos en la UI de dashboards. | Test de integración contra un endpoint de staging de la Edge Function (una vez movido). |
| **Session Guard (Multi-device)** | Ninguno detectado. | Nula. | Usuarios compartiendo cuenta corporativa sin control real. | Test E2E simulando dos contextos de navegador diferentes (dos IDs de sesión distintos) para el mismo `uid`. |

---

### 6. Las 5 Correcciones Prioritarias (Orden Estricto)

1. **Eliminar OpenAI del Frontend (P0)**: Eliminar `LLMNarrativeProvider.ts` del cliente y crear una Edge Function en Supabase que realice la llamada a OpenAI. La API key solo debe existir en el vault de Supabase.
2. **Refactorizar errores de RPC (P1)**: Modificar `insert_signal_event` y afines en Postgres para retornar códigos exactos (ej. `ERR_INVITE_REQUIRED`). Cambiar `signalWriteService.ts` para leer el código estructurado en lugar de usar `.includes()`.
3. **Migrar Secrets de LogoDev (P1)**: Asegurar que `LOGO_DEV_SECRET_KEY` no se filtre en el build del cliente Vite, trasladando la petición al backend.
4. **Remover tipado `any` en RPCs críticos (P2)**: Ejecutar `npx supabase gen types` e integrar el modelo formal en las llamadas de `signalReadService` y `signalWriteService`.
5. **Revisar todos los `SECURITY DEFINER` (P2)**: Ejecutar una auditoría rápida en `supabase/migrations/` para confirmar que ninguna función `SECURITY DEFINER` permite escrituras/lecturas omitiendo la validación estricta de `auth.uid()`.
