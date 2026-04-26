# Arquitectura — Time-travel queries sobre signal_events

> **Estado**: propuesta, no implementada.
> **Bloque**: B del roadmap de votación (B = _time-travel_, complementa al Bloque A = _integridad técnica_).
> **Fecha del documento**: 2026-04-24.
> **Decisión de producto (Juan, esta sesión)**: Modelo 3 — "todos los votos se guardan, solo el último pesa" + habilidad de consultar datos a fecha específica.

---

## Resumen ejecutivo

Hoy Opina+ guarda todos los votos en `signal_events` (event log). Los rankings se calculan contando **cada evento** como un voto independiente. Eso significa que si un usuario vota A, pasa el cooldown, y cambia a B, **ambos cuentan** — los KPIs están levemente inflados y no representan "qué prefiere cada usuario hoy".

Este documento propone:

1. **Deduplicar la lógica de agregación** para contar solo el voto más reciente de cada usuario por cada `signal_key` (batalla, pregunta, etc.).
2. **Habilitar consultas `as-of`** — preguntar "¿qué preferían al día X?" manteniendo todo el histórico.
3. **Exponer evolución temporal** como feature B2B de alto valor.

No requiere cambiar el modelo de datos (append-only se mantiene). Solo agregar capas de consulta y corregir los agregados.

---

## Qué pasa hoy vs. qué pasará después

### Hoy (estado actual)

```
Juan vota "Coca Cola" en battle:xyz  →  signal_events row #1
(5 min cooldown pasa)
Juan vota "Pepsi" en battle:xyz      →  signal_events row #2

v_comparative_preference_summary:
  Coca Cola: 1 win
  Pepsi:     1 win
  (Los dos cuentan)
```

### Después del Bloque B

```
(Mismas 2 filas en signal_events — nada se borra)

battle_preference_as_of('xyz', now()):
  Coca Cola: 0 votos actuales
  Pepsi:     1 voto actual (el último de Juan)

battle_preference_as_of('xyz', '2026-04-24 10:00'):
  Coca Cola: 1 voto (el primer voto de Juan era ese día)
  Pepsi:     0 votos (todavía no había cambiado)
```

**La magia**: todos los votos siguen guardados. El cálculo del "voto vigente" se hace al momento de la consulta.

---

## Cambios necesarios

### 1. Concepto canónico de `signal_key` (nuevo)

Una clave que identifica unívocamente "la cosa sobre la que el usuario opinó". Propuesta de formato:

| Módulo | signal_key | Derivación desde `signal_events` |
|---|---|---|
| VERSUS | `battle:<battle_id>` | `battle_id` |
| ACTUALIDAD | `actualidad:<topic_id>:<question_id>` | `context_id` (topic) + `value_json->>'question_id'` |
| PROFUNDIDAD | `depth:<entity_id>:<question_code>` | `entity_id` + `value_json->>'question_code'` |
| TORNEO | `torneo:<battle_id>:<round>` | `battle_id` + `value_json->>'round'` |
| PULSO | `pulso:<user_id>:<YYYY-MM-DD>` | `user_id` + `DATE(created_at)` |

Se implementa como **función inmutable** en Postgres:

```sql
CREATE OR REPLACE FUNCTION public.signal_key_for(se signal_events)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE se.module_type
    WHEN 'versus'     THEN 'battle:' || se.battle_id::text
    WHEN 'actualidad' THEN 'actualidad:' || se.context_id || ':' || (se.value_json->>'question_id')
    WHEN 'profundidad'THEN 'depth:' || se.entity_id::text || ':' || (se.value_json->>'question_code')
    WHEN 'torneo'     THEN 'torneo:' || se.battle_id::text || ':' || (se.value_json->>'round')
    WHEN 'pulso'      THEN 'pulso:' || se.user_id::text || ':' || to_char(se.created_at, 'YYYY-MM-DD')
    ELSE 'unknown:' || se.id::text
  END;
$$;
```

**Alternativa**: agregar columna generada `signal_key text GENERATED ALWAYS AS (...) STORED` para indexar directamente. Más rápido en queries pero requiere migración.

### 2. Funciones "as-of" (nuevas)

```sql
-- Voto vigente de un usuario para un signal_key a la fecha X
CREATE FUNCTION public.user_vote_as_of(
  p_user_id uuid,
  p_signal_key text,
  p_as_of timestamptz DEFAULT now()
) RETURNS signal_events AS $$
  SELECT se.*
  FROM signal_events se
  WHERE se.user_id = p_user_id
    AND signal_key_for(se) = p_signal_key
    AND se.created_at <= p_as_of
  ORDER BY se.created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Share de preferencia por option a una fecha
CREATE FUNCTION public.battle_preference_as_of(
  p_battle_id uuid,
  p_as_of timestamptz DEFAULT now()
) RETURNS TABLE (
  option_id uuid,
  vote_count bigint,
  share_pct numeric
) AS $$
  WITH latest_per_user AS (
    SELECT DISTINCT ON (user_id)
      user_id, option_id, created_at
    FROM signal_events
    WHERE battle_id = p_battle_id
      AND created_at <= p_as_of
      AND user_id IS NOT NULL
    ORDER BY user_id, created_at DESC
  )
  SELECT
    option_id,
    count(*)::bigint AS vote_count,
    round(count(*) * 100.0 / sum(count(*)) OVER (), 2) AS share_pct
  FROM latest_per_user
  GROUP BY option_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Ranking de entidades a una fecha (top N)
CREATE FUNCTION public.entity_ranking_as_of(
  p_as_of timestamptz DEFAULT now(),
  p_category_slug text DEFAULT NULL,
  p_limit int DEFAULT 20
) RETURNS TABLE (
  entity_id uuid,
  entity_name text,
  wins bigint,
  losses bigint,
  preference_share numeric
) AS $$
  -- implementación similar, usando DISTINCT ON (user_id, battle_id) para dedup
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 3. Agregados deduplicados (modificar)

La función `refresh_daily_aggregates` actual cuenta `signals_count` bruto. Hay que crear una versión paralela (o reemplazar) que para cada día `D` calcule:

**Para cada (entity_id, user_id), contar solo el voto más reciente antes de fin de `D`.**

Propuesta: crear tabla nueva `entity_daily_aggregates_dedup` con la misma estructura pero lógica distinta, y migrar la UI a leerla. Después de validación, renombrar.

Esto permite **no romper los dashboards actuales** durante la migración.

### 4. API / Read-model (modificar)

Los servicios que hoy no aceptan parámetro temporal (`metricsService.getGlobalLeaderboard`, etc.) deben aceptar `asOf?: Date` opcional:

```typescript
// Antes
getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]>

// Después
getGlobalLeaderboard(opts: { limit?: number; asOf?: Date } = {}): Promise<LeaderboardEntry[]>
```

Internamente: si `asOf` viene, llama a `entity_ranking_as_of(asOf, ...)`. Si no, llama al ranking de hoy (que internamente también es `as_of(now())`).

### 5. UI (nuevo)

Dos features visibles:

**A. Date picker en rankings**
Un selector arriba de cada tabla: "Hoy" / "Hace 7 días" / "Hace 30 días" / "Fecha custom".
Cambia el `asOf` del fetch y re-consulta.

**B. Comparativo side-by-side (opcional pero valioso)**
Dos rankings pegados: "Hoy" vs "Hace X". Flechas indicando quién subió/bajó.

---

## Fases de implementación

| Fase | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|
| **B.1** | Crear `signal_key_for()` + índices + tests | 0.5 día | — |
| **B.2** | Funciones `as_of` para voto, battle, ranking | 1 día | B.1 |
| **B.3** | Tabla `entity_daily_aggregates_dedup` + `refresh_daily_aggregates_dedup` + backfill | 1 día | B.1, B.2 |
| **B.4** | Validar números con rollups actuales (smoke test de datos) | 0.5 día | B.3 |
| **B.5** | Extender `metricsService` con `asOf`. RPCs nuevos. | 0.5 día | B.2 |
| **B.6** | Date picker en rankings B2C | 1 día | B.5 |
| **B.7** | Comparativo side-by-side (opcional) | 1 día | B.6 |
| **B.8** | Cortar vistas antiguas, redirigir todo a las nuevas | 0.5 día | B.6 |

**Total: 5-6 días.** Dividibles en 2-3 sesiones.

---

## Riesgos y mitigaciones

### Riesgo 1: Los números van a cambiar.

Si hoy un usuario tiene 2 votos en la misma battle, los rankings actuales lo cuentan doble. Después del Bloque B, lo cuentan una vez. **Los números visibles van a bajar** en entidades donde hay muchos usuarios con votos múltiples.

**Mitigación**:
- Fase B.4: comparar números antes/después con un reporte. Si hay diferencias grandes (>5%), avisar stakeholders antes de cortar.
- Mantener `v_comparative_preference_summary` (versión legacy) activa en paralelo por 30 días post-deploy.

### Riesgo 2: Performance.

`DISTINCT ON (user_id)` con filtro temporal requiere escaneo completo. Para battles con 10k votos, es lento.

**Mitigación**:
- Índice compuesto `(battle_id, user_id, created_at DESC)` — ya existe parcialmente.
- Cache en rollups: las queries "hoy" leen `entity_daily_aggregates_dedup` (ya calculado). Solo las queries "as-of fecha custom" van al raw.
- Materializar snapshots diarios.

### Riesgo 3: La signal_key no cubre todos los casos.

Si un módulo futuro no encaja en las 5 categorías listadas, la function devuelve `'unknown:<uuid>'` y los votos no se agregan.

**Mitigación**:
- Test que verifique cobertura: contar cuántos rows en `signal_events` quedan con `signal_key LIKE 'unknown:%'`.
- Gate de deploy: si hay >1% en "unknown", ampliar la función antes.

### Riesgo 4: Los tests E2E actuales asumen comportamiento "cada voto cuenta".

**Mitigación**:
- Revisar suite Playwright antes del corte. Los tests que validen números de preferencia pueden romper.

---

## Valor de negocio

### Lo que hoy puedes decirle a un cliente B2B

> "Hoy, 55% de los chilenos prefiere la marca A sobre la marca B."

### Lo que vas a poder decirle después del Bloque B

> "El 55% actual prefiere A. Pero hace 30 días era 62%. La caída se concentra en mujeres 25-34 de la RM. La migración hacia B coincide con tu campaña del 15 de marzo."

La segunda frase **vale 10x** la primera. Es la diferencia entre vender una foto y vender una película.

---

## Decisiones de producto (RESUELTAS 2026-04-24)

### Decisión 1 — Alcance del time-travel por tipo de usuario

**Ambos pueden viajar en el tiempo, con UX diferenciada.**

- **B2C (usuario regular)**: botones preset fijos.
  ```
  [ Hoy ] [ Semana pasada ] [ Mes pasado ] [ 3 meses ] [ 6 meses ] [ 1 año ]
  ```
  Simple, un click.

- **B2B / Admin**: date picker libre con rango custom (fecha inicio, fecha fin).
  Soporta comparativos y análisis profundos.

**Implementación**: renderizar un componente distinto según `user.role` (`b2c` vs `b2b` / `admin`).

---

### Decisión 2 — Semántica de los botones temporales

**Todos los rankings muestran "foto acumulada del estado" a la fecha consultada**, NO una ventana de tiempo.

- "Hoy" = estado acumulado hasta ahora (as_of = now()).
- "Semana pasada" = estado acumulado tal como era hace 7 días (as_of = now() - 7 days).
- "Mes pasado" = estado acumulado tal como era hace 30 días.
- Etc.

**Por qué esto importa técnicamente**: toda la lógica es `as_of(timestamp)`. No existe el concepto de "ventana de X días". Los agregadores deduplican siempre al último voto ≤ as_of.

---

### Decisión 3 — Límite temporal hacia atrás

- **B2C**: máximo 1 año atrás. Los botones preset ya limitan naturalmente.
- **B2B / Admin**: sin límite. El date picker permite cualquier fecha, incluso pre-lanzamiento.
- Si B2B consulta una fecha sin datos, mostrar mensaje: *"No hay datos registrados para esta fecha. La plataforma comenzó a registrar datos el DD/MM/YYYY."*

---

### Decisión 4 — Historial personal en el perfil del usuario

En la pantalla "Mi perfil → Mis votos":

- **Por default**: solo se muestra el voto actual por battle/pregunta (coherente con Modelo 3).
- **En un click**: link tipo *"Ver historial de cambios"* que expande una línea de tiempo mostrando:
  ```
  Sodimac vs Easy
  ├── 10 mar → Sodimac
  ├── 20 mar → Easy (cambio)
  └── 5 abr → Sodimac (cambio)
  ```

**No afecta rankings ni dashboards B2B** (ahí siempre se aplica Modelo 3 al as_of consultado).

**Potencial bonus**: gamification/contenido compartible a futuro — "En 2026 cambiaste de opinión 42 veces".

---

## Implicancias de estas decisiones en las fases

| Fase | Cambio por decisiones |
|---|---|
| B.1 (signal_key) | Sin cambios. |
| B.2 (funciones as_of) | Sin cambios. |
| B.3 (rollups dedup) | Sin cambios. |
| B.4 (validación) | Sin cambios. |
| B.5 (API/read-models) | Agregar parámetro `asOf: Date` (obligatorio) a todas las queries de ranking. Por default `now()`. |
| **B.6 (UI B2C)** | Componente `TimeFilterPresets` con los 6 botones fijos. |
| **B.6 (UI B2B)** | Componente `TimeFilterRangePicker` con date picker libre. |
| **B.6 (Perfil)** | Componente `UserVoteHistoryItem` que colapsa historial por default y expande en click. |
| **B.6 (Mensaje vacío)** | Handler para respuesta vacía con mensaje: *"No hay datos..."* |
| B.7 (comparativo) | Solo B2B. Dos date pickers lado a lado. |
| B.8 (corte) | Sin cambios. |

---

## Siguiente acción sugerida

En una sesión dedicada (no mezclar con otros cambios):

1. Revisar este documento con contrapartes (tú + eventuales stakeholders).
2. Validar las decisiones pendientes de arriba.
3. Arrancar por **Fase B.1** (crear `signal_key_for` — bajo riesgo, sin impacto visible).
4. Avanzar a B.2 y B.3 en la misma sesión si da tiempo.
5. Cortar el deploy al final con Fase B.4 (smoke test de números).

**Estimado por sesión**:
- Sesión 1 (4-5h): B.1 + B.2 + B.3 + B.4 (todo el backend base).
- Sesión 2 (3-4h): B.5 + B.6 (API + UI).
- Sesión 3 opcional (3-4h): B.7 (comparativo).

---

## Referencias al código actual

- Event log: `supabase/migrations/20260312000000_consolidated_baseline.sql` — `CREATE TABLE signal_events`.
- RPC actual: `supabase/migrations/20260325000000_extend_insert_signal_event_v14.sql` — `insert_signal_event`.
- Vista actual: `supabase/migrations/20260313220000_fix_results_views.sql` — `v_comparative_preference_summary`.
- Agregador actual: `supabase/migrations/20260312000000_consolidated_baseline.sql` — `refresh_daily_aggregates`.
- Snapshot actual: `supabase/migrations/20260312000000_consolidated_baseline.sql` — `generate_entity_rank_snapshots`.
- Consumo cliente: `src/features/metrics/services/metricsService.ts`, `src/read-models/analytics/metricResolvers.ts`.
