import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import AuthLayout from "../layout/AuthLayout";
import { authService, RegistrationError } from "../services/authService";
import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import { accessGate } from "../../access/services/accessGate";
import { useAuthContext } from "../context/AuthContext";

// Site Key pública de hCaptcha. Se inyecta en build via env var.
// La validación real ocurre en la edge function register-user contra
// el secret server-side, así que exponer la site key es seguro y esperado.
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined;

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
    const { accessState } = useAuthContext();

    const nextPath = useMemo(() => getNext(loc.search), [loc.search]);

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    // Cuando el error es EMAIL_EXISTS mostramos un CTA a login en vez de solo mensaje.
    const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);
    // Token efímero del widget hCaptcha. Se setea en onVerify y se invalida
    // tras un submit (exitoso o fallido) — los tokens son single-use server-side.
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha | null>(null);

    useEffect(() => {
        if (accessGate.isEnabled() && !accessState.isLoading && !accessState.hasAccessGateToken) {
            nav(`/access?next=${encodeURIComponent(loc.pathname + loc.search)}`, { replace: true });
            return;
        }

        (async () => {
            const { data: s } = await supabase.auth.getSession();
            if (s?.session) {
                // Si el usuario no es anónimo, ya está registrado.
                if (!s.session.user.is_anonymous) {
                    nav(nextPath, { replace: true });
                } else {
                    nav("/complete-profile", { replace: true });
                }
            }
        })();
    }, [nav, loc, nextPath, accessState.isLoading, accessState.hasAccessGateToken]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setShowLoginSuggestion(false);

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

        const n1 = nickname.trim();
        if (!n1) {
            setErr("Elige un nickname.");
            return;
        }

        // Bloquear submit si no hay token de hCaptcha. Si la site key no está
        // configurada, dejamos pasar (modo desarrollo) — el backend igual lo
        // exige en producción y devolverá CAPTCHA_FAILED.
        if (HCAPTCHA_SITE_KEY && !captchaToken) {
            setErr("Por favor completa la verificación anti-bot.");
            return;
        }

        setLoading(true);
        try {
            // Registro atómico via Edge Function — evita dejar auth.users huérfanos
            // si el proceso falla a mitad. La función crea auth + users +
            // user_profiles en una sola transacción con rollback.
            await authService.registerWithProfile(e1, password, n1, captchaToken);
            // Si el registro fue exitoso, ya hay sesión iniciada: ir a completar demografía.
            nav("/complete-profile", { replace: true });
        } catch (e: unknown) {
            logger.error('Error en registro atómico', undefined, e);
            // Tokens hCaptcha son single-use — resetear el widget para que el
            // user pueda reintentar sin recargar página.
            captchaRef.current?.resetCaptcha();
            setCaptchaToken(null);

            if (e instanceof RegistrationError) {
                setErr(e.message);
                if (e.code === 'EMAIL_EXISTS') {
                    setShowLoginSuggestion(true);
                }
            } else {
                setErr(e instanceof Error ? e.message : "Algo falló. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle="Tu identidad protegida. Tu opinión estructurada en segundos."
        >
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Email
                    </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="tu@correo.com"
                        type="email"
                        required
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Nickname (Tu apodo en la plataforma)
                    </label>
                    <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="ej: juan_razona"
                        type="text"
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
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="••••••••"
                        type="password"
                        required
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Repite tu contraseña
                    </label>
                    <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="••••••••"
                        type="password"
                        required
                    />
                </div>

                {/* Widget hCaptcha — se renderiza solo si la site key está configurada. */}
                {HCAPTCHA_SITE_KEY && (
                    <div className="flex justify-center pt-1">
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={HCAPTCHA_SITE_KEY}
                            theme="light"
                            size="normal"
                            onVerify={(token: string) => setCaptchaToken(token)}
                            onExpire={() => setCaptchaToken(null)}
                            onError={(e: unknown) => {
                                logger.error('hCaptcha widget error', { domain: 'auth', action: 'captcha_error' }, e);
                                setCaptchaToken(null);
                            }}
                        />
                    </div>
                )}

                {err && (
                    <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
                        <p className="text-sm text-danger-600 font-bold">{err}</p>
                        {showLoginSuggestion && (
                            <div className="mt-2 flex gap-2 items-center">
                                <Link
                                    to={`/login?email=${encodeURIComponent(email.trim())}&next=${encodeURIComponent(nextPath)}`}
                                    className="text-xs font-black text-brand hover:text-brand underline"
                                >
                                    Iniciar sesión
                                </Link>
                                <span className="text-xs text-slate-400">·</span>
                                <Link
                                    to={`/reset-password?email=${encodeURIComponent(email.trim())}`}
                                    className="text-xs font-black text-brand hover:text-brand underline"
                                >
                                    Recuperar contraseña
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand text-white font-black transition-all hover:shadow-lg hover:shadow-brand-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-sm"
                >
                    {loading ? "Un segundo…" : "Crear cuenta"}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 font-medium">
                        ¿Ya tienes cuenta?{" "}
                        <Link to={`/login?next=${encodeURIComponent(nextPath)}`} className="font-black text-brand hover:text-brand">
                            Entrar
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
