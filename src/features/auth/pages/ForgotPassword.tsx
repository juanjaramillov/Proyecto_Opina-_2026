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
            // Drimo #10: NO incluir email en el mensaje del log — el message no pasa
            // por sanitizePayload. Pasarlo como context (key 'email' está en sensitiveKeys
            // y se redacta a [REDACTED] en cualquier log emitido).
            logger.info("Solicitud de reset de contraseña iniciada", { domain: 'auth', action: 'request_reset', email: email.trim() });
            await authService.resetPasswordForEmail(email.trim());

            setNotice({
                variant: "success",
                message: "Listo. Revisa tu correo.",
            });
        } catch (err: unknown) {
            const e = err as Error;
            logger.error("Error en reset de contraseña", { domain: 'auth', action: 'request_reset' }, e);
            setNotice({
                variant: "error",
                message: e.message || "Algo falló. Intenta de nuevo.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar contraseña"
            subtitle="Te mandamos un link. Revisa spam si se pone pesado."
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
                    loadingLabel="Un segundo…"
                >
                    Enviar link
                </AuthPrimaryButton>
            </form>

            <AuthNotice message={notice?.message} variant={notice?.variant || "info"} />

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    <Link to="/login" className="text-brand font-bold hover:underline">
                        Volver a Entrar
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
