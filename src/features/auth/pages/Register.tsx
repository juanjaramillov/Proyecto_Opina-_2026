import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../../../supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
    const { refreshProfile } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const isInviteOnly = import.meta.env.VITE_INVITE_ONLY === "true";
        if (isInviteOnly && !inviteCode) {
            setError("Se requiere un código de invitación para registrarse.");
            return;
        }

        setLoading(true);
        try {
            if (isInviteOnly) {
                const { data: isValid, error: inviteError } = await (supabase as any).rpc(
                    "validate_invitation",
                    { p_code: inviteCode.trim().toUpperCase() }
                ) as { data: boolean; error: any };

                if (inviteError) throw inviteError;
                if (!isValid) {
                    setError("El código de invitación es inválido, ha expirado o ya no tiene usos disponibles.");
                    setLoading(false);
                    return;
                }
            }

            await authService.registerWithEmail(email.trim(), password);

            if (isInviteOnly) {
                await (supabase as any).rpc("consume_invitation", { p_code: inviteCode.trim().toUpperCase() });
            }

            // Wait for context and data sync
            setIsSyncing(true);
            await refreshProfile();

            const profile = await authService.getEffectiveProfile();
            if (profile.isProfileComplete) {
                navigate("/");
            } else {
                navigate("/complete-profile");
            }
        } catch (err: any) {
            setError(err.message || "Error al crear la cuenta. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-white"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-brand mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                            <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Crear Cuenta</h1>
                    <p className="text-slate-500 mt-2">Únete a Opina+ y sé parte de la señal.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    {import.meta.env.VITE_INVITE_ONLY === "true" && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Código de Invitación
                            </label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Ej: OPINA-DEMO-001"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700 uppercase"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isSyncing || !email || !password || !confirmPassword}
                        className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading || isSyncing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isSyncing ? "Sincronizando..." : "Creando..."}
                            </>
                        ) : (
                            "Registrarme"
                        )}
                    </button>
                </form>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm text-center font-medium overflow-hidden"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
