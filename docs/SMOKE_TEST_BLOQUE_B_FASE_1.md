# Smoke test — Bloque B Fase 1 (signal_key + funciones as_of)

> **Cuándo correr esto**: después de aplicar la migración `20260424000000_bloque_b_signal_key_and_as_of.sql` en Supabase.
> **Dónde**: SQL Editor de Supabase Dashboard.
> **Tiempo**: 5-10 minutos.
> **Objetivo**: validar que la función `signal_key_for` cubre todos los módulos y que las funciones `as_of` devuelven datos razonables.

---

## Test 1 — Cobertura de módulos en signal_key

Verificar que ningún `signal_event` cae en `unknown:*`.

```sql
SELECT
  module_type,
  count(*) AS events,
  count(*) FILTER (WHERE public.signal_key_for(signal_events.*) LIKE 'unknown:%') AS en_unknown
FROM public.signal_events
GROUP BY module_type
ORDER BY events DESC;
```

**Esperado**: columna `en_unknown` debe ser 0 en cada fila. Si hay valores >0, hay un `module_type` nuevo no contemplado — avísame para ampliar la función.

---

## Test 2 — Ejemplos concretos de signal_key por módulo

Ver algunos ejemplos reales para que tengas intuición visual.

```sql
SELECT
  module_type,
  public.signal_key_for(signal_events.*) AS signal_key,
  count(*) AS events,
  count(DISTINCT COALESCE(user_id::text, anon_id)) AS unique_voters
FROM public.signal_events
GROUP BY module_type, signal_key
ORDER BY events DESC
LIMIT 15;
```

**Esperado**: lista de signal_keys con formato esperado. Por ejemplo:
- `versus:a1b2c3...` (un battle_id UUID)
- `news:entityid:question_code`
- `depth:entityid:attribute_key`

Si alguna signal_key se ve rara (doble ":", vacía, etc.), avísame.

---

## Test 3 — Detectar usuarios con múltiples votos a la misma signal_key

Este test responde: **¿cuántos usuarios están "votando múltiples veces lo mismo"?** Los que aparezcan aquí son los que hoy están inflando los KPIs.

```sql
WITH user_votes AS (
  SELECT
    COALESCE(user_id::text, anon_id) AS voter,
    public.signal_key_for(signal_events.*) AS skey,
    count(*) AS votes_count
  FROM public.signal_events
  GROUP BY voter, skey
  HAVING count(*) > 1
)
SELECT
  votes_count,
  count(*) AS users_affected
FROM user_votes
GROUP BY votes_count
ORDER BY votes_count DESC
LIMIT 20;
```

**Esperado**: distribución de "cuántos usuarios votaron X veces la misma cosa".

- Si todos los usuarios tienen 1 vote por signal_key → no hay duplicados, los KPIs actuales son exactos.
- Si hay muchos usuarios con 2-3 votos → los KPIs actuales están inflados.
- Si hay usuarios con 10+ votos → bug o abuso que hay que investigar.

**Por favor pégame el resultado de este test** — es el dato que necesito para saber cuánto se van a mover los números cuando apliquemos el Bloque B.3.

---

## Test 4 — Validar que battle_preference_as_of devuelve datos

Tomar una battle popular y ver los shares actuales.

```sql
-- Primero encontrar una battle con muchos votos
SELECT
  se.battle_id,
  b.slug,
  count(*) AS total_events,
  count(DISTINCT COALESCE(se.user_id::text, se.anon_id)) AS unique_voters
FROM public.signal_events se
JOIN public.battles b ON b.id = se.battle_id
WHERE se.module_type = 'versus'
GROUP BY se.battle_id, b.slug
ORDER BY total_events DESC
LIMIT 5;
```

Copiar un `battle_id` del resultado y pegarlo en la siguiente query:

```sql
SELECT * FROM public.battle_preference_as_of(
  'PEGAR_UN_BATTLE_ID_AQUI'::uuid,
  now()
);
```

**Esperado**: una fila por cada `option_id` con su `vote_count` y `share_pct`. La suma de `share_pct` debe ser ~100 (puede haber leve decimal por redondeo).

---

## Test 5 — Comparar ranking dedupeado vs ranking actual

El test más importante: ver la diferencia entre "como cuenta hoy" y "como contará después".

### Ranking actual (con duplicados)

```sql
SELECT
  entity_name,
  wins_count,
  losses_count,
  total_comparisons,
  preference_share
FROM public.v_comparative_preference_summary
ORDER BY preference_share DESC
LIMIT 10;
```

### Ranking dedupeado (nuevo)

```sql
SELECT * FROM public.entity_ranking_as_of(now(), NULL, 10);
```

**Comparar los dos**: las mismas entidades deberían aparecer (aunque en orden levemente distinto) y con números **menores o iguales** en el dedupeado.

- Si los números son idénticos → no hay duplicados, el sistema estaba limpio (bueno).
- Si los números son menores en dedupeado → diferencia esperada, es el ajuste correcto (esperado).
- Si las entidades aparecen muy distintas → algo está mal, revisar.

**Por favor pégame las dos tablas** para que las comparemos juntos.

---

## Test 6 — Time-travel funcionando: comparar "ahora" vs "hace 7 días"

```sql
-- Hace 7 días
SELECT 'Hace 7 días' AS momento, entity_name, preference_share, total_comparisons
FROM public.entity_ranking_as_of(now() - interval '7 days', NULL, 5)

UNION ALL

-- Ahora
SELECT 'Ahora' AS momento, entity_name, preference_share, total_comparisons
FROM public.entity_ranking_as_of(now(), NULL, 5)

ORDER BY momento, preference_share DESC;
```

**Esperado**:
- 10 filas (top 5 de cada momento).
- Los números "ahora" son >= a los de "hace 7 días" en `total_comparisons` (porque hay más votos acumulados).
- Los `preference_share` pueden subir o bajar según la evolución.

Si un `entity_name` no aparece en "Hace 7 días" pero sí "Ahora" → es una entidad nueva que acumuló votos en la última semana. Normal.

---

## Test 7 — Historial personal (para la UI del perfil)

Necesitas un `user_id` y una `signal_key` que conozcas. Ejemplo:

```sql
-- Encontrar un usuario con múltiples votos
SELECT
  COALESCE(user_id::text, anon_id) AS voter,
  public.signal_key_for(signal_events.*) AS skey,
  count(*) AS n
FROM public.signal_events
WHERE user_id IS NOT NULL
GROUP BY voter, skey
HAVING count(*) >= 2
ORDER BY n DESC
LIMIT 5;
```

Copiar un `voter` (user_id) y una `skey`, pegarlos en:

```sql
SELECT * FROM public.user_vote_history_for(
  'USER_ID_AQUI'::uuid,
  'SIGNAL_KEY_AQUI'
);
```

**Esperado**: filas ordenadas cronológicamente, con `is_current = true` en la última fila.

---

## Checklist de validación

Marca cada uno cuando pase:

- [ ] Test 1: 0 filas en `unknown:*` para cada módulo.
- [ ] Test 2: signal_keys tienen formato reconocible.
- [ ] Test 3: número razonable de usuarios con duplicados (pegar resultado).
- [ ] Test 4: `battle_preference_as_of` devuelve shares que suman ~100.
- [ ] Test 5: ranking dedupeado tiene entidades similares al actual, con números menores o iguales (pegar ambas tablas).
- [ ] Test 6: time-travel muestra evolución entre "ahora" y "hace 7 días".
- [ ] Test 7: historial personal con `is_current = true` en el último voto.

---

## Si algo falla

- Error tipo `function signal_key_for does not exist` → la migración no se aplicó. Correr de nuevo.
- Error tipo `permission denied` → el rol actual no tiene GRANT. Usar el SQL Editor del Dashboard (que corre como `postgres`).
- Resultados vacíos donde esperabas datos → revisar que la tabla `signal_events` tenga filas para ese módulo.

---

## Siguiente paso después de estos tests

Si todos pasan:
1. La Fase 1 del Bloque B está estable en backend.
2. Pasamos a **Fase B.3** (agregador dedupeado + backfill + validación de números).
3. Después **Fase B.5 + B.6** (API + UI).
