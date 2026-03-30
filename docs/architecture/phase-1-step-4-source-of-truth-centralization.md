# Fase 1 / Paso 4: Centralización de la Gobernanza y Fuente de Verdad

*Fecha: 30 Mar 2026*

## Propósito
Este documento certifica la consolidación estructural de los modos de publicación analítica en Opina+. El objetivo principal fue erradicar la ambigüedad tipográfica y más críticamente **demostrar y conectar una única fuente de verdad persistida de punta a punta** (Admin -> Base de Datos -> Read Models -> Client).

## 1. Mapeo de la Única Fuente de Verdad (Single Source of Truth)

- **Source of truth REAL e irrefutable:** La tabla de base de datos **`results_publication_state`** en Supabase.
- **Type Contract Centralizado:** `PublicationMode = "real" | "curated" | "hybrid"` (alojado en `src/read-models/analytics/analyticsTypes.ts`).
- **Qué pasa si la base de datos está vacía o falla:** El contrato fuerza por defecto el modo `"curated"` para no exponer UI rota ni pretender falsos tráficos estadísticos sin configuración intencional.

## 2. Contradicciones Arquitectónicas Resueltas

Durante la demostración funcional final, se detectó y corrigió una inconsistencia monumental que bloqueaba la veracidad del sistema:
- **Admin Publicador Falso:** El servicio `analyticsReadService.publishResultsConfiguration` afirmaba enviar configuraciones a la herramienta de publicación, pero en la realidad *solo* insertaba/modificaba las métricas habilitadas en `analytics_surface_metric_config`. Ignoraba el estado del selector principal (`mode`), el título (`heroTitle`) y la visibilidad de los bloques.
- **Lectura B2B Falsa:** El servicio correspondiente que leía el estado (para pasárselo de vuelta al Admin panel para su edición) tenía hardcodeado `mode: "curated"`, `heroTitle: "Radiografía de la Opinión"`, rompiendo la persistencia de sesión a sesión.

## 3. Implementación Efectiva (Trazabilidad)

Se ha conectado al 100% el conducto de publicación:
1. **Admin persistiendo completo:** Cuando un Content Manager o Data Admin hace click en "Guardar y Publicar" dentro de `AdminResults.tsx`, el `analyticsReadService` ahora realiza dos transacciones reales a Supabase:
   - **Transacción 1:** INSERTA una línea de trazabilidad histórica en `results_publication_state` definiendo cómo y cuándo se publicó, inyectando el dictamen en las columnas jsonb `mode`, `hero_payload` y `blocks_visibility_payload`.
   - **Transacción 2:** UPSERT de configuraciones superficiales específicas en `analytics_surface_metric_config`.
2. **Admin leyendo real:** Al refrescar la página, el frontend de administración invoca a `getAdminResultsPublisherSnapshot`, el cual ahora lee directamente de `results_publication_state` ordenado por fecha de publicación.
3. **Frontend Cliente consumiendo real:** El Read Model B2C (`resultsCommunityReadModel.ts`) ejecuta exactamente el mismo SELECT al payload canónico en `results_publication_state` que antes existía, pero ahora por primera vez, dichos valores mutan en el ambiente si el Admin dictamina cambios.
4. **Clarificación Local (Runtime):** El flag frontend heredado `RESULTS_RUNTIME_MODE` en la capa visual fue purgado de su peso existencial. Ahora es meramente un default técnico inofensivo.

## 4. Archivos Intervenidos
1. `src/read-models/analytics/analyticsTypes.ts` *(Definición Central del Contrato Typado `PublicationMode`)*
2. `src/read-models/b2c/resultsCommunityTypes.ts` *(Alineación Tipográfica)*
3. `src/read-models/b2c/resultsCommunityReadModel.ts` *(Protección en adaptación y casteo desde DB)*
4. `src/features/results/config/resultsRuntime.ts` *(Remoción del falso candado local)*
5. `src/features/admin/pages/AdminResults.tsx` *(Corrección de selectores en UI)*
6. `src/services/analytics/analyticsReadService.ts` *(***Critical Fix***: Conexión estructural completa a Supabase Tables)*

## 5. Placeholders Remanentes e Identificación Explícita

- **Refresh de Analíticas:** La función `refreshAnalyticsRollups` dentro de `analyticsReadService.ts` fue rotulada explícitamente y sin ambigüedades. No reescribe base de datos, en cambio, emite e imprime: `[PLACEHOLDER - Awaiting Edge Function Connection]`. Nunca más prometerá que "El rollup tuvo éxito" si en el fondo no existe llamada a la API.

## 6. Confirmación de Cierre y Alineación (Fase 1 completada)

El entorno Frontend y B2C ahora cuenta con:
1. Una base de datos real dirigiendo el estado global de UI en Publicación B2C.
2. Contrato TypeScript universalizado e indoloro (`PublicationMode`).
3. Módulos que *ya no* alteran métricas mediante algoritmos aleatorios (`Math.random()`), habiéndose sustituido por Copywriting Editorial Honorable.
4. Completa gobernabilidad a través del Panel del Admin.

**La Fase 1 (Saneamiento e Inventario) queda oficialmente cerrada.** Todo bloque analítico es real, o está configurado institucional y explícitamente en el Admin como Curado.
