# Estado de Integración de Capa Resultados (User-Facing)

**Fecha:** Marzo 2026
**Objetivo:** Rediseñar la sección "Resultados" (B2C) para que consuma eficientemente los nuevos Read Models (`public.signal_events`) sin exponer la profundidad analítica asignada a la nueva capa Inteligencia (B2B).

## Componentes y Servicios Creados

### 1. Servicios B2C (Data Fetching)
Los servicios de lectura se programaron de forma aislada en `src/lib/results/` para mantener una clara separación de la capa Legacy actual y conectar directo a los nuevos views:

- **`getResultsLeaderboard.ts`:**
  - Consume: `v_comparative_preference_summary`
  - Propósito: Extrae el Top de las entidades con la mayor tracción neta acumulada (Net Win Rate) validando suficiente representatividad.
- **`getResultsComparisonSummary.ts`:**
  - Consume: `v_comparative_preference_summary`
  - Propósito: (Actualmente mock estructural anónimo) Muestra al usuario comparaciones cualitativas sobre si interactúa como la mayoría agregada.
- **`getResultsTrendSummary.ts`:**
  - Consume: `v_signal_entity_period_summary`
  - Propósito: Refleja tendencias visuales sobre qué entidades están liderando el interés de la semana presente en el ecosistema.
- **`getResultsModuleHighlights.ts`:**
  - Consume: `v_comparative_preference_summary` y `v_depth_entity_question_summary`.
  - Propósito: Sirve highlights estelares intermódulo sin necesidad de profundizar.

### 2. Capa UI Refactorizada
- **`src/features/results/pages/Results.tsx`:**
  - Desacoplado del acceso y cálculo complejo en frontend, operando limpiamente consumiendo los hooks/Promises previas.
  - Diseño enfocado en el "wow-factor": Estilo premium, limpio y de lectura rápida (Snackable).
  - Incluye:
    - Leaderboard Card interactivo (Win Rate y Share).
    - Componente SVG temporal de curva de tendencias (Mock gráfico temporal rápido en UI).
    - Module Highlights sidebar.
    - Se agregaron barreras funcionales visuales (Notificación explícita sobre que se trata de lectura agregada "Parcial", mientras la multi-dimensional se queda en "Intelligence B2B").

## Reglas de Exposición Aplicadas
Según lo definido en el [Contrato User Layer](./results-user-layer-contract.md) y [Reglas de Exposición B2C](./results-exposure-rules.md):

- **[Sí] Rankings Simples:** Top Entities por Win Rate.
- **[Sí] Highlights inter-módulo y Resúmenes Temporales "Hoy/Semana".**
- **[No] Pivotales Demográficos en Frontend (Cortes profundos).**
- **[No] Accesos directos a subconsultas relacionales en Supabase para cruce cruzado manual.**

## Deudas y Siguientes Pasos (Next)

1. **Resolución Anon vs Profile en Results:** Implementar lógica explícita en el paso de usuario anónimo frente a usuario loggeado conectando el ID de perfil a las funciones que cruzan la preferencia personal y colectiva (ej: `getResultsComparisonSummary`).
2. **Read Models en Tiempo Real:** Optimizar vistas `v_` o evaluar vistas materializadas (con refresco via cronpg) si el volumen de interacciones supera umbrales lentos de respuesta front, de modo que `Results` permanezca <200ms TTFB.
3. **Módulo Tu Pulso - Highlight Dinámico:** Requerirá estandarizar las keys generadas por "Tu Pulso" para que la función de highlights extraiga insights lógicos válidos consistentemente.

---
*Fin del reporte.*
