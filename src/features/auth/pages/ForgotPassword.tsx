import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";

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
        <AuthLayout
            title="Recuperar Contraseña"
            subtitle="Ingresa tu email para recibir un enlace de recuperación."
        >
            {!success ? (
                <form onSubmit={handleReset} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                    >
                        {loading ? "Enviando..." : "Enviar enlace"}
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
                    <h3 className="text-lg font-black text-slate-900 mb-2">¡Enlace enviado!</h3>
                    <p className="text-sm text-slate-600 px-4">
                        Si el correo <span className="font-bold text-slate-900">{email}</span> está registrado, recibirás un enlace para crear tu nueva contraseña.
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

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline transition-all">
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
