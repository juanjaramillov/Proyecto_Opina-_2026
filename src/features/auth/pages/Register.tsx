import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import { authService } from "../services/authService";
import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

function getParam(search: string, key: string) {
    return new URLSearchParams(search).get(key);
}

function getNext(search: string) {
    const n = getParam(search, "next");
    return n && n.startsWith("/") ? n : "/";
}

export default function RegisterPage() {
    const nav = useNavigate();
    const loc = useLocation();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data: s } = await supabase.auth.getSession();
            if (s?.session) nav("/complete-profile", { replace: true });
        })();
    }, [nav]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        const e1 = email.trim();
        if (!e1) {
            setErr("Ingresa tu email.");
            return;
        }

        if (password.length < 8) {
            setErr("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirm) {
            setErr("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            await authService.registerWithEmail(e1, password);
            // Después de registrarse, se completa perfil (claim de invitación + nickname)
            nav("/complete-profile", { replace: true });
        } catch (e: any) {
            logger.error(e);
            setErr(e?.message ?? "No se pudo crear la cuenta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle="Crea tu cuenta para participar y acceder a tus resultados."
        >
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Email
                    </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="tu@email.com"
                        type="email"
                        required
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Contraseña
                    </label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="Mínimo 8 caracteres"
                        type="password"
                        required
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Confirmar contraseña
                    </label>
                    <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="Repite tu contraseña"
                        type="password"
                        required
                    />
                </div>

                {err && <p className="text-sm text-rose-600 font-bold">{err}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                >
                    {loading ? "Creando..." : "Crear cuenta"}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 font-medium">
                        ¿Ya tienes cuenta?{" "}
                        <Link to={`/login?next=${encodeURIComponent(nextPath)}`} className="font-black text-indigo-700 hover:text-indigo-800">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
