# Opina+ — Project Master Status

Este documento es la **fuente única de verdad** técnica y operativa de Opina+ tras los ciclos de estabilización y endurecimiento realizados en 2026.

---

## 1. Core Estable Protegido (Baseline V13)

Esta zona del proyecto constituye el **Core Estable**. Ha sido formalmente auditada, testeada transversalmente, estandarizada con Read Models formales y asegurada arquitectónicamente. **Cualquier modificación sobre estos subsistemas requiere justificación estricta y revalidación total.**

| Área Protegida | Descripción Técnica |
| :--- | :--- |
| **Capa de Acceso y Gatekeeper** | El orquestador `Gate.tsx`, `accessGate.ts` y las policies RPC de Supabase que resuelven los roles estrictos (Bypass vs Autenticado vs Admin vs B2B). |
| **Motor de Señales y Extracción** | Todo el sistema subyacente para emitir señales (Señales Versus, Ranking Torneo), manejando consistencia de IDs en DB. |
| **Resiliencia P2P (Outbox)** | La cola local síncrona/asíncrona garantizando que las señales jamás se pierdan en desconexiones temporales. |
| **Read Models Canónicos** | La estructura `src/read-models/`. Contratos fuente de Verdad absoluta: cálculo paramétrico de _Confidence_ y _Sufficiency_. |
| **Panel de Resultados B2C** | La topología de `Results.tsx` adaptándose dócilmente a los estados de suficiencia y el pipeline de insights multivariados. Actualmente opera conectado a un **Snapshot Ficticio Curado**, aislando la experiencia visual de lecturas reales parciales. |
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
| **B2B Dashboard** | Operativo (Comercial) | B2B / Admin | Inteligencia de datos predecible y benchmarks ejecutivos para clientes con dataset fijado para handoff. |
| **Admin Hub** | Operativo | Admin | Gestión de usuarios, invitaciones y salud del sistema. |
| **Loyalty / Wallet** | Operativo | User / Admin | Sistema de puntos y niveles basados en señales emitidas. |

---

## 3. Arquitectura de Acceso y Navegación

El acceso al sistema está gobernado por una política centralizada que evita la dispersión de lógica en las páginas.

### Transparencia y Métricas
Opina+ basa su valor fundamental en la veracidad. **Estrictamente prohibido:**
*   Renderizar KPIs simulados usando `Math.random` o equivalentes aleatorios/estáticos para representar interacción (visitas, votos, CTR).
*   Si un dato no existe, debe utilizarse el componente `MetricAvailabilityCard` (o estados equivalentes en UI) para reflejar "telemetría pendiente", "insuficiente masa crítica" u otros mensajes honestos, alineados con el diseño premium pero sin falsear inteligencia.

### Capa de Telemetría Mínima (Analytics)
Se ha incorporado una capa estricta (`trackEvent.ts`) para recabar eventos críticos del journey y medir tasas de éxito sin sacrificar performance ni delegar en librerías pesadas temporalmente. La filosofía actual recolecta el footprint de valor del cliente en variables fuertemente tipadas en TypeScript, protegiendo contra corrupciones de datos en el largo plazo e invocando fallbacks a la consola del desarrollador.

## Diccionario Oficial de Módulos Opina+

*   **versus**: Decisiones rápidas cara a cara.
*   **torneo**: Comparación múltiple, el ganador avanza.
*   **actualidad**: Temas contingentes.
*   **profundidad**: Insight Pack (10 preguntas).

**(Nota: No debe existir `tournament` ni en el código ni en la base de datos de producción como módulo oficial)**

### Base de Componentes (Foundation)
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
- **Bloque 5**: Congelamiento del core estable y levantamiento formal explícito del **Registro de Deuda**.
- **Bloque 6**: Higiene Operativa del Repo y Export Limpio. Formalización de la política de `export:clean` para compartir código fuente libre de secretos, caches y dependencias.
- **Bloque 7**: Cierre de B2B como Producto Vendible. Establecimiento de caso curado ficticio ("Vitalidad" vs "Letargo") inyectado directamente a Overview, Deep Dive (como panel comparativo) y Reports (como Executive Briefing final).
- **Sprint de Validación**: Instrumentación Mínima (Analytics B2C + B2B). Sembrado de nodos transparentes en Rutas de Señales, Resultados y B2B para auditar el engagement.
- **Fase 1 (Saneamiento Operativo)**: Cierre definitivo de la higiene operativa de "Señales". Purga completa del lenguaje heredado de "voto" o "pulso".
- **Fase 2 / Bloque 1 (UI Foundation)**: Creación de la capa base reusable (`SectionShell`, `StatTile`, `FilterPill`, `EmptyState`) y su adopción quirúrgica en el runtime principal de Results y Signals. Eliminación de wrappers artesanales iterando hacia una escalabilidad estandarizada.
- **Fase 2 / Bloque 2 (Partición de Monolíticos)**: Completada. Fragmentación estructural exitosa de componentes masivos (`HubSecondaryTracks`, orquestadores de `Actualidad`, `LiveTrendsSection`), separando lógica de vista, extrayendo helpers redundantes e integrando UI Foundation (`EmptyState`, contenedores) garantizando 0 errores en Typecheck y Smoke tests en verde para el runtime vivo.
- **Fase 2 / Bloque 3 (Refinamiento Editorial UI/Docs)**: Completada. Sustitución de terminología técnico-corporativa ("Ecosistema", "Overview", "Share") en módulos vivos del B2C (ResultsWowClosing, ResultsExecutivePulse, etc.) por equivalentes Premium-Editorial ("La Conversación", "Radiografía de la Opinión", "Tracción Principal"). Corrección de nomenclatura histórica suelta en manuales maestros.

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

### Política de Exportación Limpia (Empaquetado Seguro del Repositorio)
Para compartir, respaldar o auditar el repositorio **NUNCA DEBE COMPRIMIRSE MANUALMENTE**. 
Existe un protocolo estricto, integrado y documentado en `docs/internal/repo-hygiene-and-export-governance.md` regido por un script shell atómico inteligente.

Para generar un archivo ZIP distribuible transparente, libre de secretos reales `.env` y sin dependencias monstruosas:
```bash
npm run export:clean
```
El archivo sanitizado se almacenará silenciosamente en el directorio raíz `exports/` el cual será automáticamente ignorado por Git.

## 7. Protocolos de Validación (QA)

### Smoke Tests Mínimos del Flujo Vivo
Ejecutable vía `npm run test:smoke`. Proveen una malla antifragilidad de la carga en memoria del ecosistema activo (Bloque 5).
- **Cubierto:** Montaje básico sin cuelgues de `<App />`, carga del nodo principal de `<Home />` con su dependencia a la data sintética base, y `<Results />` resolviendo satisfactoriamente el estado de carga (`launch_synthetic`).
- **Qué NO cubren:** Testeos End-to-End densos (E2E), animaciones, flujos admin B2B (aún pendiente de test propios).

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
- **Anonimato Técnico**: Todas las señales emitidas se enmascaran contra perfiles sombreados.
- **Ecosistema**: La validación WhatsApp/Twilio recae fuertemente en Edge Functions de Supabase.
