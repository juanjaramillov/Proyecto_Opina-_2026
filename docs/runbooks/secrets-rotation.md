# Runbook — Rotación de Secrets (Opina+)

**Última actualización:** 2026-04-26 (F-12)
**Owner:** Juan (admin@opina.com)
**Audiencia:** cualquiera con permisos para hacer deploys o tocar la infra de Opina+.

Este runbook cubre **dónde vive cada secret**, **cómo rotarlo sin downtime** y **qué cadencia usar**. Para el inventario actual de variables (sin valores) ver `.env.example` en la raíz del repo.

---

## 1. Principios

1. **Nada con prefijo `VITE_` es secreto.** Vite embebe esas variables en el bundle JS y son visibles para cualquier usuario del navegador. Solo van ahí site keys públicos, URLs y feature flags no sensibles.
2. **Los secretos reales viven en dos lugares**:
   - **Supabase Edge secrets** → todo lo que consumen las Edge Functions (`supabase/functions/*`).
   - **Vercel Env (Production / Preview / Development)** → variables `VITE_*` que Vite necesita en build time.
3. **Nunca** se commitea un valor real. Solo `.env.example` se trackea. Todos los `.env`, `.env.local`, `.env.*.local`, `.env.vercel.prod` están en `.gitignore`.
4. **Rotación = generar nuevo + actualizar storage + redeploy + invalidar viejo.** En ese orden, nunca al revés.

---

## 2. Inventario de Secrets

### 2.1 Client-side (Vercel Env)

Todas con prefijo `VITE_`. **Públicas por diseño** (visibles en el bundle JS). Cambios requieren redeploy de Vercel para tomar efecto.

| Variable | Producto / scope | Quién la genera | Rotación | Cadencia |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Supabase (fija por proyecto) | Solo si se migra de proyecto | Nunca |
| `VITE_SUPABASE_ANON_KEY` | Anon key del proyecto Supabase | Supabase Dashboard → Settings → API | Junto con service_role si se sospecha leak | Anual o ad-hoc |
| `VITE_TURNSTILE_SITE_KEY` | Site key Cloudflare Turnstile (captcha) | Cloudflare → Turnstile → site config | Junto con `TURNSTILE_SECRET_KEY` | Anual |
| `VITE_SENTRY_DSN` | DSN público Sentry browser SDK | Sentry → Project Settings → Client Keys | Si se sospecha abuso (DoS de eventos) | Ad-hoc |
| `VITE_NARRATIVE_PROVIDER` | Feature flag `'llm'` o vacío | N/A (config) | N/A | N/A |
| `VITE_ACCESS_GATE_ENABLED` | Feature flag piloto | N/A (config) | N/A | N/A |
| `VITE_ACCESS_GATE_DAYS_VALID` | TTL de códigos en días | N/A (config) | N/A | N/A |
| `VITE_FEEDBACK_WHATSAPP_ENABLED` | Feature flag FAB feedback | N/A (config) | N/A | N/A |
| `VITE_FEEDBACK_WHATSAPP_NUMBER` | Número WhatsApp de soporte | N/A (config pública) | N/A | N/A |

### 2.2 Server-side (Supabase Edge secrets)

**No están en Vercel.** Solo en `supabase secrets`. Las Edge Functions las leen via `Deno.env.get(...)`.

| Variable | Edge functions que la usan | Quién la genera | Rotación | Cadencia |
|---|---|---|---|---|
| `OPENAI_API_KEY` | `llm-narrative`, `insights-generator`, `actualidad-bot`, `versus-bot` | OpenAI Dashboard → API keys | Crear key nueva, deploy, eliminar key vieja | **Trimestral** + ad-hoc si leak |
| `TURNSTILE_SECRET_KEY` | `register-user` | Cloudflare → Turnstile → site config | Junto con `VITE_TURNSTILE_SITE_KEY` | Anual |
| `WHATSAPP_APP_SECRET` | `whatsapp-webhook` (verifica HMAC) | Meta App → Configuración básica → App Secret | Regenerar en Meta + redeploy | **Anual** o si leak |
| `WHATSAPP_ACCESS_TOKEN` | `whatsapp-webhook`, `send-whatsapp-invite` | Meta App → WhatsApp → API Setup → token permanente | Generar nuevo system user token | **Anual** (no caduca solo) |
| `WHATSAPP_PHONE_NUMBER_ID` | mismo | Meta WhatsApp → API Setup | Solo si se cambia número | Nunca en operación normal |
| `WHATSAPP_VERIFY_TOKEN` | `whatsapp-webhook` (handshake Meta) | Lo eliges tú (string aleatorio) | Cambiarlo + reconfigurar webhook en Meta | Si leak |
| `WHATSAPP_INVITE_TEMPLATE_NAME` | `send-whatsapp-invite` | Meta WhatsApp Manager → templates | Cuando cambia el template | N/A |
| `WHATSAPP_INVITE_TEMPLATE_LANG` | mismo | mismo | mismo | N/A |
| `BRANDFETCH_API_KEY` | `brandfetch-proxy` | Brandfetch dashboard | Regenerar y redeploy | **Anual** |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Auto-inyectadas por Supabase en cada Edge Function | Supabase | Solo se rotan rotando todo el proyecto | Nunca en operación normal |

### 2.3 Server-side local-only (scripts en máquina del dev)

Solo para `tsx scripts/ops/*`. **No deben estar en Vercel ni en Supabase.** Viven en `.env.local` o `.env.development.local` del developer.

| Variable | Usado por | Cadencia |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | scripts ops admin (`scripts/ops/create_admin_user.ts`, etc.) | Ad-hoc |
| `LOGO_DEV_PUBLISHABLE_KEY` / `LOGO_DEV_SECRET_KEY` | `scripts/ops/catalog/fetch-entity-logos.mjs` | Ad-hoc |

---

## 3. Procedimientos de rotación

### 3.1 Patrón general (zero-downtime)

```
1. Generar credencial NUEVA en el proveedor (sin revocar la vieja).
2. Actualizar el storage (Vercel Env / Supabase secrets).
3. Redeploy del consumidor (Vercel build / supabase functions deploy).
4. Verificar funcionamiento con la nueva credencial (smoke).
5. Revocar la credencial vieja en el proveedor.
```

Si el orden se invierte (revocar primero) hay ventana de error 500/4xx en prod.

### 3.2 Rotar `OPENAI_API_KEY`

```bash
# 1. Crear key en https://platform.openai.com/api-keys
# 2. Actualizar Supabase Edge secret
supabase secrets set OPENAI_API_KEY=sk-proj-NUEVA...

# 3. Redeploy de TODAS las funciones que la usan
supabase functions deploy llm-narrative
supabase functions deploy insights-generator
supabase functions deploy actualidad-bot
supabase functions deploy versus-bot

# 4. Smoke: invocar una llamada B2B (admin → reporte) y verificar 200
# 5. Revocar la key vieja en OpenAI dashboard
```

### 3.3 Rotar `TURNSTILE_SECRET_KEY` (+ `VITE_TURNSTILE_SITE_KEY`)

Cloudflare emite **par** site/secret juntos, así que esta rotación es atómica.

```bash
# 1. Cloudflare → Turnstile → site → "Rotate keys"
#    Anota site key y secret nuevos (NO borres el viejo todavía).

# 2. Actualizar Supabase
supabase secrets set TURNSTILE_SECRET_KEY=0x4AAA...NUEVO

# 3. Redeploy edge function que verifica
supabase functions deploy register-user

# 4. Vercel: actualizar VITE_TURNSTILE_SITE_KEY (Production/Preview/Development)
#    Vercel UI → Settings → Environment Variables → editar
#    O CLI:
vercel env rm VITE_TURNSTILE_SITE_KEY production
vercel env add VITE_TURNSTILE_SITE_KEY production   # pega nuevo valor

# 5. Trigger redeploy en Vercel (push trivial o "Redeploy" en UI).
# 6. Smoke: abrir /register en prod, completar captcha, verificar registro OK.
# 7. Cloudflare → revocar el par viejo.
```

### 3.4 Rotar `WHATSAPP_APP_SECRET`

```bash
# 1. Meta for Developers → tu app → Configuración → Básica → App Secret → "Mostrar" → "Restablecer".
#    OJO: Meta no soporta dos app secrets activos. Esto SÍ tiene downtime
#    de unos segundos. Hacerlo en horario de baja actividad.

# 2. Inmediatamente:
supabase secrets set WHATSAPP_APP_SECRET=NUEVO_SECRET
supabase functions deploy whatsapp-webhook

# 3. Smoke: enviar un mensaje al número de prueba y verificar que el webhook
#    procesa (logs Supabase) sin "HMAC mismatch".
```

### 3.5 Rotar `WHATSAPP_ACCESS_TOKEN`

System user tokens de Meta no caducan automáticamente, pero **best practice anual**.

```bash
# 1. Meta Business Manager → Configuración → Usuarios del sistema → tu user
#    → Generar nuevo token (permisos: whatsapp_business_messaging,
#    whatsapp_business_management).

# 2. Actualizar Supabase
supabase secrets set WHATSAPP_ACCESS_TOKEN=EAAB...NUEVO
supabase functions deploy whatsapp-webhook
supabase functions deploy send-whatsapp-invite

# 3. Smoke: enviar invitación de prueba (admin → invitaciones → nuevo).
# 4. Revocar token viejo en Meta (mismo panel).
```

### 3.6 Rotar `BRANDFETCH_API_KEY`

```bash
# 1. Brandfetch dashboard → API → "Generate new key".
# 2. supabase secrets set BRANDFETCH_API_KEY=NUEVO
# 3. supabase functions deploy brandfetch-proxy
# 4. Smoke: cargar un perfil de empresa con logo dinámico.
# 5. Revocar key vieja.
```

### 3.7 Rotar `VITE_SUPABASE_ANON_KEY` + service_role

Esta es la **rotación nuclear** del proyecto Supabase. Solo si:
- Se sospecha leak del service_role.
- Auditoría externa lo requiere.
- Se cambia de tier / proyecto.

```bash
# 1. Supabase Dashboard → Settings → API → "Reset anon key" / "Reset service_role".
#    OJO: rota AMBAS al mismo tiempo en el dashboard si haces reset.

# 2. Actualizar Vercel (anon)
vercel env rm VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_ANON_KEY production

# 3. Las Edge Functions toman SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY
#    auto-inyectadas por Supabase, así que después del reset solo necesitas:
supabase functions deploy --all   # redeploy masivo para tomar nuevos valores

# 4. Trigger redeploy en Vercel.
# 5. Smoke: login + acceso gate + RPC admin.
# 6. Si el reset rotó el service_role, actualizar también scripts locales:
#    ~/.zshrc o ~/.env.development.local del dev → SUPABASE_SERVICE_ROLE_KEY.
```

---

## 4. Rotación de emergencia (leak detectado)

Trigger: clave aparece en commit público, log filtrado, screenshot en redes, etc.

```
PRIORIDAD: minimizar ventana de exposición. Acepta downtime corto.
```

1. **Revocar primero.** En el dashboard del proveedor, eliminar/desactivar la credencial filtrada **antes** de generar la nueva. Esto deja el sistema 4xx temporalmente, pero corta el blast radius.
2. Generar credencial nueva.
3. Actualizar storage (Vercel / Supabase) + redeploy.
4. Postmortem: cómo se filtró, qué logs limpiar, qué auditar (admin_audit_log, signal_events, prompts a OpenAI con esa key, mensajes WhatsApp enviados).
5. Si la credencial leaked podía escribir datos (service_role, WHATSAPP_ACCESS_TOKEN), revisar tabla afectada por movimientos sospechosos en la ventana de exposición.

---

## 5. Cadencia recomendada

| Cadencia | Secrets |
|---|---|
| **Trimestral** | `OPENAI_API_KEY` (alto costo si leak) |
| **Anual** | `TURNSTILE_SECRET_KEY`, `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `BRANDFETCH_API_KEY` |
| **Ad-hoc** | Todo lo demás. Solo si hay sospecha o auditoría. |

Marcar en calendario:
- 1° de cada trimestre → revisar `OPENAI_API_KEY`.
- Cumpleaños del proyecto (cada año en abril) → rotación grande de keys anuales.

---

## 6. Comandos útiles (cheatsheet)

```bash
# Listar secrets en Supabase (no muestra valores)
supabase secrets list

# Ver vars en Vercel
vercel env ls

# Pull de vars de Vercel a archivo local (debug)
vercel env pull .env.vercel.tmp

# Set/unset en Supabase
supabase secrets set KEY=value
supabase secrets unset KEY

# Set/unset en Vercel (interactivo, pide valor)
vercel env add KEY production
vercel env rm KEY production

# Redeploy masivo de edge functions
supabase functions deploy --all

# Redeploy Vercel (sin push, fuerza nuevo build)
vercel --prod
```

---

## 7. Anti-patrones (no hacer)

- ❌ Poner `OPENAI_API_KEY` con prefijo `VITE_OPENAI_API_KEY` "para que el front la use directo". Eso la pone en el bundle JS y la expone a cualquiera con devtools.
- ❌ Commitear `.env`, `.env.local` o `.env.vercel.prod`. Verificar antes de cada PR: `git status` no debe mostrar archivos `.env*` salvo `.env.example`.
- ❌ Pegar secrets en Slack / WhatsApp / email. Usar 1Password / Bitwarden o transferencia directa entre dashboards.
- ❌ Rotar revocando primero sin haber preparado el nuevo (introduce downtime evitable salvo en emergencia).
- ❌ Compartir el `SUPABASE_SERVICE_ROLE_KEY` con devs nuevos. Solo Owner del proyecto y CI lo necesitan.

---

## 8. Auditoría rápida (mensual, 5 min)

```bash
# 1. ¿Algún secret filtrado en repo?
git log --all -p | grep -E "(sk-proj-|EAAB|0x4AAA|service_role)" | head

# 2. ¿Vercel y .env.example en sincro?
diff <(grep -oE '^VITE_[A-Z_]+' .env.example | sort -u) \
     <(vercel env ls production 2>/dev/null | grep -oE 'VITE_[A-Z_]+' | sort -u)

# 3. ¿Supabase secrets coinciden con lo que las funciones leen?
supabase secrets list | awk 'NR>2 {print $1}' | sort -u > /tmp/supabase-secrets.txt
grep -rhoE "Deno\.env\.get\(['\"][A-Z_]+['\"]\)" supabase/functions \
  | grep -oE "[A-Z_]+" | grep -v "^Deno$" | sort -u > /tmp/code-secrets.txt
diff /tmp/code-secrets.txt /tmp/supabase-secrets.txt
```

Cualquier diff ≠ 0 amerita investigar antes del próximo deploy.
