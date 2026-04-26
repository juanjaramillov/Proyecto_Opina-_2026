// ============================================================
// Edge Function: cleanup-orphan-users
// ============================================================
// Propósito: barrer periódicamente los `auth.users` que quedaron
// huérfanos (sin registro en `public.user_profiles`) por casos edge
// que escapen al rollback atómico de register-user.
//
// Casos que puede cubrir:
//   - Registros legacy pre-cambio a Edge Function atómica.
//   - Fallas raras donde el rollback mismo falla.
//   - Usuarios que se autenticaron vía OAuth pero no completaron perfil.
//
// Además (desde la migración 20260424000000_invite_atomic_lock_and_cleanup):
// invoca al inicio de la corrida `public.release_stale_invite_claims(ttl)`
// para liberar claims tentativos abandonados en invitation_codes y
// revocar `access_granted` del JWT de usuarios que nunca completaron
// perfil. Esto cierra la ventana de "huésped fantasma" del flujo
// AccessGate (ver docs/architecture/invite-atomic-flow.md).
//
// Acceso: requiere JWT de admin (patrón requireAdmin del proyecto).
// Puede ser disparada:
//   - Manualmente desde Admin Health dashboard.
//   - Por cron (configurar con pg_cron apuntando a esta función).
//
// Parámetros (opcionales):
//   - older_than_hours: ventana de grace para huérfanos. Default 24.
//   - claim_ttl_minutes: TTL en minutos para release_stale_invite_claims.
//                        Default 30.
//   - dry_run: si true, solo cuenta sin borrar. Default false.
//              En dry_run tampoco se ejecuta release_stale_invite_claims
//              para que la corrida sea 100% read-only.
//
// Deployment:
//   supabase functions deploy cleanup-orphan-users
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireAdmin, corsHeaders } from "../_shared/requireAdmin.ts";

type CleanupRequest = {
    older_than_hours?: number;
    claim_ttl_minutes?: number;
    dry_run?: boolean;
};

type StaleClaimsReport = {
    ok: boolean;
    ttl_minutes?: number;
    released_claims?: number;
    revoked_access_grants?: number;
    error?: string;
};

type OrphanRow = {
    id: string;
    email: string | null;
    created_at: string;
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ ok: false, error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { supabaseAdmin } = await requireAdmin(req);

        // Parsear body (opcional)
        let body: CleanupRequest = {};
        try {
            const raw = await req.text();
            if (raw) body = JSON.parse(raw);
        } catch {
            // sin body o inválido — usar defaults
        }

        const olderThanHours = typeof body.older_than_hours === 'number' && body.older_than_hours > 0
            ? Math.min(body.older_than_hours, 720) // tope 30 días
            : 24;
        const claimTtlMinutes = typeof body.claim_ttl_minutes === 'number' && body.claim_ttl_minutes >= 5
            ? Math.min(body.claim_ttl_minutes, 10080) // tope 7 días, piso 5 min
            : 30;
        const dryRun = body.dry_run === true;

        const threshold = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

        // Paso previo — liberar claims tentativos abandonados y revocar
        // access_granted de JWTs huérfanos. Idempotente. En dry_run lo
        // saltamos para mantener la corrida 100% read-only.
        let staleClaimsReport: StaleClaimsReport | null = null;
        if (!dryRun) {
            const { data: staleData, error: staleError } = await supabaseAdmin.rpc(
                'release_stale_invite_claims',
                { p_ttl_minutes: claimTtlMinutes }
            );
            if (staleError) {
                console.error('[cleanup-orphan-users] release_stale_invite_claims failed:', staleError);
                staleClaimsReport = { ok: false, error: staleError.message };
            } else {
                staleClaimsReport = (staleData as StaleClaimsReport) ?? { ok: true };
            }
        }

        // Buscar auth.users sin user_profiles y más viejos que threshold.
        // Hacemos query paginada con listUsers() porque el schema auth no es
        // accesible directo por service_role en la API de PostgREST.
        const orphans: OrphanRow[] = [];
        let page = 1;
        const perPage = 200;
        let reachedEnd = false;

        while (!reachedEnd) {
            const { data: usersPage, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage,
            });
            if (listError) {
                console.error('[cleanup-orphan-users] listUsers failed:', listError);
                return new Response(
                    JSON.stringify({ ok: false, error: 'list_users_failed', detail: listError.message }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const candidates = (usersPage?.users ?? []).filter((u) => {
                return u.created_at && u.created_at < threshold;
            });

            if (candidates.length === 0) {
                reachedEnd = true;
                break;
            }

            // Cross-check: cuáles de estos no tienen user_profiles
            const candidateIds = candidates.map((u) => u.id);
            const { data: profiles, error: profilesError } = await supabaseAdmin
                .from('user_profiles')
                .select('user_id')
                .in('user_id', candidateIds);

            if (profilesError) {
                console.error('[cleanup-orphan-users] user_profiles query failed:', profilesError);
                return new Response(
                    JSON.stringify({ ok: false, error: 'profiles_query_failed', detail: profilesError.message }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const profileIds = new Set((profiles ?? []).map((p) => p.user_id as string));
            for (const u of candidates) {
                if (!profileIds.has(u.id)) {
                    orphans.push({ id: u.id, email: u.email ?? null, created_at: u.created_at ?? '' });
                }
            }

            if (!usersPage || usersPage.users.length < perPage) {
                reachedEnd = true;
            } else {
                page += 1;
                if (page > 50) {
                    // Safety stop: máximo 10000 usuarios por corrida
                    console.warn('[cleanup-orphan-users] Pagination safety stop reached at page 50');
                    reachedEnd = true;
                }
            }
        }

        if (dryRun) {
            return new Response(
                JSON.stringify({
                    ok: true,
                    dry_run: true,
                    orphan_count: orphans.length,
                    orphans: orphans.slice(0, 20), // muestra
                    stale_invite_claims: staleClaimsReport, // null en dry_run por diseño
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Borrar cada huérfano
        let deleted = 0;
        const errors: Array<{ user_id: string; error: string }> = [];

        for (const o of orphans) {
            const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(o.id);
            if (delError) {
                errors.push({ user_id: o.id, error: delError.message });
                console.error('[cleanup-orphan-users] delete failed:', o.id, delError.message);
            } else {
                deleted += 1;
            }
        }

        return new Response(
            JSON.stringify({
                ok: true,
                older_than_hours: olderThanHours,
                orphan_count: orphans.length,
                deleted,
                errors,
                stale_invite_claims: staleClaimsReport,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        if (err instanceof Response) return err; // requireAdmin throws Response
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[cleanup-orphan-users] Unhandled error:', msg);
        return new Response(
            JSON.stringify({ ok: false, error: 'internal_error', detail: msg }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
