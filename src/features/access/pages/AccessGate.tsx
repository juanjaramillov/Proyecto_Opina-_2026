import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { accessGate } from '../services/accessGate';

function getNext(search: string) {
    const params = new URLSearchParams(search);
    const next = params.get('next');
    return next && next.startsWith('/') ? next : '/';
}

export default function AccessGatePage() {
    const nav = useNavigate();
    const loc = useLocation();
    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

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
                setErr('Código inválido, expirado o revocado.');
                return;
            }

            // 2) Guardar pase local para permitir navegar el piloto (sin quemar el código)
            accessGate.grant(`CODE:${normalized}`, Number.isFinite(daysValid) ? daysValid : 30);

            // 3) Entrar
            nav(nextPath, { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? 'No se pudo validar el código.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h1 className="text-xl font-black text-slate-900">Acceso por código</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Ingresa tu código para entrar al piloto.
                    </p>

                    <form onSubmit={submit} className="space-y-4 mt-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Código de acceso
                            </label>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Ej: OP-1A2B3C4D"
                                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900 uppercase"
                                autoFocus
                            />
                            {err && <p className="text-sm text-red-600 mt-2 font-medium">{err}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Validando...' : 'Entrar'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                accessGate.revoke();
                                setCode('');
                            }}
                            className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all disabled:opacity-50"
                        >
                            Limpiar
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <button
                            onClick={() => nav('/admin-login')}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Ingreso Administradores
                        </button>
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest opacity-70">
                    Opina+ • Piloto controlado
                </p>
            </div>
        </div>
    );
}
