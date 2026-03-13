# Mapa Oficial de Features y Routing (Opina+ V13)

Este documento establece el canon del producto, definiendo qué partes de la aplicación están integradas al flujo core, cuáles representan el roadmap inmediato (en construcción), y cuáles son reliquias o están temporalmente fuera de servicio (Legacy).

## 1. Hub de Señales (El Core)
*Ubicación:* `/experience` u `HubMenuSimplified.tsx`

| Feature | Estado | Justificación |
| :--- | :--- | :--- |
| **Versus Rápido** | **ACTIVA** | Es el núcleo de votación (`/battle/:battleSlug`). Integrado y funcional. |
| **Versus Progresivo (Torneo)** | **ACTIVA** | Comparte motor de versus. Listado en HUB como torneo. |
| **Actualidad** | **ACTIVA** | Módulo editorial funcional. Flujo público e interno trabajando juntos. |
| **Profundidad** | **ACTIVA** | Evaluaciones cualitativas (texto/escala). Integrada y funcional. |
| **Deportes** | **EN CONSTRUCCIÓN** | Módulo verticalizado planeado. En HUB con badge "Próximamente". |
| **Productos** | **EN CONSTRUCCIÓN** | Módulo verticalizado planeado. En HUB con badge "Próximamente". |
| **Comida (Restaurantes)** | **EN CONSTRUCCIÓN** | Módulo verticalizado planeado. En HUB con badge "Próximamente". |
| **Lugares** | **EN CONSTRUCCIÓN** | Módulo verticalizado planeado. En HUB con badge "En constr.". |
| **Servicios** | **EN CONSTRUCCIÓN** | Módulo verticalizado planeado. En HUB con badge "Próximamente". |
| **Tu Pulso** | **EN CONSTRUCCIÓN** | Tracking personal planeado. En HUB con badge "En constr.". |
| **Explorar Temas** | **EN CONSTRUCCIÓN** | Buscador de tópicos planeado. En HUB con badge "Próximamente". |
| **Resultados / Impacto** | **ACTIVA** | Capa de visualización de rankings (`/results`). Integrada. |

## 2. Bloque de Usuarios / Capa Pública
| Feature | Ruta | Estado | Justificación |
| :--- | :--- | :--- | :--- |
| **Landing Page** | `/` | **ACTIVA** | Punto de entrada del producto. |
| **Login / Registro** | `/login`, `/register` | **ACTIVA** | Autenticación base. |
| **Onboarding Perfil** | `/complete-profile` | **ACTIVA** | Wizard de completitud de perfil necesario post-registro. |
| **Mi Perfil** | `/profile` | **ACTIVA** | Gestión básica de la cuenta del usuario. |
| **Acerca de** | `/about` | **ACTIVA** | Página estática informativa. |

## 3. Bloque de Administración (Admin)
| Feature | Ruta | Estado | Justificación |
| :--- | :--- | :--- | :--- |
| **Manejo de Invitaciones**| `/admin/invitaciones`| **ACTIVA** | Core de crecimiento B2B/cerrado. |
| **Salud del Sistema**| `/admin/health`| **ACTIVA** | Monitoreo base. |
| **Antifraude**| `/admin/antifraude`| **ACTIVA** | Reglas de protección de encuestas. |
| **Dashboard Actualidad**| `/admin/actualidad`| **ACTIVA** | Editor y manejador del feed de noticias. |

## 4. Legados (Legacy) y Elementos Apartados
| Feature | Ruta | Estado | Justificación |
| :--- | :--- | :--- | :--- |
| **Rankings Públicos** | `/clinicas-santiago/:slug`| **LEGACY** | Ruta comentada en `App.tsx`. Usada para demos pero fuera del flujo central actual. |
| **DepthHub (Viejo Hub)** | `/depth/:battleSlug` | **LEGACY** | Ruta comentada en `App.tsx`. Sustituido por integración directa en SignalService. |
| **DepthRun (Corredor)** | `/depth/run/:battleSlug` | **LEGACY** | Ruta comentada en `App.tsx`. Absorbió sus funciones el motor general de batallas. |
| **Rankings General** | `/rankings` | **LEGACY** | Ruta comentada en `App.tsx`. Absorbió sus funciones `/results`. |
| **Estado Personal** | `/personal-state` | **LEGACY** | Ruta comentada en `App.tsx`. Absorbió sus funciones "Tu Pulso" (En constr.). |
| **Demanda y Prioridad** | `/admin/demanda` | **LEGACY** | Módulos admin comentados en `App.tsx` que no aplican a la operativa actual V13. |
| **Inteligencia (Base)** | `/intelligence` | **LEGACY** | Esta es la ruta antigua (ahora es dashboard publico que redirige a results). Descontinuada a favor de `/intelligence-dashboard`. |
| **Dashboard Inteligencia**| `/intelligence-dashboard`| **ACTIVA** | Exclusivo B2B y Admins. Separado del flujo de usuario estándar. |

---
**Nota sobre el HUB (`HubMenuSimplified.tsx`)**: Se respetó la presencia de todas las verticales de negocio planificadas (Deportes, Productos, Tu Pulso, etc). Se encuentran marcadas visualmente con baja opacidad y labels de "Próximamente" o "En constr." tal cual se solicitó para comunicar el roadmap al usuario sin estorbar la navegación del producto maduro.
