import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import { authService } from "../services/authService";
import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import { accessGate } from "../../access/services/accessGate";

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
        // Redirigir a Access Gate si no tiene token y está encendido, excepto si es admin-login
        if (loc.pathname !== '/admin-login' && accessGate.isEnabled() && !accessGate.hasAccess()) {
            nav(`/access?next=${encodeURIComponent(loc.pathname + loc.search)}`, { replace: true });
            return;
        }

        // Si ya está logueado y no es anónimo, verificar si es admin
        (async () => {
            const { data: s } = await supabase.auth.getSession();
            
            if (s?.session) {
                if (loc.pathname === '/admin-login') {
                    // Si intenta loguearse como admin y ya tiene sesión, verificar su rol
                    const { data: userData } = await supabase.from('users').select('role').eq('user_id', s.session.user.id).single();
                    if (userData?.role === 'admin') {
                        localStorage.setItem("opina_access_pass", "admin");
                        window.location.href = "/";
                        return;
                    } else {
                        // Es un usuario normal (o anónimo), pero quiere entrar al panel de admin.
                        // Lo deslogueamos para que pueda poner sus credenciales de administrador reales.
                        await authService.signOut();
                    }
                } else if (!s.session.user.is_anonymous) {
                    // Si no es admin-login, y es un usuario normal (no anónimo), lo mandamos a la app
                    nav(nextPath, { replace: true });
                }
            }
        })();
    }, [nextPath, nav, loc]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            await authService.loginWithEmail(email.trim(), password);
            
            // Si es admin, otorgar el bypass automáticamente
            const { data: s } = await supabase.auth.getSession();
            if (s?.session) {
                const { data: userData } = await supabase.from('users').select('role').eq('user_id', s.session.user.id).single();
                if (userData?.role === 'admin') {
                    localStorage.setItem("opina_access_pass", "admin");
                }
            }
            
            nav(nextPath, { replace: true });
        } catch (error) {
            logger.error("Error en login con email", error);
            setErr("Email o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Entrar"
            subtitle={
                <div className="flex flex-col gap-2">
                    {reasonText && (
                        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
                            <p className="text-sm font-bold text-primary-700">{reasonText}</p>
                        </div>
                    )}
                    <span className="text-slate-600 font-medium">
                        Bienvenido de vuelta. Tu opinión define la tendencia.
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
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/20 outline-none transition-all font-bold text-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        placeholder="tu@correo.com"
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
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/20 outline-none transition-all font-bold text-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        placeholder="••••••••"
                        type="password"
                        required
                    />
                </div>

                {err && <p className="text-sm text-rose-600 font-bold">{err}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black transition-all hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-sm"
                >
                    {loading ? "Un segundo…" : "Entrar"}
                </button>

                <div className="flex justify-between items-center pt-2">
                    <Link to="/forgot-password" className="text-[11px] font-black text-slate-500 hover:text-primary-700 transition">
                        Olvidé mi contraseña
                    </Link>
                    <p className="text-[11px] text-slate-500 font-semibold">
                        ¿No tienes cuenta?{" "}
                        <Link to={`/register?next=${encodeURIComponent(nextPath)}`} className="font-black text-primary-700 hover:text-primary-800 transition">
                            Crear cuenta
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
