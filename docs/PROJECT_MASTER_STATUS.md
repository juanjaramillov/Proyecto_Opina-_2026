# Opina+ — Project Master Status

Este documento es la **fuente única de verdad** técnica y operativa de Opina+ tras los ciclos de estabilización y endurecimiento realizados en 2026.

---

## 1. Core Activo (Producto Vivo)

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

## 2. Arquitectura de Acceso y Navegación

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

## 3. Historial de Estabilización (2026)

El proyecto ha pasado por 5 bloques de endurecimiento crítico:
- **Bloque 1: Acceso y Navegación**: Consolidación de `Gate` y eliminación de fugas en rutas protegidas.
- **Bloque 2: Limpieza Core**: Reducción masiva de deuda técnica (`any`, warnings de lint) en el core del frontend.
- **Bloque 3: Higiene de Repo**: Limpieza de archivos legacy y definición de la política de "Zip Limpio".
- **Bloque 4: Resiliencia**: Implementación de `ModuleErrorBoundary`, reintentos de red y logging avanzado.
- **Bloque 5: Validación Funcional**: Auditoría de punta a punta de los flujos de usuario reales.

---

---

## 4. Guía Operativa

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
Para asegurar la portabilidad y limpieza del proyecto, el empaquetado debe excluir artefactos efímeros:
- **Excluir**: `node_modules/`, `dist/`, `.DS_Store`, archivos `.log`, reportes de auditoría antiguos.
- **Incluir**: `src/`, `public/`, `supabase/`, configuraciones de herramientas y documentación vigente en `docs/`.

---

## 5. Protocolos de Validación (QA)

### Acceso y Seguridad (Access Gate)
1. **Generación**: Los códigos de acceso se crean en el panel Admin.
2. **Validación**: Un usuario sin sesión en `/` debe ser redirigido a `/access`.
3. **Bypass**: Los administradores autenticados pueden saltar el gate mediante una marca en `localStorage` (gestionada por el componente `AccessGate`).

### Flujo de Señales
1. **Carga**: Verificar que el Hub muestre skeletons durante la carga de `useActiveBattles`.
2. **Resiliencia**: Simular falla de red para validar el mensaje de error y el botón de reintento en el Hub.

---

## 6. Deuda Remanente y Supuestos

### Deuda Core Vivo
- **Sincronización Offline**: Refinar la persistencia del outbox tras cierres inesperados de pestaña.
- **Throttling**: Implementar límites de ráfaga en el cliente de Supabase para prevenir abusos en el envío de señales.

### Deuda Periférica / Legacy
- **`archive/`**: Contiene módulos congelados (Rankings, Depth V1). No se deben reactivar sin auditoría previa.
- **B2B Deep Dive**: Visualizaciones complejas aún en estado experimental.

### Supuestos Actuales
- **Conectividad**: Se requiere internet para el bootstrap inicial del perfil.
- **Anonimato**: Se garantiza mediante hashing de identificadores en la capa de servicios.
- **Integraciones**: WhatsApp Cloud se gestiona mediante Edge Functions de Supabase.
