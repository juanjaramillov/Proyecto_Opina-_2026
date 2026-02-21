import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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
            console.log("=== LOGIN FLOW: Starting for ===", email.trim());
            await authService.loginWithEmail(email.trim(), password);

            console.log("=== LOGIN FLOW: Auth Success, refreshing profile...");
            // Wait for context to update
            setIsSyncing(true);
            await refreshProfile();

            console.log("=== LOGIN FLOW: Profile synced, checking tier and navigating...");
            navigate("/");
        } catch (err: any) {
            console.error("=== LOGIN FLOW: Critical Error ===", err);
            setError(err.message || "Credenciales inválidas. Por favor intenta nuevamente.");
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Iniciar Sesión</h1>
                    <p className="text-slate-500 mt-2">Bienvenido de vuelta a Opina+.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
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
                            placeholder="Ingresa tu contraseña"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-700"
                            required
                        />
                    </div>

                    <div className="flex justify-end mt-1">
                        <Link to="/forgot-password" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isSyncing || !email || !password}
                        className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading || isSyncing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isSyncing ? "Sincronizando..." : "Entrando..."}
                            </>
                        ) : (
                            "Iniciar Sesión"
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
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
