# Diagnóstico de Superficie: Real vs "Próximamente" (Fase 3.1)

> **Fecha:** Abril 2026  
> **Propósito:** Mapa base para decisiones de Fase 3.2 (Credibilidad de Producto, DEBT-002 + DEBT-003).  
> **Metodología:** Auditoría estática del código fuente, sin ejecutar la app. Cada hallazgo tiene evidencia `archivo:línea`.

---

## 1. Sobrepromesas B2C (DEBT-002)

Los módulos marcados `status: 'soon'` en `src/features/feed/modulesConfig.ts` tienen scaffolding de distinta profundidad. No todos son iguales.

| Módulo | Archivo:línea | Promete | Backing real | Veredicto sugerido |
| :--- | :--- | :--- | :--- | :--- |
| **Profundidad** | `modulesConfig.ts:43` | "10 preguntas rápidas para refinar inteligencia colectiva" | UI + `IndustrySelector`/`InsightPack` activos | **Beta** — UI existe, pero sin flujo real de batallas → preguntas |
| **Pulso** | `modulesConfig.ts:50` | "Sincroniza tu estado personal del día" | Solo preview shell en `ComingSoonModule` | **Ocultar** — scaffolding cosmético |
| **Lugares** | `modulesConfig.ts:67` | "Califica y rankea ubicaciones físicas" | `LugaresView.tsx` con taxonomía + categorías locales; `signalService` integrado | **Beta** — estructura completa pero datos hardcodeados (`PLACE_CATEGORIES` static) |
| **Servicios** | `modulesConfig.ts:85` | "Evalúa calidad de proveedores (isapres, bancos, telecom)" | `ServiciosView.tsx` con 5+ categorías; `signalService` integrado | **Beta** — taxonomía completa, UI funciona, no valida si hay entidades reales en BD |
| **Productos** | `modulesConfig.ts:119` | "Escanea código de barras para inteligencia de producto" | `PreviewProductSheet` stub | **Ocultar** — mockup sin lógica de cámara/QR |
| **NPS** | `modulesConfig.ts:136` | "Escala rápida de lealtad de marcas" | `PreviewNpsSurvey` con form | **Ocultar** — mockup sin persistencia |

**String visible al usuario:** `modulesConfig.ts:97` renderiza "Próximamente" en CTA del Hub Bento Grid.

**CTA no-op:** `ComingSoonModule.tsx:144` → `alert("...registrado")` — botón cosmético sin acción real detrás.

---

## 2. Estado de módulos B2B (DEBT-003)

Las 5 páginas B2B comparten un snapshot único vía `useOverviewB2BState()` → `intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot()`.

| Módulo | Ruta | Fuente de datos | UI completa | Fetch real | Veredicto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OverviewB2B** | `/b2b/overview` | `intelligenceAnalyticsReadModel.ts` → fallback a `metricsService.getGlobalLeaderboard()` | Sí | Sí, con fallback a datos vacíos si `executive_reports` está vacía | **Funcional** |
| **BenchmarkB2B** | `/b2b/benchmark` | Mismo snapshot + `analyticsReadService` | Sí | `setEntityNarrative(null)` en L67 — la tarjeta "Narrativa Ejecutiva" siempre renderiza placeholder | **Parcial** — remover sección o construir engine de narrativa |
| **AlertsB2B** | `/b2b/alerts` | `snapshot?.alerts ?? []` | Sí | Sí | **Funcional** |
| **DeepDiveB2B** | `/b2b/deep-dive` | Requiere 2+ entidades + `insufficient_data` check (L60) | Sí (Head-to-Head + `PremiumGate`) | Sí, bloquea bajo threshold de 30 batallas globales | **Funcional** (gating defensivo correcto) |
| **ReportsB2B** | `/b2b/reports` | Snapshot + narrativa generada por interpolación (L61-79) | Sí (documento formato A4) | **Texto interpolado, no es LLM** | **Parcial** — marcar Beta explícito o gatear |

### Riesgo crítico identificado

- `intelligenceAnalyticsReadModel.ts:45` cae a `metricsService.getGlobalLeaderboard()` si `executive_reports` está vacía. Si eso también falla → arrays vacíos → UI vacía sin mensaje claro al usuario.
- `ReportsB2B.tsx:61-79` genera el "Resumen Ejecutivo" y "Recomendación Táctica C-Level" por string interpolation. Un cliente sofisticado detectará el patrón sintáctico y percibirá el reporte como fake.
- `BenchmarkB2B.tsx:67` hardcodea `setEntityNarrative(null)` — la sección "Narrativa Ejecutiva" siempre muestra el empty state, incluso con rankings reales cargados.

---

## 3. Flujos rotos / desconectados

**Ninguno encontrado** a nivel de routing. Todas las rutas declaradas en `src/App.tsx` (L78-160) apuntan a componentes existentes.

- `/b2b/*` → todas las 5 páginas existen y son lazy-loaded.
- `SignalsHub` → `ModuleEntry` → `ComingSoonModule` cierra correctamente cuando `status: 'soon'`.

El único caso degenerado es el `alert()` cosmético en `ComingSoonModule.tsx:144` (notado arriba).

---

## 4. Feature flags y gates

| Variable | Archivo:línea | Efecto |
| :--- | :--- | :--- |
| `VITE_FEEDBACK_WHATSAPP_ENABLED` | `FeedbackFab.tsx:9` | Botón FAB de feedback por WhatsApp |
| `VITE_ACCESS_GATE_ENABLED` | `accessGate.ts:4` | Gating de `/access` por código de invitación |
| `module.status === 'soon'` | `modulesConfig.ts` | Redirige al `ComingSoonModule` si el módulo no está listo |
| `role === 'admin' \|\| role === 'b2b'` | `DeepDiveB2B:16`, `BenchmarkB2B:22` | Desbloquea narrativa premium (en módulos donde existe) |

**No existe** un feature-flag granular para ocultar dinámicamente secciones B2B parciales. Todo o nada por rol.

---

## 5. Resumen ejecutivo

**Mayor riesgo de credibilidad si un cliente B2B ve la plataforma hoy:**

1. `ReportsB2B` presenta un "reporte ejecutivo" que **no es IA** sino interpolación de strings. Un cliente técnico lo detecta en la primera lectura. (ReportsB2B.tsx:61-79)
2. `BenchmarkB2B` muestra la tarjeta "Narrativa Ejecutiva" con placeholder permanente "No hay datos suficientes…" — el cliente no sabe si es bug, data insuficiente o feature incompleta. (BenchmarkB2B.tsx:67)
3. En B2C, módulos **soon** en el Hub invitan a interactuar pero la señal o no se persiste o se persiste sin feedback claro. Riesgo de "engagement fantasma".

**Top 3 acciones de mayor impacto para Fase 3.2:**

1. **B2C Hub** — El Bento Grid real (`hubSecondaryData.ts TRACKS`) expone sólo 5 tracks, no los 9 `MODULES`. El resto (`Pulso`, `Productos`, `NPS`) sólo son alcanzables por URL directa vía `ModuleEntry → ComingSoonModule`, así que no requieren cambios en el Hub; pero el CTA "Solicitar lanzamiento" ejecutaba `alert()` sin persistir nada. Acciones concretas:
   - `Lugares`, `Servicios` → etiqueta **Beta** visible en la tarjeta del Hub + disclaimer en la vista destino (datos/persistencia limitados). ✅ entregado en Fase 3.2.
   - `LugarSignalWizard` → reescribir success screen: copy honesto sobre estado Beta en lugar de "¡Señal Capturada!" falso. ✅ entregado.
   - `ComingSoonModule` CTA → reemplazar `alert()` por toast + `moduleInterestService.trackModuleInterestEvent(MODULE_INTEREST_CLICKED)` real. ✅ entregado.
   - `Profundidad` → verificar end-to-end en sprint siguiente (auditoría sugirió "Functional" pero no se confirmó persistencia RPC).
2. **`ReportsB2B`** — Banner Beta obligatorio al tope: "Formato demostrativo — la narrativa se genera por plantilla, no por IA". O gatear tras un feature-flag de admin. Pendiente Fase 3.2 B2B.
3. **`BenchmarkB2B`** — Remover la sección "Narrativa Ejecutiva" hasta que haya engine real, o reemplazarla por un `MetricAvailabilityCard` transparente. Pendiente Fase 3.2 B2B.

---

**Referencias clave:**

- [`src/features/feed/modulesConfig.ts`](../../src/features/feed/modulesConfig.ts) — módulos soon vs active
- [`src/features/b2b/pages/ReportsB2B.tsx`](../../src/features/b2b/pages/ReportsB2B.tsx) — narrativa interpolada L61-79
- [`src/features/b2b/pages/BenchmarkB2B.tsx`](../../src/features/b2b/pages/BenchmarkB2B.tsx) — `setEntityNarrative(null)` L67
- [`src/read-models/b2b/intelligenceAnalyticsReadModel.ts`](../../src/read-models/b2b/intelligenceAnalyticsReadModel.ts) — fallback L45
