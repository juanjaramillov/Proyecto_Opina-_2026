import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../../../supabase/client";
import AuthLayout from "../layout/AuthLayout";
import { AuthNotice, AuthPrimaryButton, AuthTextInput } from "../components/AuthControls";

export default function Register() {
    const { refreshProfile } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
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

        const isInviteOnly = import.meta.env.VITE_INVITE_ONLY === "true";
        if (isInviteOnly && !inviteCode) {
            setError("Se requiere un código de invitación para registrarse.");
            return;
        }

        setLoading(true);

        try {
            if (isInviteOnly) {
                const { data: isValid, error: inviteError } = await (supabase as unknown as {
                    rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: boolean; error: Error | null }>;
                }).rpc("validate_invitation", { p_code: inviteCode.trim().toUpperCase() });

                if (inviteError) throw inviteError;

                if (!isValid) {
                    setError("El código es inválido, expiró o ya fue usado.");
                    setLoading(false);
                    return;
                }
            }

            await authService.registerWithEmail(email.trim(), password);

            if (isInviteOnly) {
                await (supabase as unknown as {
                    rpc: (name: string, args: Record<string, unknown>) => Promise<void>;
                }).rpc("consume_invitation", { p_code: inviteCode.trim().toUpperCase() });
            }

            setIsSyncing(true);
            await refreshProfile();

            const profile = await authService.getEffectiveProfile();
            if (profile.isProfileComplete) navigate("/");
            else navigate("/complete-profile");
        } catch (err: unknown) {
            const e = err as Error;
            if (e.message?.includes("already registered")) {
                setError("Este correo ya está registrado.");
            } else {
                setError(e.message || "Error al crear la cuenta. Reintenta.");
            }
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    const isInviteOnly = import.meta.env.VITE_INVITE_ONLY === "true";

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle="Entrar es fácil. Mantener el anonimato es lo difícil. (Nosotros nos encargamos.)"
        >
            <form onSubmit={handleRegister} className="space-y-4">

                <AuthTextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuthTextInput
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="8+ caracteres"
                        required
                        autoComplete="new-password"
                        hint="Mínimo 8 caracteres. Evita 'password123' si quieres vivir tranquilo."
                    />

                    <AuthTextInput
                        label="Confirmar"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Repite la contraseña"
                        required
                        autoComplete="new-password"
                    />
                </div>

                {isInviteOnly && (
                    <AuthTextInput
                        label="Código de acceso"
                        type="text"
                        value={inviteCode}
                        onChange={(v) => setInviteCode(v.toUpperCase())}
                        placeholder="Ej: OPINA-DEMO-001"
                        required
                        tone="invite"
                        hint="Cada código es único. Sí, te estamos midiendo (con cariño)."
                    />
                )}

                <AuthPrimaryButton
                    disabled={!email || !password || !confirmPassword || (isInviteOnly && !inviteCode)}
                    loading={loading || isSyncing}
                    loadingLabel={isSyncing ? "Sincronizando..." : "Creando cuenta..."}
                >
                    Crear cuenta
                </AuthPrimaryButton>
            </form>

            <AuthNotice message={error} variant="error" />

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
