// ============================================================
// Edge Function: register-user
// ============================================================
// Propósito: crear una cuenta de usuario de forma atómica.
//
// Problema que resuelve (audit Drimo #4, ampliado):
// El flujo anterior hacía supabase.auth.signUp() en el cliente, lo que
// creaba `auth.users` inmediatamente. Si el usuario cerraba el navegador
// antes de completar el perfil, quedaba un `auth.user` huérfano y su
// email quedaba "reservado" sin posibilidad de recuperación.
//
// Esta función, corriendo con SERVICE_ROLE, ejecuta los 3 pasos del
// registro en una secuencia controlada con rollback:
//   1. auth.admin.createUser(email, password)     -> crea auth.user
//   2. INSERT users (user_id, role='user')         -> registro en public
//   3. INSERT user_profiles (nickname, stage=0)    -> perfil mínimo
//
// Si (2) o (3) fallan, hace auth.admin.deleteUser(newUid) para revertir.
// El cliente NO recibe una sesión — después de esta función debe hacer
// signInWithPassword() con las credenciales ya validadas.
//
// Protecciones:
//   - Rate limit en memoria: 5 registros/minuto por IP.
//   - Cloudflare Turnstile siteverify (F-13): bloquea registro automatizado por bots.
//     Requiere env var TURNSTILE_SECRET_KEY. Si no está seteada, la función
//     registra warning y continúa (permite desarrollo local sin captcha).
//   - Validación estricta (formato email, length password, format nickname).
//   - Respuestas con códigos de error específicos para UX cliente.
//   - No expone detalles internos del error.
//
// Deployment:
//   supabase functions deploy register-user --no-verify-jwt
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limit simple en memoria del worker.
// Nota: Edge Functions pueden tener múltiples instancias, así que esto es
// best-effort por worker. Para rate limit global estricto habría que usar
// una tabla en Postgres. Para registros (operación infrecuente por usuario),
// esto es suficiente como primera línea de defensa.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) ?? [];
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) return false;
    recent.push(now);
    rateLimitMap.set(ip, recent);
    return true;
}

function errorResponse(status: number, error: string, code: string) {
    return new Response(
        JSON.stringify({ ok: false, error, code }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

function successResponse(body: Record<string, unknown>) {
    return new Response(
        JSON.stringify({ ok: true, ...body }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Validaciones estrictas alineadas con constraints de la DB.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// user_profiles.nickname CHECK: length 3-20, solo [a-zA-Z0-9_]
const NICKNAME_REGEX = /^[a-zA-Z0-9_]+$/;

interface ValidatedInput {
    email: string;
    password: string;
    nickname: string;
    captchaToken: string | null;
}

function validateInput(body: unknown): ValidatedInput | { error: string; code: string } {
    if (!body || typeof body !== 'object') {
        return { error: 'Body inválido', code: 'BAD_REQUEST' };
    }
    const b = body as Record<string, unknown>;
    const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
    const password = typeof b.password === 'string' ? b.password : '';
    const nickname = typeof b.nickname === 'string' ? b.nickname.trim() : '';
    const captchaToken = typeof b.captchaToken === 'string' && b.captchaToken.length > 0
        ? b.captchaToken
        : null;

    if (!email || !EMAIL_REGEX.test(email)) {
        return { error: 'Email inválido', code: 'INVALID_EMAIL' };
    }
    if (password.length < 8) {
        return { error: 'La contraseña debe tener al menos 8 caracteres', code: 'INVALID_PASSWORD' };
    }
    if (password.length > 128) {
        return { error: 'La contraseña es demasiado larga', code: 'INVALID_PASSWORD' };
    }
    if (nickname.length < 3 || nickname.length > 20) {
        return { error: 'El nickname debe tener entre 3 y 20 caracteres', code: 'INVALID_NICKNAME' };
    }
    if (!NICKNAME_REGEX.test(nickname)) {
        return { error: 'El nickname solo puede contener letras, números y guion bajo', code: 'INVALID_NICKNAME' };
    }
    return { email, password, nickname, captchaToken };
}

// ============================================================
// Cloudflare Turnstile siteverify
// ============================================================
// Valida un token de Turnstile contra el endpoint oficial de Cloudflare.
// Devuelve true sólo si el provider confirma success. Pasa el IP del cliente
// para que Cloudflare pueda hacer su análisis de riesgo basado en origen.
//
// Si TURNSTILE_SECRET_KEY no está seteada en las env vars, devuelve true con
// un warning (modo desarrollo). En producción esta env var DEBE estar
// configurada — sin ella, la función pierde la protección anti-bot.
//
// Refs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
async function verifyCaptcha(token: string | null, clientIp: string): Promise<{ ok: boolean; reason?: string }> {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');

    if (!secret) {
        console.warn('[register-user] TURNSTILE_SECRET_KEY not set — skipping captcha verification (dev mode)');
        return { ok: true };
    }

    if (!token) {
        return { ok: false, reason: 'missing_token' };
    }

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (clientIp && clientIp !== 'unknown') {
        formData.append('remoteip', clientIp);
    }

    try {
        const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
        if (!resp.ok) {
            console.error('[register-user] Turnstile siteverify HTTP error:', resp.status);
            return { ok: false, reason: `siteverify_http_${resp.status}` };
        }
        const data = await resp.json() as { success?: boolean; 'error-codes'?: string[] };
        if (data.success !== true) {
            const codes = Array.isArray(data['error-codes']) ? data['error-codes'].join(',') : 'unknown';
            console.warn('[register-user] Turnstile siteverify rejected:', codes);
            return { ok: false, reason: codes };
        }
        return { ok: true };
    } catch (err) {
        console.error('[register-user] Turnstile siteverify network error:', err);
        return { ok: false, reason: 'siteverify_network' };
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
        return errorResponse(405, 'Método no permitido', 'METHOD_NOT_ALLOWED');
    }

    // Rate limit por IP
    const clientIp =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('cf-connecting-ip') ||
        'unknown';
    if (!checkRateLimit(clientIp)) {
        return errorResponse(429, 'Demasiados intentos. Espera un minuto e intenta de nuevo.', 'RATE_LIMITED');
    }

    // Parse body
    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return errorResponse(400, 'Body inválido', 'BAD_REQUEST');
    }

    // Validar input
    const validated = validateInput(rawBody);
    if ('error' in validated) {
        return errorResponse(400, validated.error, validated.code);
    }
    const { email, password, nickname, captchaToken } = validated;

    // ====================================================
    // Turnstile (F-13): bloquea registros automatizados.
    // Se verifica ANTES de tocar auth.users para no consumir
    // recursos en intentos maliciosos.
    // ====================================================
    const captchaResult = await verifyCaptcha(captchaToken, clientIp);
    if (!captchaResult.ok) {
        const isMissing = captchaResult.reason === 'missing_token';
        return errorResponse(
            isMissing ? 400 : 403,
            isMissing
                ? 'Falta la verificación anti-bot. Refresca y vuelve a intentar.'
                : 'Verificación anti-bot fallida. Intenta de nuevo.',
            isMissing ? 'CAPTCHA_MISSING' : 'CAPTCHA_FAILED'
        );
    }

    // Leer credenciales del servidor
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRole) {
        console.error('[register-user] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
        return errorResponse(500, 'Configuración del servidor incompleta', 'SERVER_MISCONFIGURED');
    }

    const admin = createClient(supabaseUrl, supabaseServiceRole, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // ====================================================
    // PASO 1: crear auth.user
    // ====================================================
    const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // flujo normal: el usuario confirma email después
        user_metadata: { nickname },
    });

    if (signUpError || !authData?.user) {
        const msg = signUpError?.message?.toLowerCase() ?? '';
        const isEmailExists =
            msg.includes('already') ||
            msg.includes('registered') ||
            msg.includes('duplicate') ||
            msg.includes('exists');
        if (isEmailExists) {
            return errorResponse(
                409,
                'Este email ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.',
                'EMAIL_EXISTS'
            );
        }
        console.error('[register-user] createUser failed:', signUpError);
        return errorResponse(400, signUpError?.message || 'Error creando cuenta', 'SIGNUP_FAILED');
    }

    const newUserId = authData.user.id;

    // ====================================================
    // PASO 2 + 3: asegurar users y user_profiles atómicamente.
    //
    // Nota: Supabase (o un trigger AFTER INSERT sobre auth.users) puede
    // haber creado ya estas filas con un nickname autogenerado tipo
    // `anon_XXXXXXXX`. Por eso usamos UPSERT con onConflict=user_id:
    //   - Si no existen → las crea con el nickname del usuario.
    //   - Si existen → pisa el nickname autogenerado con el real.
    //
    // Si falla cualquier UPSERT, rollback con auth.admin.deleteUser.
    // ====================================================
    try {
        const { error: usersError } = await admin
            .from('users')
            .upsert(
                { user_id: newUserId, role: 'user' },
                { onConflict: 'user_id' }
            );
        if (usersError) {
            throw new Error(`users upsert failed: ${usersError.message}`);
        }

        const { error: profileError } = await admin
            .from('user_profiles')
            .upsert(
                {
                    user_id: newUserId,
                    nickname,
                    profile_stage: 0,
                    signal_weight: 1.0,
                },
                { onConflict: 'user_id' }
            );
        if (profileError) {
            throw new Error(`user_profiles upsert failed: ${profileError.message}`);
        }

        return successResponse({ user_id: newUserId });
    } catch (err) {
        // ROLLBACK: borrar auth.user para que el email quede libre
        try {
            const { error: delError } = await admin.auth.admin.deleteUser(newUserId);
            if (delError) {
                console.error('[register-user] CRITICAL: rollback failed, orphan auth.user left:', {
                    user_id: newUserId,
                    delete_error: delError.message,
                });
            } else {
                console.log('[register-user] Rollback successful for user_id:', newUserId);
            }
        } catch (cleanupErr) {
            console.error('[register-user] CRITICAL: rollback threw exception:', cleanupErr);
        }

        const message = err instanceof Error ? err.message : String(err);
        console.error('[register-user] Profile creation failed:', message);
        return errorResponse(
            500,
            'Error creando el perfil. Intenta de nuevo.',
            'PROFILE_CREATION_FAILED'
        );
    }
});
