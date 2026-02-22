import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";

export default function Login() {
    const { refreshProfile } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            logger.log("=== LOGIN FLOW: Starting for ===", email.trim());
            await authService.loginWithEmail(email.trim(), password);

            logger.log("=== LOGIN FLOW: Auth Success, refreshing profile...");
            // Wait for context to update
            setIsSyncing(true);
            await refreshProfile();

            logger.log("=== LOGIN FLOW: Profile synced, checking tier and navigating...");
            navigate("/");
        } catch (err: unknown) {
            const error = err as Error;
            logger.error("=== LOGIN FLOW: Critical Error ===", error);
            // Hacer el mensaje de error mas amigable
            if (error.message?.includes('Invalid login credentials')) {
                setError("Correo o contraseña incorrectos. Verifica tus datos.");
            } else {
                setError(error.message || "Credenciales inválidas. Por favor intenta nuevamente.");
            }
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    return (
        <AuthLayout
            title="Iniciar Sesión"
            subtitle="Bienvenido de vuelta a Opina+."
        >

            <form onSubmit={handleLogin} className="space-y-5">
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

                <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                            Contraseña
                        </label>
                        <Link to="/forgot-password" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mr-1">
                            ¿Olvidaste tu clave?
                        </Link>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || isSyncing || !email || !password}
                    className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading || isSyncing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {isSyncing ? "Sincronizando..." : "Conectando..."}
                        </>
                    ) : (
                        "Entrar al Motor"
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
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-indigo-600 font-bold hover:underline transition-all">
                        Regístrate
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
