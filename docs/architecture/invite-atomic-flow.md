# Flujo atómico de invitaciones (claim tentativo)

> **Estado**: vigente desde migración `20260424000000_invite_atomic_lock_and_cleanup.sql`.
> **Cierra**: #4 Alta de la auditoría técnica Drimo — "Transacción + cleanup en invitaciones".

## Por qué existía el problema

Antes de esta migración `grant_pilot_access(code)`:
1. Validaba el código con `validate_invitation` (solo lee, sin lock).
2. Seteaba `access_granted=true` en `auth.users.raw_app_meta_data` del uid actual.
3. **No reservaba nada.** El código quedaba `status='active'` disponible para cualquier otra sesión.

Como el consumo real del código ocurre recién en `bootstrap_user_after_signup_v2` (cuando el usuario completa perfil), existía una ventana donde:

- Usuario A ingresa `OP-ABC123` → JWT `access_granted=true`, código libre.
- Usuario A abandona el onboarding.
- Usuario B ingresa el mismo `OP-ABC123` → también JWT `access_granted=true`.
- Solo uno consume el código al completar perfil; el otro queda con JWT de acceso **sin perfil asociado** — "huésped fantasma" que puede navegar `/signals` etc. sin estar registrado.

## Solución

El claim se hace en **dos fases** sobre las columnas existentes `claimed_by` / `claimed_at` de `invitation_codes` (ya tienen un índice UNIQUE parcial: `idx_invitation_codes_claimed_by_unique`):

```
  AccessGate                 Onboarding                 Cron / Edge Fn
 ┌──────────────┐          ┌──────────────────┐       ┌────────────────────────────┐
 │ grant_pilot_ │          │ bootstrap_user_  │       │ release_stale_invite_claims│
 │   access     │          │ after_signup_v2  │       │        (cada 30 min)       │
 └──────┬───────┘          └─────────┬────────┘       └──────────────┬─────────────┘
        │ SELECT FOR UPDATE          │ SELECT FOR UPDATE             │ UPDATE invitation_codes
        │ → claim tentativo          │ → validar claim               │   claimed_by = NULL
        │   claimed_by=uid           │   (claimed_by = NULL          │   WHERE claimed_at < now() - TTL
        │   claimed_at=now()         │    OR claimed_by = uid)       │
        │                            │ → consumir:                   │ + revocar access_granted en
        ▼                            │   status='used',              │   auth.users si NO hay
  JWT access_granted=true            │   used_by_user_id=uid,        │   user_profiles del claimed_by
                                     │   current_uses++              │
```

### Invariantes

1. **Para `max_uses = 1`**: en cualquier momento, a lo sumo **un** `claimed_by` activo dentro del TTL. Los intentos concurrentes ven el lock y el que llega segundo ve el claim previo → retorna `false`.
2. **`bootstrap_user_after_signup_v2` respeta el claim**: si `claimed_by` no es NULL ni igual al uid actual, devuelve `INVITE_INVALID` aunque el usuario traiga `access_granted=true` en el JWT (ese JWT ya no sirve para ese código).
3. **Saneador**: cada vez que corre el cron (o la Edge Function `cleanup-orphan-users`), se liberan los claims > TTL sin consumir y se revoca `access_granted` del JWT si el usuario no tiene fila en `public.user_profiles`.

### Por qué usar `claimed_by` y no una columna nueva

La tabla `invitation_codes` ya tenía estas columnas desde el baseline (creadas originalmente para `consume_invitation`, que sí las marcaba al incrementar `current_uses`). Antes de esta migración `grant_pilot_access` las ignoraba por completo. Reutilizarlas evita un `ALTER TABLE` en producción y mantiene intacto el índice único parcial que ya protege contra doble-claim por uid distinto.

## Funciones tocadas

| Función                                 | Cambio                                                                 |
|-----------------------------------------|------------------------------------------------------------------------|
| `grant_pilot_access(p_code)`            | `SELECT FOR UPDATE` + claim tentativo con TTL 30 min, idempotente para el mismo uid. |
| `bootstrap_user_after_signup_v2(…)`     | `SELECT FOR UPDATE` al buscar el código + validación de `claimed_by`. |
| `release_stale_invite_claims(ttl)`      | Nueva — libera claims > TTL y revoca `access_granted` de JWT huérfano. |
| Edge Function `cleanup-orphan-users`    | Invoca `release_stale_invite_claims` al inicio de cada corrida (excepto en `dry_run`). |

## Cómo operarlo

### Ad-hoc desde SQL Editor (service_role)

```sql
SELECT public.release_stale_invite_claims(30);
```

Respuesta:

```json
{
  "ok": true,
  "ttl_minutes": 30,
  "released_claims": 2,
  "revoked_access_grants": 1
}
```

### Vía Edge Function (manual o desde Admin Health)

```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/cleanup-orphan-users' \
  -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"older_than_hours": 24, "claim_ttl_minutes": 30, "dry_run": false}'
```

La respuesta ahora incluye `stale_invite_claims: { released_claims, revoked_access_grants }`.

### Cron diario

Ya documentado en `docs/ACTIVAR_CRON_CLEANUP.md`. No requiere cambios — al llamar a la Edge Function también dispara `release_stale_invite_claims`.

## Casos borde cubiertos

- **Dos tabs del mismo usuario**: mismo uid → claim idempotente (el segundo UPDATE reescribe `claimed_at`, no rechaza).
- **Claim viejo del mismo uid**: mismo flujo — el usuario puede re-ingresar su código si volvió a abrir el gate.
- **Claim viejo de otro uid**: tras TTL, `release_stale_invite_claims` libera el claim y revoca el JWT; el código vuelve al pool `active` sin `claimed_by`.
- **Usuario valida código pero nunca completa perfil**: el saneador le quita `access_granted` a los 30 min → vuelve a ver el gate si recarga.
- **Bootstrap concurrente**: solo uno obtiene el lock (`FOR UPDATE`) y consuma `status='used'`; el otro recibe `INVITE_INVALID`.

## Tests manuales sugeridos

1. **Claim tentativo impide re-claim por otro uid**:
   ```sql
   -- Sesión A (anon): grant_pilot_access('OP-TESTX') → true
   -- Sesión B (anon): grant_pilot_access('OP-TESTX') → false
   ```
2. **Saneo libera claim viejo**:
   ```sql
   -- Forzar claim viejo
   UPDATE invitation_codes SET claimed_at = now() - interval '1 hour' WHERE code = 'OP-TESTX';
   SELECT public.release_stale_invite_claims(30);
   -- Debe devolver released_claims >= 1 y claimed_by / claimed_at NULL en esa fila.
   ```
3. **Bootstrap respeta claim de otro**:
   - Login como uid A → claim de `OP-TESTX`.
   - Forzar raw_app_meta_data.access_granted=true en uid B.
   - Login como uid B → `bootstrap_user_after_signup_v2('B','OP-TESTX')` debe devolver `INVITE_INVALID`.

## Referencias

- Migración: `supabase/migrations/20260424000000_invite_atomic_lock_and_cleanup.sql`
- Edge Function: `supabase/functions/cleanup-orphan-users/index.ts`
- Doc operativo del cron: `docs/ACTIVAR_CRON_CLEANUP.md`
- RPC cliente: `src/features/access/pages/AccessGate.tsx` (llama `grant_pilot_access`), `src/features/access/services/accessGate.ts` (cliente del gate).
