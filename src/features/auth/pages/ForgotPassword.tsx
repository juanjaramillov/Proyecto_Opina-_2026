import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "../../../lib/logger";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            logger.log("=== FORGOT PASSWORD: Sending reset for", email.trim());
            await authService.resetPasswordForEmail(email.trim());
            logger.log("=== FORGOT PASSWORD: Reset link sent successfully");
            setSuccess(true);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error("=== FORGOT PASSWORD: Error", error);
            setError(error.message || "No se pudo enviar el correo. Por favor intenta nuevamente.");
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recuperar Contraseña</h1>
                    <p className="text-slate-500 mt-2">Ingresa tu email para recibir un enlace de recuperación.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleReset} className="space-y-4">
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

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 active:scale-[0.98]"
                        >
                            {loading ? "Enviando..." : "Enviar enlace"}
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
                        <h3 className="text-lg font-bold text-slate-900 mb-2">¡Enlace enviado!</h3>
                        <p className="text-sm text-slate-600">
                            Si el correo <span className="font-semibold text-slate-900">{email}</span> está registrado, recibirás un enlace para crear tu nueva contraseña.
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

                <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                            Volver al inicio de sesión
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
