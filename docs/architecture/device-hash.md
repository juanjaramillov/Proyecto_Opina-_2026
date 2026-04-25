# Device hash determinístico

> **Estado**: vigente desde migración `20260424000300_user_sessions_device_hash.sql`.
> **Cierra**: #9 Media de la auditoría técnica Drimo — "Persistir device hash en servidor".
> **Relacionado**: `multi-session-lock.md`, `admin-audit-log.md`.

## Por qué existe

Antes de #9 Media había UN solo device_hash en Opina+, generado en `signalWriteService.ts` con esta línea:

```ts
deviceHash = `${crypto.randomUUID()}-${getBrowserFingerprint()}`;
localStorage.setItem('opina_device_hash', deviceHash);
```

Tres problemas:

1. **No es determinístico.** El `crypto.randomUUID()` randomiza el hash. Si el usuario borra localStorage o entra en modo incógnito → hash distinto. El sistema `admin_set_device_ban` queda fácilmente evadible.
2. **Solo se envía con signals.** No se captura al loguearse → no hay forma de cruzar "qué usuarios distintos usan este device".
3. **No se persiste en `user_sessions`.** El multi-session lock (#5 Media) registra cada login pero no sabe desde qué dispositivo.

## Solución

Una **segunda capa** de device_hash, esta vez **determinística**, que se calcula en cada login y se persiste en `user_sessions`. El sistema viejo (en `signal_events`) se mantiene como está para no invalidar bans existentes — la migración hacia un único hash es Fase 2 (no incluida en este cambio).

### Generación del hash (cliente)

`src/lib/deviceFingerprint.ts` exporta `computeDeterministicDeviceHash()`. Calcula `SHA-256` (truncado a 32 chars hex) sobre estos inputs:

```
userAgent | platform | language | hardwareConcurrency | screenWidth | screenHeight | colorDepth | timezoneOffset
```

Propiedades:

- **Determinístico**: mismos inputs → mismo hash siempre.
- **Estable cross-session**: borrar localStorage NO cambia el hash (los inputs son del navegador, no almacenados).
- **Sin PII**: el hash es opaco (32 chars hex). Solo permite comparar "device A == device B sí/no".
- **Tolerante a falla**: si Web Crypto no está disponible, usa fallback determinístico no-criptográfico (suficiente para anti-fraude).
- **No bloquea el login**: si el cómputo falla, manda `null` y la sesión se registra sin device_hash.

### Persistencia (servidor)

`user_sessions.device_hash text NULL` — agregado en `20260424000300_user_sessions_device_hash.sql`.

Índice `(device_hash, created_at DESC) WHERE device_hash IS NOT NULL` para queries de detección.

### RPCs

| RPC | llamable por | qué hace |
|---|---|---|
| `register_user_session(p_device_label, p_user_agent, p_device_hash)` | `authenticated` | Misma de #5 Media, ahora acepta `p_device_hash`. Wrapper sin device_hash mantenido por backwards compat. |
| `admin_find_multi_account_devices(p_min_users, p_since_days)` | admin | Lista device_hashes con N+ usuarios distintos en los últimos N días. Loguea en `admin_audit_log`. |
| `admin_list_device_users(p_device_hash, p_since_days)` | admin | Detalle: usuarios que se loguearon desde un device dado. Loguea en `admin_audit_log`. |

### UI

Página `/admin/antifraud` — sección **"Devices con multi-cuenta (login)"** debajo del panel de flags existente.

- Inputs configurables: `min usuarios distintos` (default 3), `últimos N días` (default 30).
- Tabla: hash truncado, # usuarios, # sesiones, última actividad, tiene-sesión-activa.
- Click "Ver usuarios" → expande con la lista de emails + IDs de los usuarios asociados.
- Componente: `src/features/admin/components/MultiAccountDevicesPanel.tsx`.

## Flujo completo

1. Usuario se loguea → Supabase Auth dispara `SIGNED_IN`.
2. `useSessionGuard` (montado en `AuthProvider`) detecta el evento.
3. Llama `computeDeterministicDeviceHash()` → string hex 32 chars.
4. Llama `register_user_session(label, userAgent, deviceHash)`.
5. RPC inserta fila en `user_sessions` con el hash.
6. Admin abre `/admin/antifraud` → se carga el panel multi-cuenta.
7. Si se sospecha abuso, admin clickea un row → ve los emails de las cuentas que comparten ese device.
8. Si decide actuar:
   - Para revocar las sesiones de un user específico: usar `admin_revoke_user_sessions` (de #5 Media).
   - Para banear el device a nivel signals: usar `admin_set_device_ban` (sistema legacy, Fase 2).

## Privacidad y consideraciones

- **El hash NO es PII.** No contiene email, nombre, ni datos identificables. Es un digest opaco.
- **El hash NO permite tracking entre sitios.** Solo sirve dentro de Opina+ para comparar dispositivos.
- **El hash puede colisionar** entre dispositivos idénticos (mismo modelo, misma config, mismo timezone). Esto es deseable — el objetivo es agrupar devices similares, no individualizarlos. El falso positivo (dos personas con el mismo iPhone en la misma zona horaria) se compensa con el filtro `min_users >= 3`.
- **Cumplimiento GDPR**: el hash se borra en cascada al eliminar al user (`ON DELETE CASCADE` de `user_sessions.user_id`). No requiere proceso adicional.

## Cómo testear

### Test unitario

```bash
npm run test src/lib/deviceFingerprint.test.ts
```

Valida determinismo, formato, ausencia de PII.

### Test end-to-end manual

1. Loguearse como user A en Chrome.
2. Loguearse como user B en el mismo Chrome (otra ventana incógnito ≠ ; debe ser la MISMA ventana, otro user).
3. Loguearse como user C en el mismo Chrome.
4. Como `admin@opina.com`, ir a `/admin/antifraud`.
5. Bajar al panel "Devices con multi-cuenta (login)".
6. Configurar `min usuarios = 2` y aplicar.
7. Debería aparecer una fila con device_hash, `distinct_users=3`, click "Ver usuarios" → lista los 3 emails.

### Verificación SQL directa

```sql
-- ¿Cuántas sesiones tienen ya el device_hash poblado?
SELECT COUNT(*) AS con_hash,
       COUNT(*) FILTER (WHERE device_hash IS NULL) AS sin_hash
  FROM public.user_sessions;

-- Top devices con más usuarios distintos (últimos 30 días)
SELECT device_hash,
       COUNT(DISTINCT user_id) AS users,
       COUNT(*)                AS sessions
  FROM public.user_sessions
 WHERE device_hash IS NOT NULL
   AND created_at > now() - interval '30 days'
 GROUP BY device_hash
HAVING COUNT(DISTINCT user_id) >= 2
 ORDER BY users DESC, sessions DESC
 LIMIT 20;
```

## Fase 2 (no incluida en este cambio)

Pendiente para una migración futura cuando se decida unificar:

1. Migrar `signalWriteService.ts` al hash determinístico (eliminar el `crypto.randomUUID()` inicial).
2. Hacer que `register_user_session` rechace logins desde `admin_antifraud_flags.banned=true`.
3. Backfill de `user_sessions.device_hash` para sesiones viejas (NULL).
4. Cron de limpieza: borrar entries de `user_sessions` con `revoked_at < now() - 1 año` para compactar.

## Referencias

- Migración: `supabase/migrations/20260424000300_user_sessions_device_hash.sql`
- Util cliente: `src/lib/deviceFingerprint.ts`
- Test: `src/lib/deviceFingerprint.test.ts`
- Hook integrado: `src/features/auth/hooks/useSessionGuard.ts`
- Servicio admin: `src/features/admin/services/adminAntifraudService.ts`
- Panel UI: `src/features/admin/components/MultiAccountDevicesPanel.tsx`
- Página admin: `src/features/admin/pages/AdminAntifraud.tsx`
- Relacionado: `docs/architecture/multi-session-lock.md`
