import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { notifyService, formatKnownError } from '../../notifications/notifyService';

import { analyticsService } from '../../analytics/services/analyticsService';
import StepIdentity from './onboarding/StepIdentity';
import StepDemographics from './onboarding/StepDemographics';
import StepSuccess from './onboarding/StepSuccess';

interface OnboardingFlowProps {
    onClose: () => void;
    onSuccess: () => void;
    isMandatory?: boolean;
    initialStep?: Step;
}

type Step = 'identity' | 'demographics' | 'success';
type Mode = 'register' | 'login';

export default function OnboardingFlow({ onClose, onSuccess, isMandatory = false, initialStep = 'identity' }: OnboardingFlowProps) {
    const [step, setStep] = useState<Step>(initialStep);
    const [mode, setMode] = useState<Mode>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inviteCode, setInviteCode] = useState('');
    const [nickname, setNickname] = useState('');

    // Demographics State
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [region, setRegion] = useState('');

    // Recover OAuth bootstrap data on mount
    useState(() => {
        const stored = authService.getStoredOAuthBootstrap();
        if (stored) {
            setNickname(stored.nickname);
            setInviteCode(stored.inviteCode);
            // Si hay datos guardados, es probable que vengamos de un redirect exitoso
            // pero el bootstrap se disparará en el ciclo de vida de AuthContext o aquí si hay sesión activa.
        }
    });

    const handleOAuth = async (provider: 'google' | 'apple') => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (mode === 'register') {
                if (!nickname.trim() || inviteCode.trim().length < 4) {
                    throw new Error("Ingresa tu Alias y Código de invitación antes de continuar.");
                }
                // Persistimos para recuperarlo tras el redirect
                authService.prepareOAuthBootstrap(nickname, inviteCode);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            // Si es OAuth, Supabase maneja la redirección.
            // Tras volver, el authService.getEffectiveProfile() detectará la sesión real.
            // Nota: En OAuth el chequeo del código se hará al recargar la app (verificación externa) o mediante un middleware.
        } catch (err: unknown) {
            logger.error('OAuth falló', err);
            const msg = formatKnownError(err) || (err instanceof Error ? err.message : 'Error al conectar con el proveedor');
            setErrorMsg(msg);
            notifyService.error(msg);
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (mode === 'register') {
                if (!nickname.trim() || inviteCode.trim().length < 4) {
                    throw new Error("Por favor ingresa un código de invitación válido y un nickname.");
                }
                await authService.registerWithEmail(email, password);
            } else {
                await authService.loginWithEmail(email, password);
            }

            // Check Bootstrap status
            const bs = await authService.getBootstrapStatus();

            if (bs.needsBootstrap) {
                if (!nickname.trim() || !inviteCode.trim()) {
                    await authService.signOut();
                    throw new Error('Debes proveer un código de invitación válido para tu primera sesión.');
                }
                try {
                    await authService.bootstrapUserAfterSignup(nickname, inviteCode);
                } catch (bsErr: unknown) {
                    await authService.signOut();
                    analyticsService.trackSystem("auth_bootstrap_failed", "warn", { mode, error: bsErr });
                    throw new Error("Código inválido / expirado / ya usado.");
                }
            }

            // Si funciona correctamente, pasamos al step de demográficos
            analyticsService.trackSystem("auth_email_success", "info", { mode });
            setStep('demographics');
        } catch (err: unknown) {
            logger.error('Email auth falló', err);
            const msg = formatKnownError(err) || (err instanceof Error ? err.message : 'Error en las credenciales');
            setErrorMsg(msg);
            notifyService.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemographics = async () => {
        setLoading(true);
        try {
            await authService.updateProfileDemographics({
                gender,
                ageBucket: ageRange,
                region,
                profileStage: 1,
                signalWeight: 1.0
            });
            analyticsService.trackSystem("profile_stage_1_completed", "info", { source: "onboarding", gender, region, age_bucket: ageRange });
            analyticsService.trackSystem("onboarding_completed", "info");
            setStep('success');
        } catch (err: unknown) {
            logger.error('Actualización de demográficos falló', err);
            const msg = formatKnownError(err) || (err instanceof Error ? err.message : 'Error al guardar perfil. Intenta nuevamente.');
            setErrorMsg(msg);
            notifyService.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait" custom={step === 'identity' ? -1 : 1}>
                {step === 'identity' && (
                    <StepIdentity
                        mode={mode}
                        setMode={setMode}
                        nickname={nickname}
                        setNickname={setNickname}
                        inviteCode={inviteCode}
                        setInviteCode={setInviteCode}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        errorMsg={errorMsg}
                        setErrorMsg={setErrorMsg}
                        loading={loading}
                        onOAuth={handleOAuth}
                        onEmailAuth={handleEmailAuth}
                        variants={variants}
                    />
                )}


                {step === 'demographics' && (
                    <StepDemographics
                        gender={gender}
                        setGender={setGender}
                        ageRange={ageRange}
                        setAgeRange={setAgeRange}
                        region={region}
                        setRegion={setRegion}
                        errorMsg={errorMsg}
                        loading={loading}
                        onSave={handleDemographics}
                        variants={variants}
                    />
                )}


                {step === 'success' && (
                    <StepSuccess onSuccess={onSuccess} variants={variants} />
                )}
            </AnimatePresence>

            {(!isMandatory || step === 'success') && (
                <div className="p-4 bg-slate-50 flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 p-2 rounded-lg"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
    );
}
