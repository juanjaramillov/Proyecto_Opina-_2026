import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { accessGate } from '../services/accessGate';
import FeedbackFab from '../../../components/ui/FeedbackFab';
import { track, trackPage } from "../../telemetry/track";
import { logger } from '../../../lib/logger';

function getNext(search: string) {
    const params = new URLSearchParams(search);
    const next = params.get('next');
    return next && next.startsWith('/') ? next : '/';
}

export default function AccessGatePage() {
    const nav = useNavigate();
    const loc = useLocation();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

    useEffect(() => {
        trackPage("access_gate", { next: nextPath });
    }, [nextPath]);

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const daysValid = Number(import.meta.env.VITE_ACCESS_GATE_DAYS_VALID ?? '30');

    useEffect(() => {
        if (accessGate.isEnabled() && accessGate.hasAccess()) {
            nav(nextPath, { replace: true });
        }
    }, [nextPath, nav]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        const normalized = code.trim().toUpperCase();
        if (!normalized) {
            track("access_gate_submit_missing_code", "warn");
            setErr('Ingresa tu código.');
            return;
        }

        track("access_gate_submit", "info", { code_len: normalized.length, next: nextPath });
        setLoading(true);
        try {
            // 1) Validar en modo anon (NO consumir / NO claim)
            const { data: isValid, error: vErr } = await (supabase.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: boolean | null; error: unknown }>)('validate_invitation', {
                p_code: normalized,
            });
            if (vErr) throw vErr;

            if (!isValid) {
                track("access_gate_code_invalid", "warn", { code_len: normalized.length, next: nextPath });
                setErr('Ese código ya venció o no existe. Pide uno nuevo.');
                return;
            }

            // 2) Guardar pase local para permitir navegar el piloto (sin quemar el código)
            accessGate.grant(`CODE:${normalized}`, Number.isFinite(daysValid) ? daysValid : 30);
            track("access_gate_granted_local", "info", { days_valid: daysValid, next: nextPath });

            // 3) Entrar
            nav(nextPath, { replace: true });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            track("access_gate_error", "error", { message: msg.slice(0, 160) });
            setErr(msg || 'Ese código no calza. Revisa y prueba de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-shadow hover:shadow-2xl hover:shadow-2xl/60">
                    <h1 className="text-xl font-black text-slate-900">Acceso por invitación</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Si tienes código, entra. Si no, comunícate con un administrador.
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
                                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-900 uppercase"
                                autoFocus
                            />
                            <p className="text-[11px] text-slate-500 mt-2 font-medium">Respeta mayúsculas y guiones.</p>
                            {err && <p className="text-sm text-red-600 mt-2 font-medium">{err}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Verificando código…' : 'Entrar'}
                        </button>

                        {/* Admin bypass (visible para todos, valida rol en el click) */}
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        // Validar primero si hay una sesión activa real de Supabase
                                        const { data: { user: currentUser } } = await supabase.auth.getUser();

                                        if (!currentUser || currentUser.is_anonymous) {
                                            nav('/admin-login');
                                            return;
                                        }

                                        // Requiere que exista tabla users con role y que el usuario ya esté autenticado
                                        const { data, error } = await supabase
                                            .from("users")
                                            .select("role")
                                            .eq("user_id", currentUser.id)
                                            .single();

                                        if (error) {
                                            nav('/admin-login');
                                            return;
                                        }

                                        if (data?.role === "admin") {
                                            track("access_gate_admin_bypass", "info");
                                            localStorage.setItem("opina_access_pass", "admin");
                                            window.location.href = "/";
                                        } else {
                                            nav('/admin-login');
                                        }
                                    } catch (err) {
                                        logger.error("Bypass admin error", err);
                                        nav('/admin-login');
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
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
                        className="text-[12px] font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-wider"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
            <FeedbackFab />
        </div>
    );
}
