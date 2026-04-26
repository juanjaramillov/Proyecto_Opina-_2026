import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { typedRpc } from '../../../supabase/typedRpc';
import { accessGate } from '../services/accessGate';
import FeedbackFab from '../../../components/ui/FeedbackFab';
import { analyticsService } from "../../analytics/services/analyticsService";

import { useAuthContext } from '../../auth/context/AuthContext';

function getNext(search: string) {
    const params = new URLSearchParams(search);
    const next = params.get('next');
    return next && next.startsWith('/') ? next : '/';
}

export default function AccessGatePage() {
    const nav = useNavigate();
    const loc = useLocation();
    const { accessState } = useAuthContext();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

    useEffect(() => {
        analyticsService.trackSystem("access_gate_page_view", "info", { next: nextPath });
    }, [nextPath]);

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (accessGate.isEnabled() && !accessState.isLoading && accessState.hasAccessGateToken) {
            nav(nextPath, { replace: true });
        }
    }, [nextPath, nav, accessState]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        const normalized = code.trim().toUpperCase();
        if (!normalized) {
            analyticsService.trackSystem("access_gate_submit_missing_code", "warn");
            setErr('Ingresa tu código.');
            return;
        }

        analyticsService.trackSystem("access_gate_submit", "info", { code_len: normalized.length, next: nextPath });
        setLoading(true);
        try {
            // 1. Sign in anonymously if no session exists, to link the custom claim metadata
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const { error: anonErr } = await supabase.auth.signInAnonymously();
                if (anonErr) throw anonErr;
            }

            // 2. Add custom JWT claim via RPC
            const { data: isValid, error: vErr } = await typedRpc<boolean>('grant_pilot_access', {
                p_code: normalized,
            });
            if (vErr) throw vErr;

            if (!isValid) {
                analyticsService.trackSystem("access_gate_code_invalid", "warn", { code_len: normalized.length, next: nextPath });
                setErr('Ese código ya venció o no existe. Pide uno nuevo.');
                return;
            }

            // 3. Force refresh so the new claim is recognized by AuthContext downstream
            await supabase.auth.refreshSession();
            analyticsService.trackSystem("access_gate_granted_jwt", "info", { next: nextPath });

            // 4. Entrar
            nav(nextPath, { replace: true });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            analyticsService.trackSystem("access_gate_error", "error", { message: msg.slice(0, 160) });
            setErr('Código de invitación expirado o no válido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-shadow hover:shadow-2xl hover:shadow-2xl/60">
                    <h1 className="text-xl font-black text-slate-900">Acceso Restringido</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Entorno en fase piloto. Opina+ requiere invitación directa para participar y validar la calidad de la muestra.
                    </p>

                    <form onSubmit={submit} className="space-y-4 mt-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Código de invitación
                            </label>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Ej: OPINA-7F3K"
                                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 uppercase"
                                autoFocus
                            />
                            <p className="text-[11px] text-slate-500 mt-2 font-medium">Respeta mayúsculas y guiones.</p>
                            {err && <p className="text-sm text-danger-600 mt-2 font-medium">Código de invitación expirado o no válido.</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-brand hover:opacity-90 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Verificando código…' : 'Entrar'}
                        </button>

                        {/* Admin bypass redirect */}
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => nav('/admin-login')}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">shield_person</span>
                                Ingreso Administrador
                            </button>
                        </div>
                    </form>
                </div>

                {/* Helper text de invitación en vez de tag piloto */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    <p className="text-[11px] font-medium text-slate-500">
                        ¿Necesitas un código? Pídelo a quien te invitó.
                    </p>
                    <button
                        onClick={() => nav('/')}
                        className="text-[12px] font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-wider"
                    >
                        Volver al inicio
                    </button>
                </div>
                
                {/* Legal links */}
                <div className="mt-8 flex justify-center gap-4 text-[11px] font-medium text-slate-400">
                    <button onClick={() => nav('/privacy')} className="hover:text-brand transition-colors">Privacidad</button>
                    <span>·</span>
                    <button onClick={() => nav('/terms')} className="hover:text-brand transition-colors">Términos</button>
                </div>
            </div>
            <FeedbackFab />
        </div>
    );
}
