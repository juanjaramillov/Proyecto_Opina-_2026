import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { accessGate } from '../services/accessGate';
import FeedbackFab from '../../../components/ui/FeedbackFab';

function getNext(search: string) {
    const params = new URLSearchParams(search);
    const next = params.get('next');
    return next && next.startsWith('/') ? next : '/';
}

export default function AccessGatePage() {
    const nav = useNavigate();
    const loc = useLocation();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

    const [checkingAdmin, setCheckingAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.id) return;

            setCheckingAdmin(true);
            const { data, error } = await (supabase as any)
                .from("users")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (cancelled) return;

            setCheckingAdmin(false);

            if (!error && data?.role === "admin") {
                // Marca pase y entra
                localStorage.setItem("opina_access_pass", "admin");
                window.location.href = "/";
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, []);

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
            setErr('Ingresa tu código.');
            return;
        }

        setLoading(true);
        try {
            // 1) Validar en modo anon (NO consumir / NO claim)
            const { data: isValid, error: vErr } = await (supabase as any).rpc('validate_invitation', {
                p_code: normalized,
            });
            if (vErr) throw vErr;

            if (!isValid) {
                setErr('Ese código ya venció o no existe. Pide uno nuevo.');
                return;
            }

            // 2) Guardar pase local para permitir navegar el piloto (sin quemar el código)
            accessGate.grant(`CODE:${normalized}`, Number.isFinite(daysValid) ? daysValid : 30);

            // 3) Entrar
            nav(nextPath, { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? 'Ese código no calza. Revisa y prueba de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-shadow hover:shadow-2xl hover:shadow-slate-200/60">
                    <h1 className="text-xl font-black text-slate-900">Acceso por invitación</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Si tienes código, entra. Si no, comunícate con un administrador.
                    </p>

                    {checkingAdmin && (
                        <div className="mt-4 mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-center text-slate-600 font-semibold shadow-sm">
                            Verificando acceso de administrador…
                        </div>
                    )}

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
                                    // Validar primero si hay una sesión activa de Supabase
                                    const { data: { user: currentUser } } = await supabase.auth.getUser();

                                    if (!currentUser) {
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
                                        alert("No se pudo validar rol admin.");
                                        return;
                                    }

                                    if ((data as any)?.role === "admin") {
                                        localStorage.setItem("opina_access_pass", "admin");
                                        window.location.href = "/";
                                    } else {
                                        alert("Solo admins pueden saltar el acceso.");
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
