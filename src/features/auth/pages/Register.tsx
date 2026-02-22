import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../../../supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../layout/AuthLayout";

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
                const { data: isValid, error: inviteError } = await (supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: boolean; error: Error | null }> }).rpc(
                    "validate_invitation",
                    { p_code: inviteCode.trim().toUpperCase() }
                );

                if (inviteError) throw inviteError;
                if (!isValid) {
                    setError("El código de invitación es inválido, ha expirado o ya no tiene usos disponibles.");
                    setLoading(false);
                    return;
                }
            }

            await authService.registerWithEmail(email.trim(), password);

            if (isInviteOnly) {
                await (supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<void> }).rpc("consume_invitation", { p_code: inviteCode.trim().toUpperCase() });
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
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message?.includes('already registered')) {
                setError("Este correo electrónico ya está registrado.");
            } else {
                setError(error.message || "Error al crear la cuenta. Por favor intenta nuevamente.");
            }
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    return (
        <AuthLayout
            title="Crear Cuenta"
            subtitle="Únete a Opina+ y sé parte de la señal."
        >

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8+ caracteres"
                            className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Confirmar
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="8+ caracteres"
                            className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>
                </div>

                {import.meta.env.VITE_INVITE_ONLY === "true" && (
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Código de Acceso
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Ej: OPINA-DEMO-001"
                            className="w-full px-5 py-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl text-indigo-900 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black uppercase tracking-wider"
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || isSyncing || !email || !password || !confirmPassword}
                    className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading || isSyncing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {isSyncing ? "Sincronizando..." : "Conectando..."}
                        </>
                    ) : (
                        "Registrarme en la Red"
                    )}
                </button>
            </form>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm text-center font-medium overflow-hidden"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline transition-all">
                        Inicia Sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
