# Sistema de Alertas y Señales Tempranas (V13)

## 1. Definición del Alert Engine
El **Alert Engine** de Opina+ transforma la lectura pasiva de métricas históricas y temporales en un sistema proactivo. 
En lugar de depender exclusivamente de que el usuario vea un salto en gráficos comparativos, el motor identifica de forma automática (On-Demand) comportamientos que cumplen con los requisitos de negocio para generar "ruido" justificado.

El motor reside en `src/features/metrics/alerts/alertEngine.ts` y exporta la función principal `alertEngine.getActiveAlerts()`.

## 2. Taxonomía Oficial de Alertas V13

El sistema distingue entre las siguientes Alertas de Negocio (Categorías):

| Categóría | Significado Técnico | Regla Dinámica / Umbral | Severidad Típica |
|---|---|---|---|
| **`STRONG_ACCELERATION`** | Un elemento que en los últimos 7 días experimentó un crecimiento súbito. | Crecimiento WoW >= 30% **Y** al menos 15 señales actuales (Suficiencia). | `WARNING` o `CRITICAL` (>100%) |
| **`RELEVANT_DROP`** | Entidad que de pronto deja de ser discutida de forma dramática frente a su antecedente útil. | Caída WoW <= -30% **Y** al menos 15 señales en el marco previo (Suficiencia). | `INFO` |
| **`POLARIZATION_SPIKE`** | Batalla apretada y sostenida en el tiempo que refleja enorme fragmentación en la audiencia. | *Win Rate* atrapado entre 45% y 55% **Y** más de 50 menciones recientes. | `WARNING` o `CRITICAL` (>100 sig.) |
| **`EARLY_SIGNAL`** | [EN CONSTRUCCIÓN] Detección de tema emergente viral de muy rápido encendido (<24h). | Volumetría acelerada vs ventana homóloga inmediata. | `WARNING` |

## 3. Principio de Suficiencia
No toda variación porcentual alta es una alerta. Para que Opina+ no se indunde de alertas falsas ("ruido temporal"), todas las alertas integran el principio de **Suficiencia de Muestra**. Un incremento de +500% en una marca que pasó de tener 1 a 6 menciones es descartado. Un crecimiento del 30% en una marca con 15 a 20 menciones sí gatilla una alerta.

## 4. Severidad y Visibilidad

- **`INFO` (Prioridad Baja):** Situaciones para armar contexto (e.g. descensos naturales post-virales). Válidas para tableros de Inteligencia profundos.
- **`WARNING` (Prioridad Media):** Alerta relevante, útil para contenido de `Actualidad` o temas editoriales de interés súbito.
- **`CRITICAL` (Prioridad Alta):** Quiebres del status quo extremo. Útil para lanzar notificaciones Push B2B en un futuro, o resaltar urgentemente al administrador de contenido.

## 5. Implementación Dinámica
Por razones de optimización y reducción de carga operativa (evitando Cron Jobs asíncronos), la generación de alertas crudas a nivel sistema se evalúa **ON-DEMAND**. El código procesa directamente el catálogo actual extraido desde SQLite Views (`v_trend_week_over_week`, `v_comparative_preference_summary`) al momento en que `alertEngine.getActiveAlerts()` es invocado.

Las alertas son orquestadas como una API interna que alimentará:
- Back-office (Admin).
- Módulo de Inteligencia (B2B dashboards).
- [Opcional] Selección Editorial para el feed público de Actualidad.
