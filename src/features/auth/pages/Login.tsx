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

function getReasonText(reason: string | null, next: string) {
    if (!reason) return null;

    if (reason === "results") return "Inicia sesión para ver Resultados.";
    if (reason === "rankings") return "Inicia sesión para ver Rankings.";
    if (reason === "profile") return "Inicia sesión para ver tu Perfil.";
    if (reason === "b2b") return "Inicia sesión para acceder al módulo B2B.";

    // fallback genérico
    if (next && next !== "/") return "Inicia sesión para continuar.";
    return null;
}

export default function LoginPage() {
    const nav = useNavigate();
    const loc = useLocation();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);
    const reason = useMemo(() => getParam(loc.search, "reason"), [loc.search]);
    const reasonText = useMemo(() => getReasonText(reason, nextPath), [reason, nextPath]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        // Si ya está logueado, no mostrar login
        (async () => {
            const { data: s } = await supabase.auth.getSession();
            if (s?.session) nav(nextPath, { replace: true });
        })();
    }, [nextPath, nav]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            await authService.loginWithEmail(email.trim(), password);
            nav(nextPath, { replace: true });
        } catch (e: any) {
            logger.error(e);
            setErr(e?.message ?? "No se pudo iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle={
                <div className="flex flex-col gap-2">
                    {reasonText && (
                        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
                            <p className="text-sm font-bold text-primary-700">{reasonText}</p>
                        </div>
                    )}
                    <span className="text-slate-500 font-medium">
                        Accede para participar, ver resultados y seguir tu progreso.
                    </span>
                </div>
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Email
                    </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-900"
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
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="••••••••"
                        type="password"
                        required
                    />
                </div>

                {err && <p className="text-sm text-rose-600 font-bold">{err}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 font-medium">
                        ¿No tienes cuenta?{" "}
                        <Link to={`/register?next=${encodeURIComponent(nextPath)}`} className="font-black text-primary-700 hover:text-primary-800">
                            Crear cuenta
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
