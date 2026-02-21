import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabase/client";

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
            console.log("=== RESET PASSWORD: Link validation session status:", !!session);
            if (!session) {
                console.warn("=== RESET PASSWORD: No active session found. The link may be expired or invalid.");
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
            console.log("=== RESET PASSWORD: Attempting password update...");
            await authService.updateUserPassword(password);
            console.log("=== RESET PASSWORD: Password updated successfully");
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("=== RESET PASSWORD: Error during update", error);
            setError(error.message || "Error al actualizar la contraseña. Reintenta.");
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nueva Contraseña</h1>
                    <p className="text-slate-500 mt-2">Crea una nueva contraseña para tu cuenta.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Nueva Contraseña
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

                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 active:scale-[0.98]"
                        >
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">¡Contraseña Actualizada!</h3>
                        <p className="text-sm text-slate-600">
                            Redirigiendo al inicio...
                        </p>
                    </motion.div>
                )}

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
            </motion.div>
        </div>
    );
}
