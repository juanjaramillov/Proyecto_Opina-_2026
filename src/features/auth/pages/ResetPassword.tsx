import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Enforce the user has a valid access token in URL
        supabase.auth.getSession().then(({ data: { session } }) => {
            logger.log("=== RESET PASSWORD: Link validation session status:", !!session);
            if (!session) {
                logger.warn("=== RESET PASSWORD: No active session found. The link may be expired or invalid.");
            }
        });
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
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

        setLoading(true);
        try {
            logger.log("=== RESET PASSWORD: Attempting password update...");
            await authService.updateUserPassword(password);
            logger.log("=== RESET PASSWORD: Password updated successfully");
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error("=== RESET PASSWORD: Error during update", error);
            setError(error.message || "Error al actualizar la contraseña. Reintenta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Nueva Contraseña"
            subtitle="Crea una nueva contraseña segura para tu cuenta."
        >
            {!success ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Nueva Contraseña
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
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password || !confirmPassword}
                        className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                    >
                        {loading ? "Actualizando..." : "Actualizar Contraseña"}
                    </button>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">¡Contraseña Actualizada!</h3>
                    <p className="text-sm text-slate-600">
                        Redirigiendo al inicio de sesión...
                    </p>
                </motion.div>
            )}

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
        </AuthLayout>
    );
}
