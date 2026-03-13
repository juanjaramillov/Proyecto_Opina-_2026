# Inteligencia B2B - Configuración y Definición (V13)

La capa de Inteligencia Comercial B2B (`src/features/b2b/`) representa el empaquetado del análisis de Opina+ como un producto para clientes empresariales. Esta capa aísla la experiencia orientada a marca y mercado (Rankings, Momentum, Narrativas) del panel administrativo interno del sistema (Health, Logs, DAU).

## Arquitectura

El Dashboard B2B se sitúa dentro de la jerarquía global pero restringido bajo roles configurados `b2b` o `admin`. Funciona consumiendo los tres motores principales creados en pasos previos:

1. **`metricsService` (El Dato Crudo)**: Provee estadísticas volumétricas, rankings (Global Leaderboard) y resúmenes de variación (WoW).
2. **`alertEngine` (La Detección Automática)**: Provee un dataset accionable de anomalías y alertas activas del mercado con indicadores de severidad (INFO, WARNING, CRITICAL).
3. **`narrativeEngine` (La Capa de Síntesis y Explicación)**: Expone textos generados orientados al ejecutivo (*IntelligenceText*) transformando las señales del motor de alertas en insights asimilables por stakeholders de marca.

### Estructura de la Suite B2B (`/b2b/*`)
Con la productización real de la capa comercial, la experiencia ya no vive en una única pantalla monolítica, sino que se distribuye bajo un `B2BLayout` con navegación dedicada:

- **`/overview` (`OverviewB2B`)**: Tablero principal compuesto de KPIs agregados (Volumen, Aceleración, Caída) y un feed resumido de las últimas alertas tempranas del mercado.
- **`/benchmark` (`BenchmarkB2B`)**: Panel profundo de competitividad. Muestra el ranking global filtrable por entidad, su win rate y volumen interactivos.
- **`/alerts` (`AlertsB2B`)**: Feed centralizado y detallado del `alertEngine`. Permite filtrar anomalías y picos de tendencia por severidad e impacto.
- **`/deep-dive` (`DeepDiveB2B`)**: Vista explícita para el escrutinio de una entidad o marca en particular. Expone su información dura (Win Rate Relativo, Volumen Consolidado) empoderada de inmediato por una Narrativa Ejecutiva generada algorítmicamente desde el `narrativeEngine`.
- **`/reports` (`ReportsB2B`)**: Módulo (actualmente en fase Beta/Coming Soon) orientado a la exportación de inteligencia accionable en PDFs y formatos listos para la junta C-Level.

---

## Separación de Responsabilidades

Antes de la iteración de Inteligencia Comercial B2B en V13, los indicadores puros de mercado se encontraban empaquetados junto al comportamiento a nivel de aplicación (AntiFraud, DAU, Logs) dentro de `src/features/intelligence/IntelligencePage.tsx`.

### El Nuevo Estado B2B
El subdominio `/b2b` (que erradica la vieja ruta única `/intelligence-dashboard`) se apropia exclusivamente del reporte comportamental del mercado que se monetizará para las marcas registradas. Está blindado por el componente con verificación de rol `RoleProtectedRoute allowedRoles={['admin', 'b2b']}`.

### El Nuevo Estado Administrativo
Lo concerniente enteramente a operaciones (Suspicious Users, Health Checks de infraestructura, Volumen agregado general enfocado al rendimiento de negocio, etc.) reside netamente a disposición del rol `admin` y fue retirado de la interfaz B2B para mantener la privacidad y enfoque corporativo del nuevo producto (accesado mediante `/admin/system`). 

---

## Escalabilidad del Motor B2B
La capa es modular desde su raíz, delegando las llamadas `async` a funciones de servicio aisladas (`loadData()`, `handleSelectEntity()`).
Las mejoras sugeridas para etapas posteriores de comercialización son:
1. **Reportes Exportables**: Creación de un servicio para exportar Deep Dives u Overviews enteros en PDF (`printMedia()`).
2. **Alertas a Discreción de Dominio**: Filtrar `alerts[]` para que un cliente B2B visualice exclusivamente los movimientos que atañan a sus competidores o dominios (ej: `entity.domain === 'Food & Beverage'`).
3. **Dashboards Personalizados**: Habilidad de hacer drag-n-drop o 'pin' de ciertas entidades o alertas al top global corporativo en caso el rol logeado sea de `b2b`.
