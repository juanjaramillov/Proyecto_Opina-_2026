# Plan de Monetización y Arquitectura Comercial - Opina+ V13

Este documento detalla la arquitectura de monetización de Opina+ a partir de la versión V13. Nuestro objetivo es definir claramente cómo se extrae valor comercial del sistema consolidado (métricas, alertas y narrativas) sin despojar al usuario base (quien genera el dato) del incentivo intrínseco.

## 1. La Tesis Comercial de Opina+

El modelo de negocios **NO** consiste en cobrar por participar en encuestas regulares ni vender bases de datos sin refinar. El negocio radica en:
- Vender **Inteligencia Analítica y Comparativa** a las marcas y entes evaluados.
- Vender **Detección de Cambios (Momentum)** en el mercado a través de motores estadísticos (WoW) y no solo conteos de votos en crudo.
- Vender **Alertas Tempranas** para anticiparnos a crisis, picos de interés o caídas severas.
- Vender **Interpretación Narrativa** generada algorítmicamente (Reportes Ejecutivos Listos).
- Vender **Lectura Segmentada** (ej. "Cómo rinde mi marca en mujeres del segmento C3 en la última semana").

---

## 2. Inventario de Capacidades Base
A lo largo de la iteración hemos construido módulos diferenciados. Los catalogamos a efectos de restringirlos comercialmente:

1. **Dashboard de Resultados Estándar (B2C)**: Share global y ganador actual del duelo.
2. **Dashboard de Visión General B2B (Overview)**: Con KPIs agregadas (entidades subiendo, bajando).
3. **Rankings Globales (Leaderboard)**: Todo el catálogo ordenado por volumen total de interacciones de mercado.
4. **Comparativa Avanzada (Benchmark)**: Tablas de competitividad, win-rates versus la industria o en batallas particulares.
5. **Tendencias (Momentum)**: Análisis Week Over Week mostrando la velocidad de adopción o caída.
6. **Segmentación**: Capacidad de romper cualquiera de los datos anteriores por variables demográficas (edad, género, comuna).
7. **Motor de Alertas (Alerts)**: Feed de anomalías detectadas (INFO, WARNING, CRITICAL) centralizado.
8. **Motor Narrativo (Deep Dive)**: Capacidad de que el sistema analice la "foto algorítmica" de una entidad y entregue insights textuales redactados en sintaxis ejecutiva comercial.
9. **Reportes Ejecutivos**: Exportables asíncronos y PDFs de los insights (One-pagers y sumarios listos para junta directiva).

---

## 3. Niveles de Acceso y Estructuración (Pricing Tiers)

Para entregar valor orgánicamente la aplicación se divide en 4 Tiers conceptuales.

### Nivel 1: B2C Free (Usuario Ordinario)
El incentivo de un usuario real que provee *signals* a la plataforma se retribuye entregándole la temperatura general sin comprometer el capital de inteligencia de Opina+.
- **Qué incluye:**
  - Acceso total a votar en el HUB (Torneos, Batallas rápidas, Actualidad editorial).
  - Resultados básicos inmediatos post-voto (share (%) actual frente a su rival).
  - Listado de los absolutos "Top 10" globales (sin capacidad de segmentación temporal ni demográfica).

### Nivel 2: B2C Plus / Premium (Usuario Avanzado)
Propuesta de retención para usuarios pesados o para consumo analítico C2C/Personal (B2B entry point difuso), en caso se llegue a implementar.
- **Qué incluye (Potencial):**
  - Todo lo del plan Free.
  - Histórico personal extenso (cuántos votos el usuario ha estado en la "mayoría" de tendencia vs minoría).
  - Alertas personales o de categorías favoritas seguidas.

### Nivel 3: B2B Starter (Agencias y Pymes)
La entrada comercial. Tiene acceso al dominio `/b2b` pero con profundidad limitada de datos para entender el espectro general de la industria sin bucear a fondo en el "por qué".
- **Composición del Dominio:**
  - **OverviewB2B:** Incluido.
  - **BenchmarkB2B:** Incluido (Rankings y Win Rates generales, sin segmentación histórica profunda, e.g limitados a `L30D`).
  - **AlertsB2B:** Incluido con límites: solo alertas agregadas (INFO) y sin feeds en tiempo real exhaustivos.
  - **DeepDiveB2B (Narrativa):** Bloqueado o restringido a "Muestra Limitada" (X consultas al mes).
  - **ReportsB2B:** Deshabilitado o de modelo Pay-Per-Download (One-offs).
  - **Segmentación:** Bloqueada. Solo visualizan "Total Universo".

### Nivel 4: B2B Pro / Enterprise (Marcas, Corporativos)
El plan élite diseñado para C-Levels de una marca que necesitan el pulso de su cuota de mercado con granularidad y alertas tempranas configuradas ad-hoc.
- **Composición del Dominio:**
  - **OverviewB2B & BenchmarkB2B:** Acceso Total, vistas históricas L365D o YTD.
  - **AlertsB2B:** Tracker radar ilimitado con notificaciones *push* severas (WARNING, CRITICAL, Picos de Polarización, Emerging Signals).
  - **DeepDiveB2B (Narrativa):** Acceso al `narrativeEngine` ilimitado para escrutiñar competidores y marcas proias con textos ejecutivos diarios y segmentados.
  - **Segmentación:** Habilitada para todas las tablas. (Capacidad de cruzar Benchmark por variables demográficas).
  - **ReportsB2B:** Alertas automatizadas asíncronas semanales a su correo y exports ilimitados en formato corporativo. (Posibilidad de Data Export crudo a demanda).

---

## 4. Capability Gating (Implementación Estándar)

Dado el diseño modular actual del código, no basta con "ocultar el botón" (UI-Hiding). El gating debe asegurar:

1. **Gating por Role**: La bifurcación principal (Acceso B2B vs App Pública vs Panel Admin). Ya implementado mediante `RoleProtectedRoute` (`allowedRoles={['b2b', 'admin']}`) en `App.tsx`.
2. **Gating Lógico (Subscription Tiers)**: Requeriremos establecer un check al interior del dominio derivado del JWT o la información extendida de perfil:
   - *Ejemplo Pseudo-código en UI*: `if (user.plan === 'starter' && attemptLoadSegment()) return <UpgradeModal />;`
3. **Endpoint / RPC Gating**: La barrera final. `metricsService` o `platformService` deben (cuando haya roles RLS estrictos de BD) recibir el tier de usuario y descartar `params` como `ageRange` o `commune` a un throw de "Tier Insufficient" devolviendo HTTP 403, antes de procesar SQL intensivo en recursos.

## 5. Deuda Técnica para Monetización Real
Para inyectar pasarelas de pago (Stripe, MercadoPago) nos restará en el tintero:
1. Diseñar y persistir una tabla `user_subscriptions` o sincronizar metadata a los claims del Auth de Supabase.
2. Adaptar hooks como `useRole()` para extenderse a `useSubscriptionTier()`.
3. Crear el componente `<PremiumGate fallback={UpgradeComponent}>` para inyectar modularmente bloqueos en secciones de `DeepDiveB2B` o en los filtros de segmentación de `BenchmarkB2B`.
4. Restringir temporalmente las opciones gráficamente demasiado abiertas por ahora pre-monetización (Ej. revisar que en el App pública de "Resultados" no estemos brindando narraciones ejecutivas o KPIs que el Enterprise pagaría).
