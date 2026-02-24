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

        const normalized = code.trim();
        if (!normalized) {
            setErr('Ingresa tu código.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .rpc('consume_access_gate_code', { p_code: normalized })
                .single();

            if (error) throw error;
            const tokenId = data?.token_id;
            if (!tokenId) throw new Error('No se pudo validar el código.');

            accessGate.grant(tokenId, Number.isFinite(daysValid) ? daysValid : 30);
            nav(nextPath, { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? 'Código inválido.');
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
                                placeholder="Ej: OP-1a2b3c4d"
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
                            onClick={() => { accessGate.revoke(); setCode(''); setErr(null); }}
                            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                        >
                            Cambiar código
                        </button>
                    </form>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest opacity-70">
                    Opina+ • Piloto controlado
                </p>
            </div>
        </div>
    );
}
