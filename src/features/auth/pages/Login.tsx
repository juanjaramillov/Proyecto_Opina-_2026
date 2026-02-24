import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { AuthNotice, AuthPrimaryButton, AuthTextInput } from "../components/AuthControls";

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

            setIsSyncing(true);
            await refreshProfile();

            navigate("/");
        } catch (err: unknown) {
            const e = err as Error;
            logger.error("=== LOGIN FLOW: Error ===", e);

            if (e.message?.includes("Invalid login credentials")) {
                setError("Correo o contraseña incorrectos. (Pasa. Reintenta.)");
            } else {
                setError(e.message || "No pudimos iniciar sesión. Reintenta.");
            }
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle="Volvemos al motor. Sin drama."
        >
            <form onSubmit={handleLogin} className="space-y-5">
                <AuthTextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                />

                <AuthTextInput
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Ingresa tu contraseña"
                    required
                    autoComplete="current-password"
                    right={
                        <Link
                            to="/forgot-password"
                            className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                            ¿Olvidaste tu clave?
                        </Link>
                    }
                />

                <AuthPrimaryButton
                    disabled={!email || !password}
                    loading={loading || isSyncing}
                    loadingLabel={isSyncing ? "Sincronizando..." : "Conectando..."}
                >
                    Entrar
                </AuthPrimaryButton>
            </form>

            <AuthNotice message={error} variant="error" />

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                        Regístrate
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
