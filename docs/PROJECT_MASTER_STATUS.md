# Opina+ — Project Master Status

Este documento es la **fuente única de verdad** técnica y operativa de Opina+ tras los ciclos de estabilización y endurecimiento realizados en 2026.

---

## 1. Core Estable Protegido (Baseline V13)

Esta zona del proyecto constituye el **Core Estable**. Ha sido formalmente auditada, testeada transversalmente, estandarizada con Read Models formales y asegurada arquitectónicamente. **Cualquier modificación sobre estos subsistemas requiere justificación estricta y revalidación total.**

| Área Protegida | Descripción Técnica |
| :--- | :--- |
| **Capa de Acceso y Gatekeeper** | El orquestador `Gate.tsx`, `accessGate.ts` y las policies RPC de Supabase que resuelven los roles estrictos (Bypass vs Autenticado vs Admin vs B2B). |
| **Motor de Señales y Extracción** | Todo el sistema subyacente para emitir señales (Votos Versus, Ranking Torneo), manejando consistencia de IDs en DB. |
| **Resiliencia P2P (Outbox)** | La cola local síncrona/asíncrona garantizando que los votos jamás se pierdan en desconexiones temporales. |
| **Read Models Canónicos** | La estructura `src/read-models/`. Contratos fuente de Verdad absoluta: cálculo paramétrico de _Confidence_ y _Sufficiency_. |
| **Panel de Resultados B2C** | La topología de `Results.tsx` adaptándose dócilmente a los estados de suficiencia y el pipeline de insights multivariados. Actualmente opera conectado a `userMasterResultsReadModel` real, eliminando por completo la capa de *Demo Mode* y el uso de datos ficticios. Se proveen *empty states* elegantes para datos faltantes. |
| **Overview Ejecutivo B2B** | El dashboard primario de administradores cliente `OverviewB2B.tsx`, alimentado por `PlatformOverviewSnapshot` estrictamente. |
| **Tooling y Operaciones Base** | Los scripts en `ops/` que garantizan auditorías puras y descargas de Zip higienizadas. |

> **ZONA DE EVOLUCIÓN EXPERIMENTAL:** Fuera del baseline anterior yacen elementos que todavía pueden estar incompletos o sufriendo experimentación, como el despliegue profundo del CRM del B2B (Módulos soon), los gráficos cruzados pesados del Perfil Demográfico o los rankings heredados del antiguo archive.

---

## 2. Jerarquía General del Sistema

El proyecto actual se divide en un frontend dinámico basado en React/Vite que consume servicios de Supabase.

### Rutas Principales
- `/`: Landing pública.
- `/signals`: Hub principal de experiencia (Versus, Torneo, Actualidad).
- `/profile`: Centro de usuario y loyalty.
- `/b2b`: Dashboard de inteligencia para clientes.
- `/admin`: Panel de control operativo.

### Módulos Funcionales (Estado Actual)
| Módulo | Estado | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **Hub de Señales** | Operativo | User / Admin | Orquestador de experiencias de usuario. |
| **Versus** | Operativo | User / Admin | Comparación binaria rápida de marcas y tópicos. |
| **Torneo** | Operativo | User / Admin | Eliminatorias progresivas para categorías específicas. |
| **Actualidad** | Operativo | User / Admin | Módulo editorial para tópicos de tendencia (ActualidadEditorial). |
| **Perfil / Onboarding** | Operativo | User / Admin | Captura progresiva de demografía y stats de loyalty. |
| **B2B Dashboard** | Experimental | B2B / Admin | Inteligencia de datos y benchmarks (parcial). |
| **Admin Hub** | Operativo | Admin | Gestión de usuarios, invitaciones y salud del sistema. |
| **Loyalty / Wallet** | Operativo | User / Admin | Sistema de puntos y niveles basados en señales emitidas. |

---

## 3. Arquitectura de Acceso y Navegación

El acceso al sistema está gobernado por una política centralizada que evita la dispersión de lógica en las páginas.

### Componentes Clave
- **`Gate.tsx`**: Componente de protección que envuelve rutas en `App.tsx`. Decide si permitir el paso, redirigir o mostrar un mensaje basado en la política resuelta.
- **`accessGate.ts`**: Servicio que maneja el acceso físico local (tokens de bypass, códigos de piloto).
- **`policyResolver.ts`**: Motor de reglas que traduce Roles de Supabase y estados de carga en decisiones de acceso (Allowed / Redirect).

### Jerarquía de Rutas
1. **Públicas**: `/`, `/about`, `/intelligence`, `/login`, `/register`.
2. **Protegidas por Sesión**: Todas las rutas bajo el `Gate` con módulo `experience`.
3. **Protegidas por Rol**: `/admin` (requiere `role: 'admin'`) y `/b2b` (requiere `role: 'b2b'`).

---

## 4. Historial de Estabilización (2026)

El proyecto ha pasado por 5 bloques de estabilización técnica y de tooling de cara a la versión maestra (V13):
- **Bloque 1**: Corrección del contrato no-battle y estabilización de flujos multirespuesta.
- **Bloque 2**: Autorización server-side real en funciones privilegiadas (Edge Functions y Gate).
- **Bloque 3**: Consolidación total de **Read Models canónicos**. Separación radical de B2C y B2B, inyección de _Confidence Level_ y QA mínimo automatizado 100% transpirado (Vitest/Typecheck).
- **Bloque 4**: Limpieza operativa del repo, higiene pre-Zip, gitignores reales y exclusión de utilidades muertas.
- **Bloque 5 (Actual)**: Congelamiento estofado del core estable y levantamiento formal explícito del **Registro de Deuda**.

---

## 5. REGLA OBLIGATORIA DE NO REGRESIÓN

Cualquier alteración a los archivos definidos en el _Core Estable Protegido_ se rige por un mandato de cero-rupturas. **Para fusionar cambios en el Core, se exigen 3 validaciones indispensables:**

1. Pruebas tipadas perfectas: `npm run typecheck`
2. Test unitarios de dominio sin fallos: `npm run test:run`
3. Empaquetado compilable sin alertas: `npm run build`
4. Confirmación funcional de que los Read Models devuelven los Data Snapshots inalterados o en su nueva versión contractual correctamente retrocompatible.

Ningún parche temporal puede subvertir estas 4 aserciones.

### 5.1 Regla de Seguridad: Purgas de Datos de Demo
La eliminación de código o funcionalidad demo debe enfocarse exclusivamente en la experiencia de producto, el runtime visible y la lógica funcional asociada a simulaciones orientadas a clientes.
**Restricción estricta:** No borrar fixtures, seeds, scripts de base de datos o utilidades que sean necesarias para tests, validación técnica o tooling interno, a menos que sean indudablemente basura residual de demo (ej. textos de presentación comercial en el dashboard) y exista un reemplazo organizativo seguro.
---

## 6. Guía Operativa

### Prerrequisitos
- **Node.js**: v18.0.0 o superior.
- **Supabase**: Proyecto activo con tablas de `users`, `signals` y `actualidad_topics`.
- **Variables de Entorno**: Consultar el archivo `.env.example`. Los secretos (Service Role Key) solo se usan en scripts de backend.

### Comandos Críticos
```bash
# Instalación limpia
npm install

# Desarrollo local (Vite)
npm run dev

# Validación de tipos (Obligatorio antes de empaquetar)
npm run typecheck

# Construcción de producción
npm run build
```

### Política de "Zip Limpio" (Mantenimiento del Repositorio)
Para asegurar la portabilidad y limpieza del proyecto, el empaquetado **nunca se hace de forma manual**.
Se cuenta con scripts de sanidad operativa:
1. Validar higiene: `npm run ops:repo-hygiene` (evita exportar rastros de pruebas locales, `.env` no compartibles, `node_modules`, etc).
2. Exportar limpio: `npm run ops:zip-clean` (genera un ZIP con estrictas exclusiones estructurales).
La exclusión de `archive/` es el comportamiento por defecto para mantener los reportes livianos.

---

## 7. Protocolos de Validación (QA)

### Acceso y Seguridad (Access Gate)
1. **Generación**: Los códigos de acceso se crean en el panel Admin.
2. **Validación**: Un usuario sin sesión en `/` debe ser redirigido a `/access`.
3. **Bypass**: Los administradores autenticados pueden saltar el gate mediante una marca en `localStorage` (gestionada por el componente `AccessGate`).

### Flujo de Señales
1. **Carga**: Verificar que el Hub muestre skeletons durante la carga de `useActiveBattles`.
2. **Resiliencia**: Simular falla de red para validar el mensaje de error y el botón de reintento en el Hub.

---

## 8. Deuda Residual y Estado Pendiente

Este documento no enumera exhaustivamente la deuda menor. Para auditar todas las decisiones aplazadas o áreas frágiles asumidas para esta V13, **consultar explícitamente el documento hermano: [DEBT_REGISTER_V13.md](./DEBT_REGISTER_V13.md)**. 

### Supuestos Actuales
- **Conectividad**: Se requiere internet estable para el bootstrap inicial del perfil interactivo.
- **Anonimato Técnico**: Todas las votaciones se enmascaran contra perfiles sombreados.
- **Ecosistema**: La validación WhatsApp/Twilio recae fuertemente en Edge Functions de Supabase.
