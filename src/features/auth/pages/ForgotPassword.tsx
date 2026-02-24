import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { AuthNotice, AuthPrimaryButton, AuthTextInput } from "../components/AuthControls";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<{ variant: "success" | "error" | "info"; message: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotice(null);

        try {
            logger.log("=== FORGOT PASSWORD: Sending reset for", email.trim());
            await authService.resetPasswordForEmail(email.trim());

            setNotice({
                variant: "success",
                message:
                    "Listo. Si ese correo existe en Opina+, le llegará un enlace. (Privacidad primero.)",
            });
        } catch (err: unknown) {
            const e = err as Error;
            logger.error("=== FORGOT PASSWORD: Error", e);
            setNotice({
                variant: "error",
                message: e.message || "No se pudo enviar el correo. Reintenta.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar acceso"
            subtitle="Te mandamos un enlace de recuperación. Sin preguntas incómodas."
        >
            <form onSubmit={handleReset} className="space-y-4">
                <AuthTextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                />

                <AuthPrimaryButton
                    disabled={!email}
                    loading={loading}
                    loadingLabel="Enviando..."
                >
                    Enviar enlace
                </AuthPrimaryButton>
            </form>

            <AuthNotice message={notice?.message} variant={notice?.variant || "info"} />

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
