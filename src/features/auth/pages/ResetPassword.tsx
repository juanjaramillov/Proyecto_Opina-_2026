import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";
import AuthLayout from "../layout/AuthLayout";
import { AuthNotice, AuthPrimaryButton, AuthTextInput } from "../components/AuthControls";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<{ variant: "success" | "error" | "info"; message: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            logger.log("=== RESET PASSWORD: session:", !!session);
            if (!session) {
                setNotice({
                    variant: "info",
                    message:
                        "Ojo: el enlace puede estar expirado o inválido. Si falla, pide otro (sí, es fome).",
                });
            }
        });
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotice(null);

        if (password.length < 8) {
            setNotice({ variant: "error", message: "La contraseña debe tener al menos 8 caracteres." });
            return;
        }

        if (password !== confirmPassword) {
            setNotice({ variant: "error", message: "Las contraseñas no coinciden." });
            return;
        }

        setLoading(true);
        try {
            await authService.updateUserPassword(password);

            setNotice({ variant: "success", message: "Contraseña actualizada. Te llevamos al inicio." });

            setTimeout(() => navigate("/"), 1500);
        } catch (err: unknown) {
            const e = err as Error;
            logger.error("=== RESET PASSWORD: Error", e);
            setNotice({ variant: "error", message: e.message || "Error al actualizar. Reintenta." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Nueva contraseña"
            subtitle="8+ caracteres. No “12345678”. Te estoy mirando."
        >
            <form onSubmit={handleUpdate} className="space-y-4">
                <AuthTextInput
                    label="Nueva contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="8+ caracteres"
                    required
                    autoComplete="new-password"
                />

                <AuthTextInput
                    label="Confirmar contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repite tu contraseña"
                    required
                    autoComplete="new-password"
                />

                <AuthPrimaryButton
                    disabled={!password || !confirmPassword}
                    loading={loading}
                    loadingLabel="Actualizando..."
                >
                    Actualizar contraseña
                </AuthPrimaryButton>
            </form>

            <AuthNotice message={notice?.message} variant={notice?.variant || "info"} />
        </AuthLayout>
    );
}
