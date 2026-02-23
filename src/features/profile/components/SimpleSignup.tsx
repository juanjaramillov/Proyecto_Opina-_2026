import { useState } from 'react';
import { authService as profileService } from '../../auth';
import { motion } from 'framer-motion';
import { useToast } from '../../../components/ui/useToast';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../lib/logger';
import { supabase } from '../../../supabase/client';

export default function SimpleSignup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("Por favor ingresa tu nombre", "info");
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            showToast("Por favor ingresa un email válido", "info");
            return;
        }
        if (password.length < 8) {
            showToast("La contraseña debe tener al menos 8 caracteres", "info");
            return;
        }

        const isInviteOnly = import.meta.env.VITE_INVITE_ONLY === "true";
        if (isInviteOnly && !inviteCode) {
            showToast("Se requiere un código de invitación", "info");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isInviteOnly) {
                const { data: isValid, error: inviteError } = await (supabase as any).rpc(
                    "validate_invitation",
                    { p_code: inviteCode.trim().toUpperCase() }
                ) as { data: boolean; error: any };

                if (inviteError) throw inviteError;
                if (!isValid) {
                    showToast("Código de invitación inválido o agotado", "error");
                    setIsSubmitting(false);
                    return;
                }
            }

            await profileService.registerWithEmail(email, password);

            if (isInviteOnly) {
                await (supabase as any).rpc("consume_invitation", { p_code: inviteCode.trim().toUpperCase() });
            }
            showToast("¡Cuenta creada exitosamente!", "success");
            navigate('/complete-profile');
        } catch (error: any) {
            logger.error("Error creating account:", error);

            let errorMsg = "No se pudo crear la cuenta. Reintenta.";
            if (error?.message?.includes('invalid format')) {
                errorMsg = "El formato del correo o el dominio no son válidos.";
            } else if (error?.status === 429) {
                errorMsg = "Demasiados intentos. Espera un momento antes de reintentar.";
            } else {
                errorMsg = error?.message || errorMsg;
            }

            showToast(errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <span className="material-symbols-outlined text-white">verified_user</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-ink">Registro Oficial</h2>
                        <p className="text-sm text-slate-500 font-medium">Accede desde cualquier dispositivo.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Nickname público <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: AereoGeek, CactusAzul, etc."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-ink"
                            required
                        />
                        <p className="text-[10px] text-slate-400 ml-1">No uses tu nombre real. Este nickname se verá en rankings y resultados.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Tu Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-ink"
                            required
                        />
                    </div>

                    {import.meta.env.VITE_INVITE_ONLY === "true" && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Código de Invitación <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Ej. OPINA-DEMO-001"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-ink uppercase"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-ink"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin material-symbols-outlined">sync</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">person_add</span>
                                Crear Cuenta
                            </>
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
