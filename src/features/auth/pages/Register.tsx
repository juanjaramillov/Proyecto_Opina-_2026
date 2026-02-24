import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { signupCooldown } from "../services/signupCooldown";
import CheckEmail from "./CheckEmail";

export default function Register() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        const e1 = email.trim();
        if (!e1) return setErr("Ingresa tu email.");
        if (password.length < 8) return setErr("La contraseña debe tener al menos 8 caracteres.");

        if (signupCooldown.isActive()) {
            return setErr(`Espera ${signupCooldown.secondsLeft()}s antes de intentar de nuevo.`);
        }

        setLoading(true);
        signupCooldown.start(30);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: e1,
                password,
                options: {
                    // Si en tu proyecto tienes confirmación por email activada,
                    // Supabase podría usar redirectTo para el link.
                    // redirectTo: window.location.origin + "/login",
                },
            });

            if (error) throw error;

            const hasSession = Boolean(data?.session);

            // Si no hay sesión inmediata => requiere confirmación email
            if (!hasSession) {
                setSignupEmail(e1);
                setNeedsEmailConfirm(true);
                return;
            }

            // Sesión inmediata => onboarding
            nav("/complete-profile", { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? "No se pudo crear la cuenta.");
        } finally {
            setLoading(false);
        }
    };

    if (needsEmailConfirm) {
        return <CheckEmail email={signupEmail} />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h1 className="text-xl font-black text-slate-900">Crear cuenta</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Después elegirás tu Nickname (anónimo).
                </p>

                <form onSubmit={onSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-900"
                            placeholder="tu@email.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-900"
                            placeholder="Mínimo 8 caracteres"
                            autoComplete="new-password"
                        />
                    </div>

                    {err && <p className="text-sm text-red-600 font-medium">{err}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all disabled:opacity-50 shadow-sm"
                    >
                        {loading ? "Creando..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="text-sm text-slate-600 mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="font-bold text-indigo-700">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}
