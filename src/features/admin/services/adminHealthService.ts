import { supabase } from '../../../supabase/client';

export type HealthCheckResult = {
    ok: boolean;
    detail?: string;
};

export const adminHealthService = {
    async checkSession(): Promise<HealthCheckResult> {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (!data.session) return { ok: false, detail: 'No activa' };
            return { ok: true, detail: `UID: ${data.session.user.id}` };
        } catch (err: any) {
            return { ok: false, detail: err.message };
        }
    },

    async checkListInvites(): Promise<HealthCheckResult> {
        try {
            const { error } = await (supabase.rpc as any)('admin_list_invites', { p_limit: 1 });
            if (error) throw error;
            return { ok: true, detail: 'RPC responde 200' };
        } catch (err: any) {
            return { ok: false, detail: err.message };
        }
    },

    async checkListRedemptions(): Promise<HealthCheckResult> {
        try {
            const { error } = await (supabase.rpc as any)('admin_list_invite_redemptions', { p_limit: 1 });
            if (error) throw error;
            return { ok: true, detail: 'RPC responde 200' };
        } catch (err: any) {
            return { ok: false, detail: err.message };
        }
    },

    async checkListAppEvents(): Promise<HealthCheckResult> {
        try {
            const { error } = await (supabase.rpc as any)('admin_list_app_events', { p_limit: 1 });
            if (error) throw error;
            return { ok: true, detail: 'RPC responde 200' };
        } catch (err: any) {
            return { ok: false, detail: err.message };
        }
    },

    async checkSignalSmoke(dryRun: boolean): Promise<HealthCheckResult> {
        try {
            // Intentamos buscar una batalla activa. Si RLS lo bloquea o no hay, hacemos un dummy check para ver si la RPC existe.
            const { data: battle, error: battleErr } = await supabase
                .from('battles')
                .select('id')
                .eq('status', 'active')
                .limit(1)
                .maybeSingle();

            if (battleErr || !battle) {
                // Dummy send
                if (dryRun) return { ok: true, detail: 'DryRun: RPC (Dummy IDs) omitido' };
                const { error: rpcErr } = await (supabase.rpc as any)('insert_signal_event', {
                    p_battle_id: crypto.randomUUID(),
                    p_option_id: crypto.randomUUID(),
                    p_session_id: null,
                    p_attribute_id: null,
                    p_client_event_id: crypto.randomUUID()
                });

                // Si retorna BATTLE_NOT_ACTIVE sabemos que la función fue ejecutada satisfactoriamente en lógica de negocio
                if (rpcErr && rpcErr.message === 'BATTLE_NOT_ACTIVE') {
                    return { ok: true, detail: 'No battles accesibles, pero RPC existe y respondió logic-error esperado' };
                }
                if (rpcErr) throw rpcErr;
                return { ok: true, detail: 'Señal emitida misteriosamente sin batalla' };
            }

            const { data: option, error: optErr } = await supabase
                .from('battle_options')
                .select('id,battle_id')
                .eq('battle_id', battle.id)
                .limit(1)
                .maybeSingle();

            if (optErr || !option) {
                return { ok: false, detail: 'Batalla encontrada pero sin opciones' };
            }

            if (dryRun) {
                return { ok: true, detail: `DryRun OK. Battle/Option accesibles en BD.` };
            }

            // Inserción real
            const payload = {
                p_battle_id: battle.id,
                p_option_id: option.id,
                p_session_id: null,
                p_attribute_id: null,
                p_client_event_id: crypto.randomUUID()
            };

            const { error: insErr } = await (supabase.rpc as any)('insert_signal_event', payload);
            if (insErr) {
                // Dependiendo de si la cuota ya fue cumplida o no es verificador
                if (['PROFILE_MISSING', 'PROFILE_INCOMPLETE', 'SIGNAL_LIMIT_REACHED'].includes(insErr.message)) {
                    return { ok: true, detail: `RPC rechazó con constraint legal: ${insErr.message}` };
                }
                throw insErr;
            }

            return { ok: true, detail: 'Señal insertada (200 OK)' };

        } catch (err: any) {
            return { ok: false, detail: err.message };
        }
    }
};
